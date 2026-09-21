/**
 * Hubble network decoder.
 *
 * The Hubble middleware posts each webhook packet as a JSON string under the `hubble_payload`
 * variable, one request per device and several readings per request. This decoder replaces that
 * envelope with TagoIO variables. The envelope itself is not stored: TagoIO keeps the original
 * request as `raw_payload`, so device name, RSSI, counters and tags stay reachable from there.
 *
 * `device.payload` carries vendor bytes that are out of scope here. Hubble delivers them Base64
 * encoded; the network decoder re-encodes them as hex, the form TagoIO payload parsers expect, so the
 * device connector can decode them afterwards.
 */

interface HubbleDevice {
	payload?: string;
	timestamp?: number;
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

function base64ToHex(encoded: string) {
	return Buffer.from(encoded, "base64").toString("hex");
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

/**
 * The position Hubble computed from the gateway that heard the tag. `network_type` rides along as
 * metadata: it describes the gateway (terrestrial or satellite), not the device.
 */
function decodeGatewayLocation(packet: HubblePacket, stamp: Stamp) {
	const location = packet.location;
	if (
		!location ||
		typeof location.latitude !== "number" ||
		typeof location.longitude !== "number" ||
		!isWithinEarthBounds(location.latitude, location.longitude)
	) {
		return undefined;
	}

	const data: TagoData = {
		variable: "gateway_location",
		location: { lat: location.latitude, lng: location.longitude },
		metadata: compactMetadata({
			altitude: location.altitude,
			horizontal_accuracy: location.horizontal_accuracy,
			vertical_accuracy: location.vertical_accuracy,
			timestamp: location.timestamp,
			network_type: packet.network_type,
		}),
		...stamp,
	};
	return data;
}

/** Expands one Hubble packet into TagoIO variables. Absent blocks yield no variable at all. */
function decodeHubblePacket(packet: HubblePacket, stamp: Stamp) {
	const device = packet?.device;
	if (!device || typeof device !== "object") {
		throw new Error("Packet has no device block");
	}

	const data: TagoData[] = [];

	if (typeof device.payload === "string") {
		data.push({ variable: "payload", value: base64ToHex(device.payload), ...stamp });
	}

	const gatewayLocation = decodeGatewayLocation(packet, stamp);
	if (gatewayLocation) {
		data.push(gatewayLocation);
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
 * Replaces every `hubble_payload` in the batch with its decoded variables. Items under any other
 * variable pass through untouched.
 *
 * Never throws. A parser error is returned to the device's HTTP POST response, which would fail the
 * middleware's request and make Hubble redeliver the whole batch, so a malformed packet is reported
 * as a `parse_error` variable and the remaining packets are decoded normally.
 */
function decodeHubblePayload(items: any) {
	if (!Array.isArray(items)) {
		return items;
	}

	const result: TagoData[] = [];

	for (const item of items) {
		if (
			!item ||
			item.variable !== RAW_VARIABLE ||
			typeof item.value !== "string"
		) {
			result.push(item);
			continue;
		}

		try {
			const packet = JSON.parse(item.value) as HubblePacket;
			result.push(
				...decodeHubblePacket(
					packet,
					buildStamp(item, packet?.device?.timestamp),
				),
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			// Surfaces in the device's Live Inspector.
			console.error(`${RAW_VARIABLE} could not be decoded: ${message}`);
			result.push({
				variable: "parse_error",
				value: message,
				...buildStamp(item, undefined),
			});
		}
	}

	return result;
}

// `payload` is injected by the TagoIO runtime. The guard keeps the file loadable by the test suite,
// where no such global exists.
if (typeof payload !== "undefined") {
	payload = decodeHubblePayload(payload);
}
