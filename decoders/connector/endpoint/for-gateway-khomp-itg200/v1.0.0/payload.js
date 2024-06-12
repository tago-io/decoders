payload.forEach((data) => {
  if(data.time === null){
    console.log("The time is null, the date of now has been placed");
    data.time = String(Date.now());
  }
  if (String(data.variable).includes('temperature') ) {
    data.value = Number(data.value) - 273.15;
    data.unit = '°C';
  }
});
