
function getBiggest(biggest) {
  const biggest_data = {};

  switch (String(biggest).toUpperCase()) {
    case '00':
      biggest_data.variable = 'u0';
      biggest_data.unit = 'V';
      biggest_data.description = 'Three-phase voltage';
      break;
    case '01':
      biggest_data.variable = 'u12';
      biggest_data.unit = 'V';
      biggest_data.description = 'Phase Voltage/Phase U12';
      break;
    case '02':
      biggest_data.variable = 'u23';
      biggest_data.unit = 'V';
      biggest_data.description = 'Phase Voltage/Phase U23';
      break;
    case '03':
      biggest_data.variable = 'u31';
      biggest_data.unit = 'V';
      biggest_data.description = 'Phase Voltage/Phase U31';
      break;
    case '04':
      biggest_data.variable = 'u1';
      biggest_data.unit = 'V';
      biggest_data.description = 'Phase 1 Voltage';
      break;
    case '05':
      biggest_data.variable = 'u2';
      biggest_data.unit = 'V';
      biggest_data.description = 'Phase 2 Voltage';
      break;
    case '06':
      biggest_data.variable = 'u3';
      biggest_data.unit = 'V';
      biggest_data.description = 'Phase 3 Voltage';
      break;
    case '07':
      biggest_data.variable = 'i0';
      biggest_data.unit = 'A';
      biggest_data.description = 'Three Phase Current';
      break;
    case '08':
      biggest_data.variable = 'in';
      biggest_data.unit = 'A';
      biggest_data.description = 'Neutral Current';
      break;
    case '09':
      biggest_data.variable = 'i1';
      biggest_data.unit = 'A';
      biggest_data.description = 'Phase 1 Current';
      break;
    case '0A':
      biggest_data.variable = 'i2';
      biggest_data.unit = 'A';
      biggest_data.description = 'Phase 2 Current';
      break;
    case '0B':
      biggest_data.variable = 'i3';
      biggest_data.unit = 'A';
      biggest_data.description = 'Phase 3 Current';
      break;
    case '0C':
      biggest_data.variable = 'f1';
      biggest_data.unit = 'Hz';
      biggest_data.description = 'Phase 1 Frequency';
      break;
    case '0D':
      biggest_data.variable = 'f2';
      biggest_data.unit = 'Hz';
      biggest_data.description = 'Phase 2 Frequency';
      break;
    case '0E':
      biggest_data.variable = 'f3';
      biggest_data.unit = 'Hz';
      biggest_data.description = 'Phase 3 Frequency';
      break;
    case '0F':
      biggest_data.variable = 'fiec';
      biggest_data.unit = 'Hz';
      biggest_data.description = 'Phase 1 Frequency (IEC – 10seg)';
      break;
    case '10':
      biggest_data.variable = 'p0';
      biggest_data.unit = 'W';
      biggest_data.description = 'Three Phase Active Power';
      break;
    case '11':
      biggest_data.variable = 'p1';
      biggest_data.unit = 'W';
      biggest_data.description = 'Active Power Line 1';
      break;
    case '12':
      biggest_data.variable = 'p2';
      biggest_data.unit = 'W';
      biggest_data.description = 'Active Power Line 2';
      break;
    case '13':
      biggest_data.variable = 'p3';
      biggest_data.unit = 'W';
      biggest_data.description = 'Active Power Line 3';
      break;
    case '14':
      biggest_data.variable = 'q0';
      biggest_data.unit = 'VAr';
      biggest_data.description = 'Three Phase Reactive Power';
      break;
    case '15':
      biggest_data.variable = 'q1';
      biggest_data.unit = 'VAr';
      biggest_data.description = 'Reactive Power Line 1';
      break;
    case '16':
      biggest_data.variable = 'q2';
      biggest_data.unit = 'VAr';
      biggest_data.description = 'Reactive Power Line 1';
      break;
    case '17':
      biggest_data.variable = 'q3';
      biggest_data.unit = 'VAr';
      biggest_data.description = 'Reactive Power Line 1';
      break;
    case '18':
      biggest_data.variable = 's0';
      biggest_data.unit = 'VA';
      biggest_data.description = 'Three Phase Apparent Power';
      break;
    case '19':
      biggest_data.variable = 's1';
      biggest_data.unit = 'VA';
      biggest_data.description = 'Apparent Power Line 1';
      break;
    case '1A':
      biggest_data.variable = 's2';
      biggest_data.unit = 'VA';
      biggest_data.description = 'Apparent Power Line 2';
      break;
    case '1B':
      biggest_data.variable = 's3';
      biggest_data.unit = 'VA';
      biggest_data.description = 'Apparent Power Line 3';
      break;
    case '1C':
      biggest_data.variable = 'fp0';
      biggest_data.unit = null;
      biggest_data.description = 'Three-Phase Power Factor';
      break;
    case '1D':
      biggest_data.variable = 'fp1';
      biggest_data.unit = null;
      biggest_data.description = 'Power Factor Line 1';
      break;
    case '1E':
      biggest_data.variable = 'fp2';
      biggest_data.unit = null;
      biggest_data.description = 'Power Factor Line 2';
      break;
    case '1F':
      biggest_data.variable = 'fp3';
      biggest_data.unit = null;
      biggest_data.description = 'Power Factor Line 3';
      break;
    case '20':
      biggest_data.variable = 'fp0d';
      biggest_data.unit = null;
      biggest_data.description = 'Three-Phase Displacement Power Factor';
      break;
    case '21':
      biggest_data.variable = 'fp1d';
      biggest_data.unit = null;
      biggest_data.description = 'Displacement Power Factor Line 1';
      break;
    case '22':
      biggest_data.variable = 'fp2d';
      biggest_data.unit = null;
      biggest_data.description = 'Displacement Power Factor Line 2';
      break;
    case '23':
      biggest_data.variable = 'fp3d';
      biggest_data.unit = null;
      biggest_data.description = 'Displacement Power Factor Line 3';
      break;
    case '24':
      biggest_data.variable = 'edp1';
      biggest_data.unit = null;
      biggest_data.description = 'EDP-1 Counter';
      break;
    case '25':
      biggest_data.variable = 'edp2';
      biggest_data.unit = null;
      biggest_data.description = 'EDP-2 Counter';
      break;
    case '26':
      biggest_data.variable = 'edp3';
      biggest_data.unit = null;
      biggest_data.description = 'EDP-3 Counter';
      break;
    case '27':
      biggest_data.variable = 'edps1';
      biggest_data.unit = null;
      biggest_data.description = 'EDP-1 Status';
      break;
    case '28':
      biggest_data.variable = 'edps2';
      biggest_data.unit = null;
      biggest_data.description = 'EDP-2 Status';
      break;
    case '29':
      biggest_data.variable = 'edps3';
      biggest_data.unit = null;
      biggest_data.description = 'EDP-3 Status';
      break;
    case '2A':
      biggest_data.variable = 'sds1';
      biggest_data.unit = null;
      biggest_data.description = 'SD-1 Status';
      break;
    case '2B':
      biggest_data.variable = 'sds2';
      biggest_data.unit = null;
      biggest_data.description = 'SD-2 Status';
      break;
    case '2C':
      biggest_data.variable = 'io1';
      biggest_data.unit = null;
      biggest_data.description = 'Analog Input 1';
      break;
    case '2D':
      biggest_data.variable = 'io2';
      biggest_data.unit = null;
      biggest_data.description = 'Analog Input 2';
      break;
    case '2E':
      biggest_data.variable = 'ea';
      biggest_data.unit = 'kWh';
      biggest_data.description = 'Positive Active Energy';
      break;
    case '2F':
      biggest_data.variable = 'er';
      biggest_data.unit = 'kVArh';
      biggest_data.description = 'Positive Reactive Energy';
      break;
    case '30':
      biggest_data.variable = 'ean';
      biggest_data.unit = 'KWh';
      biggest_data.description = 'Negative Active Energy';
      break;
    case '31':
      biggest_data.variable = 'ern';
      biggest_data.unit = 'kVArh';
      biggest_data.description = 'Negative Reactive Energy';
      break;
    case '32':
      biggest_data.variable = 'mda';
      biggest_data.unit = 'kW';
      biggest_data.description = 'Max. Active Demand';
      break;
    case '33':
      biggest_data.variable = 'da';
      biggest_data.unit = 'kW';
      biggest_data.description = 'Active Demand';
      break;
    case '34':
      biggest_data.variable = 'mds';
      biggest_data.unit = 'kVA';
      biggest_data.description = 'Max. Apparent Demand';
      break;
    case '35':
      biggest_data.variable = 'ds';
      biggest_data.unit = 'kVA';
      biggest_data.description = 'Apparent Demand';
      break;
    case '36':
      biggest_data.variable = 'mdr';
      biggest_data.unit = 'kVAr';
      biggest_data.description = 'Max. Reactive Demand';
      break;
    case '37':
      biggest_data.variable = 'dr';
      biggest_data.unit = 'kVAr';
      biggest_data.description = 'Reactive Demand';
      break;
    case '38':
      biggest_data.variable = 'mdi';
      biggest_data.unit = 'A';
      biggest_data.description = 'Max. Current Demand';
      break;
    case '39':
      biggest_data.variable = 'di';
      biggest_data.unit = 'A';
      biggest_data.description = 'Current Demand';
      break;
    case '3A':
      biggest_data.variable = 'es';
      biggest_data.unit = 'kVAh';
      biggest_data.description = 'Apparent Energy';
      break;
    case '3B':
      biggest_data.variable = 'thdu1';
      biggest_data.unit = '%';
      biggest_data.description = 'Phase 1 Voltage THD';
      break;
    case '3C':
      biggest_data.variable = 'thdu2';
      biggest_data.unit = '%';
      biggest_data.description = 'Phase 2 Voltage THD';
      break;
    case '3D':
      biggest_data.variable = 'thdu3';
      biggest_data.unit = '%';
      biggest_data.description = 'Phase 3 Voltage THD';
      break;
    case '3E':
      biggest_data.variable = 'thdi1';
      biggest_data.unit = '%';
      biggest_data.description = 'Phase 1 Current THD';
      break;
    case '3F':
      biggest_data.variable = 'thdi2';
      biggest_data.unit = '%';
      biggest_data.description = 'Phase 2 Current THD';
      break;
    case '40':
      biggest_data.variable = 'thdi3';
      biggest_data.unit = '%';
      biggest_data.description = 'Phase 3 Current THD';
      break;
    case '41':
      biggest_data.variable = 'thdau1';
      biggest_data.unit = '%';
      biggest_data.description = 'Phase 1 Voltage Grouping THD';
      break;
    case '42':
      biggest_data.variable = 'thdau2';
      biggest_data.unit = '%';
      biggest_data.description = 'Phase 2 Voltage Grouping THD';
      break;
    case '43':
      biggest_data.variable = 'thdau3';
      biggest_data.unit = '%';
      biggest_data.description = 'Phase 3 Voltage Grouping THD';
      break;
    case '44':
      biggest_data.variable = 'thdai1';
      biggest_data.unit = '%';
      biggest_data.description = 'Phase 1 Current Grouping THD';
      break;
    case '45':
      biggest_data.variable = 'thdai2';
      biggest_data.unit = '%';
      biggest_data.description = 'Phase 2 Current Grouping THD';
      break;
    case '46':
      biggest_data.variable = 'thdai3';
      biggest_data.unit = '%';
      biggest_data.description = 'Phase 3 Current Grouping THD';
      break;
    case '47':
      biggest_data.variable = 'temp';
      biggest_data.unit = '°C';
      biggest_data.description = 'Temperature';
      break;
    case '48':
      biggest_data.variable = 'ea1';
      biggest_data.unit = 'kWh';
      biggest_data.description = 'Phase 1 Positive Active Energy';
      break;
    case '49':
      biggest_data.variable = 'er1';
      biggest_data.unit = 'kVArh';
      biggest_data.description = 'Phase 1 Positive Reactive Energy';
      break;
    case '4A':
      biggest_data.variable = 'ean1';
      biggest_data.unit = 'kWh';
      biggest_data.description = 'Phase 1 Negative Active Energy';
      break;
    case '4B':
      biggest_data.variable = 'ern1';
      biggest_data.unit = 'kVArh';
      biggest_data.description = 'Phase 1 Negative Reactive Energy';
      break;
    case '4C':
      biggest_data.variable = 'ea2';
      biggest_data.unit = 'kWh';
      biggest_data.description = 'Phase 2 Positive Active Energy';
      break;
    case '4D':
      biggest_data.variable = 'er2';
      biggest_data.unit = 'kVArh';
      biggest_data.description = 'Phase 2 Positive Reactive Energy';
      break;
    case '4E':
      biggest_data.variable = 'ean2';
      biggest_data.unit = 'kWh';
      biggest_data.description = 'Phase 2 Negative Active Energy';
      break;
    case '4F':
      biggest_data.variable = 'ern2';
      biggest_data.unit = 'kVArh';
      biggest_data.description = 'Phase 2 Negative Reactive Energy';
      break;
    case '50':
      biggest_data.variable = 'ea3';
      biggest_data.unit = 'kWh';
      biggest_data.description = 'Phase 3 Positive Active Energy';
      break;
    case '51':
      biggest_data.variable = 'er3';
      biggest_data.unit = 'kVArh';
      biggest_data.description = 'Phase 3 Positive Reactive Energy';
      break;
    case '52':
      biggest_data.variable = 'ean3';
      biggest_data.unit = 'kWh';
      biggest_data.description = 'Phase 3 Negative Active Energy';
      break;
    case '53':
      biggest_data.variable = 'ern3';
      biggest_data.unit = 'kVArh';
      biggest_data.description = 'Phase 3 Negative Reactive Energy';
      break;
    case '54':
      biggest_data.variable = 'es1';
      biggest_data.unit = 'kVAh';
      biggest_data.description = 'Phase 1 Apparent Energy';
      break;
    case '55':
      biggest_data.variable = 'es2';
      biggest_data.unit = 'kVAh';
      biggest_data.description = 'Phase 2 Apparent Energy';
      break;
    case '56':
      biggest_data.variable = 'es3';
      biggest_data.unit = 'kVAh';
      biggest_data.description = 'Phase 3 Apparent Energy';
      break;
    default:
      biggest_data.variable = 'ce';
      biggest_data.unit = null;
      biggest_data.description = 'Error code';
  }
  return biggest_data;
}

