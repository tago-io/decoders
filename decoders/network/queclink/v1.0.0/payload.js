const message_type = payload.find(item  => item.variable === 'message_type');
const report = payload.find(item  => item.variable === 'report_id_report_type');

if (message_type && report) {
  if (message_type.value === '+RESP:GTDIS' || message_type.value === '+RESP:GTSOS') {
    // payload = payload.filter((item) => ["message_type", ""].includes(item.variable));
    let [port, input] =  String(report.value).split('');
    input =  input === '1';
    payload.push({
      variable: `digital_${port}`, value: input, serie: message_type.serie, time: message_type.time,
    });
  }
}