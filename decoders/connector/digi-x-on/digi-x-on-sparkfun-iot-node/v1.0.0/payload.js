const ignore_vars = [];

// Function to convert payload hex into TagoIO format
function toTagoFormat(payloadArray, group, prefix = '') {
    const result = [];

    const sensorMap = {
        '04': { name: 'TVOC', type: 'uint16' },
        '05': { name: 'AQI', type: 'uint8' },
        '06': { name: 'eCO2', type: 'uint16' },
        '07': { name: 'ETOH', type: 'uint16' },
        '08': { name: 'humidity_f', type: 'float' },
        '09': { name: 'pressure_f', type: 'float' },
        '0A': { name: 'temperature_c', type: 'float' },
        '0B': { name: 'temperature_f', type: 'float' },
        '0C': { name: 'pressure', type: 'float' },
        '0D': { name: 'acceleration_x', type: 'float' },
        '0E': { name: 'acceleration_y', type: 'float' },
        '0F': { name: 'acceleration_z', type: 'float' },
        '10': { name: 'latitude', type: 'double' },
        '11': { name: 'longitude', type: 'double' },
        '12': { name: 'altitude', type: 'double' },
        '13': { name: 'co2_f', type: 'float' },
        '14': { name: 'humidity', type: 'float' },
        '15': { name: 'flow_mph', type: 'float' },
        '16': { name: 'latitude', type: 'double' },
        '17': { name: 'longitude', type: 'double' },
        '18': { name: 'altitude', type: 'double' },
        '19': { name: 'battery_voltage', type: 'float' },
        '1A': { name: 'co2', type: 'float' },
        '1B': { name: 'voc', type: 'float' },
        '1C': { name: 'light', type: 'float' },
        '1D': { name: 'current', type: 'float' },
        '1E': { name: 'voltage', type: 'float' },
        '1F': { name: 'power', type: 'float' },
        '25': { name: 'pressure_mbar', type: 'float' },
        '26': { name: 'weight_user_units', type: 'float' },
        '27': { name: 'cie_x', type: 'double' },
        '28': { name: 'cie_y', type: 'double' },
        '29': { name: 'cct', type: 'double' },
        '30': { name: 'voltage_batt', type: 'float' },
        '2F': { name: 'state_of_charge', type: 'float' },
        '31': { name: 'change_rate', type: 'float' },
        '32': { name: 'co2_u32', type: 'uint32' },
        '33': { name: 'tvoc_u32', type: 'uint32' },
        '34': { name: 'h2', type: 'uint32' },
        '35': { name: 'etoh_u32', type: 'uint32' },
        '36': { name: 'presence', type: 'int16' },
        '37': { name: 'motion', type: 'int16' },
        '38': { name: 'proximity', type: 'uint16' },
        '39': { name: 'lux_u16', type: 'uint16' },
        '40': { name: 'uva_index', type: 'float' },
        '41': { name: 'uvb_index', type: 'float' },
        '42': { name: 'uv_index', type: 'float' },
        '43': { name: 'lux_f', type: 'float' },
        '44': { name: 'ambient_light', type: 'uint32' },
        '45': { name: 'white_light', type: 'uint32' },
        '46': { name: 'distance', type: 'uint32' },
        '47': { name: 'battery_charge', type: 'float' },
        '48': { name: 'battery_voltage', type: 'float' },
        '49': { name: 'battery_charge_rate', type: 'float' },
        '50': { name: 'temperature_c_double', type: 'double' },
        '51': { name: 'pressure_pa_double', type: 'double' }
    };

    const payloadItem = payloadArray.find(item => item.variable.toLowerCase() === 'payload');
    if (!payloadItem) {
        result.push({ variable: 'parser_error', value: 'No Payload found', group });
        return result;
    }

    const hexData = payloadItem.value;

    let offset = 0;
    while (offset < hexData.length - 1) {
        const sensorType = hexData.substring(offset, offset + 2);
        offset += 2;

        if (sensorType === '00') continue;

        const sensorInfo = sensorMap[sensorType];
        if (!sensorInfo) {
            result.push({ variable: 'unknown_sensor', value: sensorType, group });
            break;
        }

        let valueHex = '';
        if (sensorInfo.type === 'double') {
            valueHex = hexData.substring(offset, offset + 16);
            offset += 16;
        } else if (sensorInfo.type === 'float' || sensorInfo.type === 'uint32') {
            valueHex = hexData.substring(offset, offset + 8);
            offset += 8;
        } else if (sensorInfo.type === 'uint16' || sensorInfo.type === 'int16') {
            valueHex = hexData.substring(offset, offset + 4);
            offset += 4;
        } else if (sensorInfo.type === 'uint8') {
            valueHex = hexData.substring(offset, offset + 2);
            offset += 2;
        }

        let value;
        const buffer = Buffer.from(valueHex, 'hex');

        if (sensorInfo.type === 'float') {
            value = buffer.readFloatBE(0);
        } else if (sensorInfo.type === 'double') {
            value = buffer.readDoubleBE(0);
        } else if (sensorInfo.type === 'uint32') {
            value = buffer.readUInt32BE(0);
        } else if (sensorInfo.type === 'uint16') {
            value = buffer.readUInt16BE(0);
        } else if (sensorInfo.type === 'int16') {
            value = buffer.readInt16BE(0);
        } else if (sensorInfo.type === 'uint8') {
            value = buffer.readUInt8(0);
        }

        result.push({ variable: sensorInfo.name, value, group });
    }

    return result;
}
const group = payload[0].group || String(new Date().getTime());
const decoded = toTagoFormat(payload, group);

// Keep all original variables, including "payload", and append decoded results
payload = [...payload, ...decoded];

