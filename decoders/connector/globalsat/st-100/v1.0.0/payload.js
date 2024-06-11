function toTagoFormat(object_item, serie, prefix = '') {
  const result = [];
  for (const key in object_item) {

    if (typeof object_item[key] == 'object') {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}

function hex2bin4Byte(hex) {
  return (parseInt(hex, 16).toString(2)).padStart(32, '0');
}

function twoComplement(hexString) {
  let tempBIN = hex2bin4Byte(hexString);
  if (tempBIN[0] === '0') {
    return (parseInt(tempBIN, 2)) * 0.000001;
  }

  tempBIN = tempBIN.replace(/1/g, 2);
  tempBIN = tempBIN.replace(/0/g, 1);
  tempBIN = tempBIN.replace(/2/g, 0);
  const result = ~parseInt(tempBIN, 2) * 0.000001;
  return result;
}

const data = payload.find(x => x.variable === 'data');

if (data) {
  const time = data.time || new Date().toISOString();
  const serie = data.serie || new Date().getTime();

  const buffer = Buffer.from(data.value, 'hex'); // 00 82 5b 017d6b19 073dc188
  const status = Number(buffer[1] / 64).toFixed(0);
  const report_type = Number(buffer[1] % 64).toFixed(0);
  const battery_capacity = Number(buffer[2]).toFixed(1);
  const lat = twoComplement(data.value.slice(6, 14));
  const lng = twoComplement(data.value.slice(14, data.value.length));

  const tagodata = {
    status: { value: Number(status), time, serie },
    report_type: { value: Number(report_type), time, serie },
    battery_capacity: { value: Number(battery_capacity), time, serie, unit: '%' },
    location: { value: `${lat}, ${lng}`, time, serie, location: { lat, lng } },
  };
  payload = payload.concat(toTagoFormat(tagodata));
}
