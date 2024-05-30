/* This code finds the variable 'data' sent by Sigfox backend inside the payload posted by the device.
** If latitude and longitude are sent, we convert it to 'location' variable.
*/
// Function to convert a hexadecimal value to decimal. 
function hex2dec(num) {
    return parseInt((num), 16).toString(10)
}

// finding variable data sent by sigfox
const data = payload.find(x => x.variable === 'data');
if (!data) {
  console.log('Data can not be found');
} else {
    // get complete hexadecimal from variable data
    const mpayload = data.value;
    const bytes = [];
    // separating the hex string for an array as 12 positions (bytes). This return some like it: ['a1', '00', '12'...]
    for (let i = 0; i < 24; i += 2) {
        bytes.push(`${mpayload[i]}${mpayload[i + 1]}`)
    }

    // Get pulse1. It calls the function "hex2dec" and passes the bytes 3, 2, 1, and 0.
    const pulse1 = Number(hex2dec(`${bytes[3]}${bytes[2]}${bytes[1]}${bytes[0]}`));
    // Get pulse2. It calls the function "hex2dec" and passes the bytes 7, 6, 5, and 4.
    const pulse2 = Number(hex2dec(`${bytes[7]}${bytes[6]}${bytes[5]}${bytes[4]}`));
    // Get temperature. It calls the function "hex2dec" and passes the bytes 9 and 8.
    const temp = Number(hex2dec(`${bytes[9]}${bytes[8]}`) / 100).toFixed(2);
    // Get humidity. It calls the function "hex2dec" and passes the byte 10.
    const humidity = Number(hex2dec(`${bytes[10]}`) / 2).toFixed(2);
    // Get hall. It calls the function "hex2dec" and passes the byte 11.
    const hall = Number(hex2dec(`${bytes[11]}`));

    const time = data.time ? data.time : new Date().toISOString();
    const serie = data.serie ? data.serie : new Date().getTime();

    // Push Tago variables to payload (payload is an global array on payload parser and is sent to Tago)
    payload.push({
        variable: 'pulse1',
        value: Number(pulse1),
        time,
        serie,
    }, {
        variable: 'pulse2',
        value: Number(pulse2),
        time,
        serie,
    }, {
        variable: 'temperature',
        value: Number(temp),
        time,
        serie,
        unit: '°C',
    }, {
        variable: 'humidity',
        value: Number(humidity),
        time,
        serie,
        unit: '%',
    }, {
        variable: 'hall_effect',
        value: Number(hall),
        time,
        serie,
    })
}