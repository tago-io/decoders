/**
 * Hubble network decoder.
 *
 * The Hubble middleware posts each webhook packet as a JSON string under the `hubble_payload`
 * variable, one request per device and several readings per request. This decoder expands that
 * envelope into TagoIO variables and keeps the raw records alongside them.
 *
 * `device.payload` carries vendor bytes that are out of scope here: the network decoder forwards
 * the Base64 string untouched so the device connector can decode it afterwards.
 */

interface HubbleDevice {
	id?: string;
	name?: string;
	payload?: string;
	rssi?: number | null;
	timestamp?: number;
	counter?: number | null;
	sequence_number?: number | null;
	tags?: Record<string, string> | null;
}

interface HubbleLocation {
	latitude?: number;
	longitude?: number;
	altitude?: number | null;
	horizontal_accuracy?: number | null;
	vertical_accuracy?: number | null;
	timestamp?: number;
}

interface HubbleGateway {
	gateway_id?: string;
	service_id?: string;
}

interface HubblePacket {
	device?: HubbleDevice;
	location?: HubbleLocation;
	gateway?: HubbleGateway | null;
	network_type?: string;
}

interface TagoData {
	variable: string;
	value?: string | number | boolean;
	metadata?: Record<string, unknown>;
	location?: { lat: number; lng: number };
	time?: string;
	group?: string;
}

/** Time and group of the raw record, copied onto every variable derived from it. */
interface Stamp {
	time?: string;
	group?: string;
}

const RAW_VARIABLE = "hubble_payload";
const LATITUDE_LIMIT = 90;
const LONGITUDE_LIMIT = 180;
const SECONDS_TO_MILLISECONDS = 1000;

/** Drops null and undefined entries so fields Hubble omitted do not become stored noise. */
function compactMetadata(source: Record<string, unknown>) {
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(source)) {
		if (value !== null && value !== undefined) {
			result[key] = value;
		}
	}
	return result;
}

function isWithinEarthBounds(latitude: number, longitude: number) {
	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
		return false;
	}
	return (
		Math.abs(latitude) <= LATITUDE_LIMIT &&
		Math.abs(longitude) <= LONGITUDE_LIMIT
	);
}

/**
 * Keeps the moment the gateway heard the tag. TagoIO stamps ingestion time when `time` is absent,
 * which would shift every reading to whenever the middleware happened to flush.
 */
function resolveTime(rawTime: unknown, deviceTimestamp: unknown) {
	if (typeof rawTime === "string" && rawTime.length > 0) {
		return rawTime;
	}
	if (typeof deviceTimestamp === "number" && Number.isFinite(deviceTimestamp)) {
		return new Date(deviceTimestamp * SECONDS_TO_MILLISECONDS).toISOString();
	}
	return undefined;
}

function buildStamp(item: any, deviceTimestamp: unknown) {
	const stamp: Stamp = {};
	const time = resolveTime(item?.time, deviceTimestamp);
	if (time) {
		stamp.time = time;
	}
	if (typeof item?.group === "string" && item.group.length > 0) {
		stamp.group = item.group;
	}
	return stamp;
}

/** Expands one Hubble packet into TagoIO variables. Absent blocks yield no variable at all. */
function decodeHubblePacket(packet: HubblePacket, stamp: Stamp) {
	const device = packet?.device;
	if (!device || typeof device !== "object") {
		throw new Error("Packet has no device block");
	}

	const data: TagoData[] = [
		{
			variable: "device",
			value: device.name ?? device.id ?? "",
			metadata: compactMetadata({
				id: device.id,
				name: device.name,
				rssi: device.rssi,
				timestamp: device.timestamp,
				counter: device.counter,
				sequence_number: device.sequence_number,
			}),
			...stamp,
		},
	];

	if (typeof device.payload === "string") {
		data.push({ variable: "payload", value: device.payload, ...stamp });
	}

	const tags = device.tags;
	if (tags && typeof tags === "object" && Object.keys(tags).length > 0) {
		// No `value` here: the tags are the content, and TagoIO keeps `value` optional.
		data.push({ variable: "device_tags", metadata: { ...tags }, ...stamp });
	}

	const location = packet.location;
	if (
		location &&
		typeof location.latitude === "number" &&
		typeof location.longitude === "number" &&
		isWithinEarthBounds(location.latitude, location.longitude)
	) {
		data.push({
			variable: "location",
			location: { lat: location.latitude, lng: location.longitude },
			metadata: compactMetadata({
				altitude: location.altitude,
				horizontal_accuracy: location.horizontal_accuracy,
				vertical_accuracy: location.vertical_accuracy,
				timestamp: location.timestamp,
			}),
			...stamp,
		});
	}

	if (typeof packet.network_type === "string") {
		// Unknown values pass through: the middleware tolerates them and so must this.
		data.push({
			variable: "network_type",
			value: packet.network_type,
			...stamp,
		});
	}

	const gateway = packet.gateway;
	if (gateway && typeof gateway === "object") {
		if (typeof gateway.gateway_id === "string") {
			data.push({
				variable: "gateway_id",
				value: gateway.gateway_id,
				...stamp,
			});
		}
		if (typeof gateway.service_id === "string") {
			data.push({
				variable: "gateway_service_id",
				value: gateway.service_id,
				...stamp,
			});
		}
	}

	return data;
}

/**
 * Decodes every `hubble_payload` in the batch and appends the result, keeping the raw records so
 * operators can still debug from stored data.
 *
 * Never throws. A parser error is returned to the device's HTTP POST response, which would fail the
 * middleware's request and make Hubble redeliver the whole batch, so a malformed packet is reported
 * as a `parse_error` variable and the remaining packets are decoded normally.
 */
function decodeHubblePayload(items: any) {
	if (!Array.isArray(items)) {
		return items;
	}

	const decoded: TagoData[] = [];

	for (const item of items) {
		if (
			!item ||
			item.variable !== RAW_VARIABLE ||
			typeof item.value !== "string"
		) {
			continue;
		}

		try {
			const packet = JSON.parse(item.value) as HubblePacket;
			decoded.push(
				...decodeHubblePacket(
					packet,
					buildStamp(item, packet?.device?.timestamp),
				),
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			// Surfaces in the device's Live Inspector.
			console.error(`${RAW_VARIABLE} could not be decoded: ${message}`);
			decoded.push({
				variable: "parse_error",
				value: message,
				...buildStamp(item, undefined),
			});
		}
	}

	return [...items, ...decoded];
}

// `payload` is injected by the TagoIO runtime. The guard keeps the file loadable by the test suite,
// where no such global exists.
if (typeof payload !== "undefined") {
	payload = decodeHubblePayload(payload);
}
