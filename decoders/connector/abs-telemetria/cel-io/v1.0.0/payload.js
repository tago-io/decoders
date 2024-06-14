if (typeof payload === 'string') {
  const split_payload = payload.substring(0, payload.length - 1).split(';');  //ultimo caracter do payload é ';'
  try {
    const date = split_payload[2].split('/');
    date[2] = "20".concat(date[2]); //data enviada no formato dd/mm/aa (ano com dois digitos)
    const time = `${date[2]}-${date[1]}-${date[0]} ${split_payload[3]}`;  //data enviada no formato dd/mm/aa
    const serie = Date.now();

    payload = split_payload.map((pload, index) => {
      const parsed = { variable: 'model', value: '', serie, time };
      if (index === 0) {
        parsed.variable = 'product_id';
        parsed.value = pload;
      } else if (index === 1) {
        parsed.variable = 'index';
        parsed.value = pload;
      } else if (index >= 4) {
        parsed.variable = pload.split('=')[0].toLowerCase();
        parsed.value = pload.split('=')[1];
      }
      return parsed;
    }).filter(x => x.variable !== 'model');
  } catch (err) {
    payload = [{ variable: 'payload_error', value: JSON.stringify(err) }];
  }
}