const hexToFloat32 = (str) => {
  const int = parseInt(str, 16);
  if (int > 0 || int < 0) {
    // eslint-disable-next-line no-bitwise
    const sign = (int >>> 31) ? -1 : 1;
    // eslint-disable-next-line
    let exp = (int >>> 23 & 0xff) - 127;
    // eslint-disable-next-line
    const mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
    let float32 = 0;
    // eslint-disable-next-line
    for (i = 0; i < mantissa.length; i += 1) { float32 += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0; exp-- }
    return float32 * sign;
  }
  return 0;
};

function chunkSubstr(str, size) {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
}

function decoder(payload, serie) {
  const data = [];
  payload = chunkSubstr(payload, 8);
  for (const item of payload) {
    const biggest = getBiggest(String(item).slice(0, 2));
    const value = Number((hexToFloat32(`${String(item).slice(2, 8)}00`)).toFixed(2));
    data.push({
      variable: biggest.variable, // function(biggest)
      value,
      serie,
      unit: biggest.unit,
      metadadata: {
        description: biggest.description,
      },
    });
  }
  return data;
}

// to test this parse
// let payload = [{
//   variable: 'payload',
//   value: '0442F8E6094246510C426F661145AD8916454A001945C0D11D3F66662D49BCF42E498946FF3F8000',
// }];

const payload_raw = payload.find((x) => x.variable === 'payload_raw' || x.variable === 'payload' || x.variable === 'data');
if (payload_raw) {
  const serie = Date.now();
  payload = payload.concat(decoder(payload_raw.value, serie)).map((x) => ({ ...x, serie }));
}

// console.log(payload);

