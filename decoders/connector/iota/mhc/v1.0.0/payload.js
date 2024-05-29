const data = payload.find(x => x.variable === "data");

if (data) {
  const time = data.time ? data.time : new Date().toISOString();
  const serie = data.serie ? data.serie : new Date().getTime();
  const parse_var = {
    variable: 'manhole_status',
    time,
    serie,
  };

  const value = data.value;
  switch (String(value)) {
    case '11':
      parse_var.value = 'TURNED ON';
      break;
    case '00':
      parse_var.value = 'TURNED OFF';
      break;
    case 'dd':
      parse_var.value = 'MOTION';
      break;
    case 'dc':
      parse_var.value = 'HIT';
      break;
    case 'd0':
      parse_var.value = 'QUIET';
      break;
    default:
      parse_var.value = 'ARMED';
      break;
  }

  if (parse_var.value) payload.push(parse_var);
}