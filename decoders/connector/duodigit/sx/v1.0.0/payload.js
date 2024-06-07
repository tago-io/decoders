function checkStatus(status) {
  let status_msg = 'Em carga';
  switch (status) {
    case 1:
      status_msg = 'Em falha';
      break;
      case 2:
      status_msg = 'Iniciando';
      break;
      case 3:
      status_msg = 'Impedimento de partida';
      break;
      case 4:
      status_msg = 'Pronto para partir';
      break;
      case 5:
      status_msg = 'Aguardando';
      break;
      case 6:
      status_msg = 'Standby';
      break;
      case 7:
      status_msg = 'Partindo';
      break;
      case 8:
      status_msg = 'Atraso em carga';
      break;
      case 10:
      status_msg = 'Atraso em recarga';
      break;
      case 11:
      status_msg = 'Alívio';
      break;
      case 12:
      status_msg = 'Parando';
      break;
  }
  return status_msg;
}

const v = payload.find(x => x.variable === 'data');

if (v) {
  console.log('>>>', v.value);
  const payload_data = v.value; // scope[6].value;

  console.log('payload_data: ', payload_data);

  const ID1 = `0x${payload_data.charAt(0)}${payload_data.charAt(1)}`;
  const reg1 = Number(ID1);
  console.log('FoiID1 ', reg1);
  const variables = '';
  // Caso payload_data tipo 00
  if (ID1 == '0x00') {
    // Temperatura de descarca 4002-4003
    const hextemp1 = `0x${payload_data.charAt(2)}${payload_data.charAt(3)}${payload_data.charAt(4)}`;
    const Temp_Descarga_min = Number(hextemp1);
    console.log('Foi2 ', Temp_Descarga_min);
    const hextemp2 = `0x${payload_data.charAt(5)}${payload_data.charAt(6)}${payload_data.charAt(7)}`;
    const Temp_Descarga_max = Number(hextemp2);
    console.log('Foi3 ', Temp_Descarga_max);
    const hextemp3 = `0x${payload_data.charAt(8)}${payload_data.charAt(9)}${payload_data.charAt(10)}`;
    const Temp_Descarga_med = Number(hextemp3);
    console.log('Foi4 ', Temp_Descarga_med);

    // Pressão de Saída 4004-4005
    const hextemp4 = `0x${payload_data.charAt(11)}${payload_data.charAt(12)}`;
    const Pre_out_min = Number(hextemp4);
    console.log('Foi2 ', Pre_out_min);
    const hextemp5 = `0x${payload_data.charAt(13)}${payload_data.charAt(14)}`;
    const Pre_out_max = Number(hextemp5);
    console.log('Foi3 ', Pre_out_max);
    const hextemp6 = `0x${payload_data.charAt(15)}${payload_data.charAt(16)}`;
    const Pre_out_med = Number(hextemp6);
    console.log('Foi4 ', Pre_out_med);

    // Pressão de Interna 4006-4007
    const hextemp7 = `0x${payload_data.charAt(17)}${payload_data.charAt(18)}`;
    const Pre_in_min = Number(hextemp7);
    console.log('Foi5 ', Pre_out_min);
    const hextemp8 = `0x${payload_data.charAt(19)}${payload_data.charAt(20)}`;
    const Pre_in_max = Number(hextemp8);
    console.log('Foi6 ', Pre_out_max);
    const hextemp9 = `0x${payload_data.charAt(21)}${payload_data.charAt(22)}`;
    const Pre_in_med = Number(hextemp9);
    console.log('Foi7 ', Pre_in_med);

    // Status operação 4196
    const hextemp20 = (`0x${payload_data.charAt(23)}`);
    const Status_op = Number(hextemp20);
    console.log('Foi8 ', Status_op);

    const variables1 = [{
      variable: 'Temp_Descarga_min',
      value: Temp_Descarga_min / 100,
      unit: '°C',
    }, {
      variable: 'Temp_Descarga_max',
      value: Temp_Descarga_max / 100,
      unit: '°C',
    }, {
      variable: 'temp_celsius', // Temp_Descarga_med
      value: Temp_Descarga_med / 100,
      unit: '°C',
    }, {
      variable: 'Pre_out_min',
      value: Pre_out_min / 100,
      unit: 'Bar',
    }, {
      variable: 'Pre_out_max',
      value: Pre_out_max / 100,
      unit: 'Bar',
    }, {
      variable: 'pressure_bar', //Pre_out_med
      value: Pre_out_med / 100,
      unit: 'Bar',
    }, {
      variable: 'Pre_in_min',
      value: Pre_in_min / 100,
      unit: 'Bar',
    }, {
      variable: 'Pre_in_max',
      value: Pre_in_max / 100,
      unit: 'Bar',
    }, {
      variable: 'Pre_in_med',
      value: Pre_in_med / 100,
      unit: 'Bar',
    }, {
      variable: 'Status_msg',
      value:  Status_op,
      metadata: {
        status: Status_op
      }
    }];
    payload = payload.concat(variables1);
  }

  // Caso payload_data tipo 01
  if (ID1 == '0x01') {
    // Vazão do compressor 3F15
    const hextemp10 = `0x${payload_data.charAt(2)}${payload_data.charAt(3)}${payload_data.charAt(4)}${payload_data.charAt(5)}`;
    const Vz_comp_min = Number(hextemp10);
    console.log('Foi9 ', Vz_comp_min);
    const hextemp11 = `0x${payload_data.charAt(6)}${payload_data.charAt(7)}${payload_data.charAt(8)}${payload_data.charAt(9)}`;
    const Vz_comp_max = Number(hextemp11);
    console.log('Foi10 ', Vz_comp_max);
    const hextemp12 = `0x${payload_data.charAt(10)}${payload_data.charAt(11)}${payload_data.charAt(12)}${payload_data.charAt(13)}`;
    const Vz_comp_med = Number(hextemp12);
    console.log('Foi11 ', Vz_comp_med);

    // Horas totais de operação 400E-400F
    const hextemp13 = `0x${payload_data.charAt(14)}${payload_data.charAt(15)}${payload_data.charAt(16)}${payload_data.charAt(17)}${payload_data.charAt(18)}`;
    const H_total_op = Number(hextemp13);
    console.log('Foi12 ', H_total_op);

    // Horas em carga 4012-4013
    const hextemp14 = `0x${payload_data.charAt(19)}${payload_data.charAt(20)}${payload_data.charAt(21)}${payload_data.charAt(22)}${payload_data.charAt(23)}`;
    const H_total_carga = Number(hextemp14);
    console.log('Foi13 ', H_total_carga);

    const variables2 = [{
      variable: 'Vz_comp_min',
      value: Vz_comp_min,
      unit: ' ',
    }, {
      variable: 'Vz_comp_max',
      value: Vz_comp_max,
      unit: ' ',
    }, {
      variable: 'Vz_comp_med',
      value: Vz_comp_med,
      unit: ' ',
    }, {
      variable: 'horasop',
      value: H_total_op,
      unit: 'h',
    }, {
      variable: 'horascarga',
      value: H_total_carga,
      unit: 'h',
    }];
    payload = payload.concat(variables2);
  }

  // Caso payload_data tipo 02
  if (ID1 == '0x02') {
    // Horas de manutenção1 4018 -1500
    const hextemp15 = `0x${payload_data.charAt(2)}${payload_data.charAt(3)}${payload_data.charAt(4)}${payload_data.charAt(5)}`;
    const H_manut_1 = Number(hextemp15);
    console.log('Foi14 ', H_manut_1);

    // Horas de manutenção2 4019 -1500
    const hextemp16 = `0x${payload_data.charAt(6)}${payload_data.charAt(7)}${payload_data.charAt(8)}${payload_data.charAt(9)}`;
    const H_manut_2 = Number(hextemp16);
    console.log('Foi15 ', H_manut_2);

    // Horas de manutenção3 401A -1500
    const hextemp17 = `0x${payload_data.charAt(10)}${payload_data.charAt(11)}${payload_data.charAt(12)}${payload_data.charAt(13)}`;
    const H_manut_3 = Number(hextemp17);
    console.log('Foi16 ', H_manut_3);

    // Horas de manutenção4 401B -1500
    const hextemp18 = `0x${payload_data.charAt(14)}${payload_data.charAt(15)}${payload_data.charAt(16)}${payload_data.charAt(17)}`;
    const H_manut_4 = Number(hextemp18);
    console.log('Foi17 ', H_manut_4);

    // Horas de manutenção4 401C -1500
    const hextemp19 = `0x${payload_data.charAt(18)}${payload_data.charAt(19)}${payload_data.charAt(20)}${payload_data.charAt(21)}`;
    const H_manut_5 = Number(hextemp19);
    console.log('Foi18 ', H_manut_5);

    const variables3 = [{
      variable: 'H_manut_1',
      value: H_manut_1,
      unit: 'h',
    }, {
      variable: 'H_manut_2',
      value: H_manut_2,
      unit: 'h',
    }, {
      variable: 'H_manut_3',
      value: H_manut_3,
      unit: 'h',
    }, {
      variable: 'H_manut_4',
      value: H_manut_4,
      unit: 'h',
    }, {
      variable: 'H_manut_5',
      value: H_manut_5,
      unit: 'h',
    }];
    payload = payload.concat(variables3);
  }

  // Caso payload_data tipo 03
  if (ID1 == '0x03') {
    // Horas de manutenção1 4018
    const hextemp20 = `0x${payload_data.charAt(2)}${payload_data.charAt(3)}${payload_data.charAt(4)}${payload_data.charAt(5)}`;
    const Alarme = Number(hextemp20);
    console.log('Foi19 ', Alarme);

    const variables4 = [{
      variable: 'Alarme',
      value: Alarme,
      unit: '',
    }];
    payload = payload.concat(variables4);
  }
}
