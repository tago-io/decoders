/* 
** What this snippet does?
** It converts raw JSON data from devices into the TagoIO format.
**
** ✅ Supports:
**  - New data format:  { mac, dataList: [ { temp, hum, time } ] }
**  - Old BLE scan data: { id, time, devices: [ [0, "MAC", -70, "02010603..."], ... ] }
**
** ✅ BLE data parsing logic:
**  Uses the correct condition-based decoding for C4C2 / C4C3 / C4C4.
*/

// ========== BLE 广播数据解析函数 ==========
function parseBLEData(data:string) {
    if (typeof data !== "string" || data.length < 20) return [null, null, null, null];

    if (data.startsWith("02010603") && ["C4C2", "C4C4"].includes(data.substring(18, 22)) && data.length >= 50) {
        try {
            const _tmp_raw1 = data.substring(54, 56);
            const _tmp_raw2 = data.substring(56, 58);
            const _battery_raw1 = data.substring(52, 54);
            const _tmp_raw = '0x' + _tmp_raw2 + _tmp_raw1;
            const _battery_raw = '0x' + _battery_raw1;
            const _hum_raw = '0x' + data.substring(48, 50);
            let _tmp = parseInt(_tmp_raw, 16);
            if (_tmp > 32767) _tmp -= 65536;
            const _battery = parseInt(_battery_raw, 16);
            const _temperature = _tmp / 100.0;
            const _humidity = parseInt(_hum_raw, 16);
            const _co2 = null;
            return [_temperature, _humidity, _co2, _battery];
        } catch {
            return [null, null, null, null];
        }
    } else if (data.startsWith("02010603") && data.substring(18, 22) === "C4C3") {
        try {
            const _tmp = "0x" + data.substring(44, 46) + data.substring(42, 44);
            let _tmpValue = parseInt(_tmp, 16);
            if (_tmpValue > 32767) _tmpValue -= 65536;
            const _temperature = _tmpValue / 100;
            const _humidity = -1;
            const _battery = parseInt(data.substring(34, 36), 16);
            const _co2 = null;
            return [_temperature, _humidity, _co2, _battery];
        } catch {
            return [null, null, null, null];
        }
    } else if (data.startsWith("02010603") && data.length >= 50) {
        try {
            const _tmp_raw1 = data.substring(54, 56);
            const _tmp_raw2 = data.substring(56, 58);
            const _battery_raw1 = data.substring(52, 54);
            const _tmp_raw = '0x' + _tmp_raw2 + _tmp_raw1;
            const _battery_raw = '0x' + _battery_raw1;
            let _tmp = parseInt(_tmp_raw, 16);
            if (_tmp > 32767) _tmp -= 65536;
            const _battery = parseInt(_battery_raw, 16);
            const _temperature = _tmp / 100.0;
            const _humidity = -1;
            const _co2 = null;
            return [_temperature, _humidity, _co2, _battery];
        } catch {
            return [null, null, null, null];
        }
    }

    return [null, null, null, null];
}

// ========== 主格式化函数 ==========
function toTagoFormat(object_item:{}, prefix = '') {
    const result = [] as any;
    const ignore_vars = ['dataList', 'devices'];

    // ✅ 分支①：新结构 (带 dataList)
    if (Array.isArray(object_item.dataList)) {
        const mac = object_item.mac || object_item.id || 'unknown_mac';

        object_item.dataList.forEach((rec) => {
            const timeGroup = new Date(rec.time * 1000).toISOString();

            if (rec.temp !== undefined) {
                result.push({
                    variable: `${mac}_temperature`,
                    value: rec.temp,
                    unit: '°C',
                    group: timeGroup,
                    time: timeGroup,
                    metadata: { mac, raw_timestamp: rec.time * 1000 }
                });
            }

            if (rec.hum !== undefined) {
                result.push({
                    variable: `${mac}_humidity`,
                    value: rec.hum,
                    unit: '%',
                    group: timeGroup,
                    time: timeGroup,
                    metadata: { mac, raw_timestamp: rec.time * 1000 }
                });
            }
        });

        return result;
    }

    // ✅ 分支②：旧结构 (BLE 广播格式)
    if (Array.isArray(object_item.devices)) {
        const gatewayID = object_item.id || 'unknown_gateway';
        const timestamp = new Date(object_item.time * 1000).toISOString();

        object_item.devices.forEach(([type, mac, rssi, hex]) => {
            const [temperature, humidity, co2, battery] = parseBLEData(hex);

            if (temperature !== null) {
                result.push({
                    variable: `${mac}_temperature`,
                    value: temperature,
                    unit: '°C',
                    group: gatewayID,
                    time: timestamp,
                    metadata: { mac, rssi, raw_hex: hex, gatewayID }
                });
            }

            if (humidity !== null && humidity >= 0) {
                result.push({
                    variable: `${mac}_humidity`,
                    value: humidity,
                    unit: '%',
                    group: gatewayID,
                    time: timestamp,
                    metadata: { mac, rssi, raw_hex: hex, gatewayID }
                });
            }

            if (battery !== null) {
                result.push({
                    variable: `${mac}_battery`,
                    value: battery,
                    unit: '%',
                    group: gatewayID,
                    time: timestamp,
                    metadata: { mac, rssi, raw_hex: hex, gatewayID }
                });
            }

            if (temperature === null && humidity === null) {
                result.push({
                    variable: `${mac}_rssi`,
                    value: rssi,
                    unit: 'dBm',
                    group: gatewayID,
                    time: timestamp,
                    metadata: { mac, raw_hex: hex, gatewayID }
                });
            }
        });

        return result;
    }

    // ✅ 其他普通字段处理
    for (const key in object_item) {
        if (ignore_vars.includes(key)) continue;
        result.push({
            variable: prefix + key,
            value: object_item[key]
        });
    }

    return result;
}

// ========== 主入口：自动判断结构类型 ==========
console.log(payload[0].variable)
if (!payload[0].variable) {
    const group = payload[0].group || String(new Date().getTime());
    payload = toTagoFormat(payload[0], group);
}
