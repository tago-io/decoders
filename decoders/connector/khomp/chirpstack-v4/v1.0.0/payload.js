const result = [];

function addMeasure(object_item) {
    const measure_to_store = {
        variable: object_item.n,
        value: object_item.v,
        unit: object_item.u,
    };

    if (object_item.hasOwnProperty("bt")) {
        measure_to_store.time = object_item.bt * 1000;
        measure_to_store.serie = object_item.bt * 1000;
    }

    result.push(measure_to_store)
}

try {
    const raw_payload = payload[0].object;

    try {
        addMeasure({ n: "gateway", v: payload[0].rxInfo[0]["gatewayId"].toUpperCase() });
    } catch (e) {
        console.log(`ERROR: ${e}`)
    }

    addMeasure({ n: "device_class", v: payload[0]["deviceInfo"]["deviceClassEnabled"] });
    addMeasure({ n: "device_eui", v: payload[0]["deviceInfo"]["devEui"].toUpperCase() });
    addMeasure({ n: "rssi", v: payload[0].rxInfo[0]["rssi"], u: "dBm" });
    addMeasure({ n: "snr", v: payload[0].rxInfo[0]["snr"], u: "dB" });
    addMeasure({ n: "adr", v: payload[0]["adr"] });
    addMeasure({ n: "dr", v: payload[0]["dr"] });
    addMeasure({ n: "fcnt", v: payload[0]["fCnt"] });
    addMeasure({ n: "confirmed", v: payload[0]["confirmed"] });
    addMeasure({ n: "spreading_factor", v: payload[0]["txInfo"]["modulation"]["lora"]["spreadingFactor"] });
    addMeasure({ n: "tx_frequency", v: payload[0]["txInfo"]["frequency"], u: "Hz" });

    for (let structs in raw_payload) {
        for (let measure in raw_payload[structs]) {
            try {
                addMeasure(raw_payload[structs][measure]);
            } catch (e) {
                console.log(`ERROR: ${e}`)
            }
        }
    }

    let latitude = result.find((x) => x.variable === 'latitude');
    let longitude = result.find((x) => x.variable === 'longitude');

    if (latitude && longitude) {
        result.push({
            variable: "position",
            value: latitude.value + ":" + longitude.value,
            location: {
                "lat": latitude.value,
                "lng": longitude.value,
            }
        });
    }

    payload = result;
} catch (e) {
    console.log(`ERROR: ${e}`)
}