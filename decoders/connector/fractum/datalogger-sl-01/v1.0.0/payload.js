
const rawValues = payload.find((item) => item.variable === 'payload');


if (rawValues)
{
	const valuesString = rawValues.value;
	const splitValues = valuesString.split(";");

	const filterIMEI = splitValues[1];
	const filterSN = splitValues[25];
	const filterTAG = splitValues[24];
	const filterBattery = splitValues[9];
	const filterTemperature = splitValues[10];
	const filterMoisture = splitValues[11];
	const filterPackage = splitValues[18];
	const filterI0 = splitValues[4];
	const filterI1 = splitValues[5];
	const filterInt0 = splitValues[6];
	const filterCSQ = splitValues[20];
	const filterRSSI = splitValues[21];
	const filterOperator = splitValues[23];
	const filterDate = splitValues[16];
	const filterHour = splitValues[17];

	const imeiValues = filterIMEI.split(":");
	const snValues = filterSN.split(":");
	const tagValues = filterTAG.split(":");
	const batteryValues = filterBattery.split(":");
	const temperatureValues = filterTemperature.split(":");
	const moistureValues = filterMoisture.split(":");
	const packageValues = filterPackage.split(":");
	const i0Values = filterI0.split(":");
	const i1Values = filterI1.split(":");
	const int0Values = filterInt0.split(":");
	const csqValues = filterCSQ.split(":");
	const rssiValues = filterRSSI.split(":");
	const operatorValues = filterOperator.split(":");
	const dateValues = filterDate.split(":");

	const imei = imeiValues[1];
	const sn = snValues[1];
	const tag = tagValues[1];
	const battery = batteryValues[1];
	const temperature = temperatureValues[1];
	const moisture = moistureValues[1];
	const package = packageValues[1];
	const i0 = i0Values[1];
	const i1 = i1Values[1];
	const int0 = int0Values[1];
	const csq = csqValues[1];
	const rssi = rssiValues[1];
	const operator = operatorValues[1];
	const date = dateValues[1];
	const hour = filterHour.substring(5,13);
	const timestampAux = date+ " " + hour + ".000";
	const timezoneAux = date + " " + hour;

	let i_0 = ((15*i0)/16) - (15/4);
	let i_1 = ((15*i1)/16) - (15/4);
	if(i_1 < 0){
		i_1 = 0;
	};
	if(i_0 < 0){
		i_0 = 0;
	};

	const lat = device.params.find((x) => x.key === 'lat');
	const long = device.params.find((y) => y.key === 'lng');

	const latitude = Number(lat.value);
	const longitude = Number(long.value);


	payload = [];
	payload.push({ "variable": "imei", "value": imei});
	payload.push({ "variable": "sn", "value": sn});
	payload.push({ "variable": "tag", "value": tag, "location": {"lat": latitude, "lng": longitude}});
	payload.push({ "variable": "temperature", "value": temperature, "unit": "°C", "time": timestampAux});
	payload.push({ "variable": "battery", "value": battery, "unit": "V"});
	payload.push({ "variable": "package", "value": package});
	payload.push({ "variable": "moisture", "value": moisture, "unit": "%UR", "time": timestampAux});
	payload.push({ "variable": "I0", "value": i_0, "time": timestampAux, "unit": "mA"});
	payload.push({ "variable": "I1", "value": i_1, "time": timestampAux, "unit": "mA"});
	payload.push({ "variable": "INT0", "value": int0, "time": timestampAux, "unit": "mm/m²"});
	payload.push({ "variable": "CSQ", "value": csq});
	payload.push({ "variable": "RSSI", "value": rssi});
	payload.push({ "variable": "operator", "value": operator});
	payload.push({ "variable": "date", "value": timezoneAux});

}

