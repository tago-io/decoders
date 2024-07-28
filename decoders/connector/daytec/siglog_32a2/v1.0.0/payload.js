const rawValues1 = payload.find (item => item.variable === "payload");
if (rawValues1){
const valuesString = rawValues1.value;
const splitValues = valuesString.split(",");

const dandt = splitValues [0]; //DATE AND TIME
const input1 = splitValues [1]; //INPUT 1 
const input2 = splitValues [2]; //INPUT 2 
const input3 = splitValues [3]; //INPUT 3  
const input4 = splitValues [4]; //INPUT 4  
const input5 = splitValues [5]; //INPUT 5 
const input6 = splitValues [6]; //INPUT 6 
const input7 = splitValues [7]; //INPUT 7 
const input8 = splitValues [8]; //INPUT 8 
const input9 = splitValues [9]; //INPUT 9 
const input10 = splitValues [10]; //INPUT 10

//const spaceholder = splitValues [0];
const input11 = splitValues [11]; //INPUT 11
const input12 = splitValues [12]; //INPUT 12
const input13 = splitValues [13]; //INPUT 13
const input14 = splitValues [14]; //INPUT 14
const input15 = splitValues [15]; //INPUT 15
const input16 = splitValues [16]; //INPUT 16 
const input17 = splitValues [17]; //INPUT 17
const input18 = splitValues [18]; //INPUT 18
const input19 = splitValues [19]; //INPUT 19
const input20 = splitValues [20]; //INPUT 20

//const spaceholder = splitValues [0];
const input21 = splitValues [21]; //INPUT 21
const input22 = splitValues [22]; //INPUT 22
const input23 = splitValues [23]; //INPUT 23
const input24 = splitValues [24]; //INPUT 24
const input25 = splitValues [25]; //INPUT 25
const input26 = splitValues [26]; //INPUT 26
const input27 = splitValues [27]; //INPUT 27
const input28 = splitValues [28]; //INPUT 28 
const input29 = splitValues [29]; //INPUT 29 STARTER MOTOR
const input30 = splitValues [30]; //INPUT 30

//const spaceholder = splitValues [0];
const input31 = splitValues [31]; //INPUT 31  
const input32 = splitValues [32]; //INPUT 32 PRESSURE SWITCH 
const input33 = splitValues [33]; //RPM 
const input34 = splitValues [34]; //RELAY 1 RS485 -1 
const input35 = splitValues [35]; //RELAY 2 RS485 -2 
const input36 = splitValues [36]; //RELAY 3 RS485 -3 
const input37 = splitValues [37]; //RELAY 3 RS485 -4 
const input38 = splitValues [38]; //ANALOG 1 

const input39 = splitValues [39]; //ANALOG 2 
const input40 = splitValues [40]; //ANALOG 3  

const input41 = splitValues [41]; //SIGNAL 
const input42 = splitValues [42]; //GLONAS SIG

const input43 = splitValues [43]; //SERIAL NUMBER

const input44 = splitValues [44]; //LATITUDE
const input45 = splitValues [45]; //LONGITUDE

payload.push({ "variable": "dandt","value": dandt });
payload.push({ "variable": "input1","value": input1 });
payload.push({ "variable": "input2","value": input2});
payload.push({ "variable": "input3","value": input3 });
payload.push({ "variable": "input4","value": input4 });
payload.push({ "variable": "input5","value": input5});
payload.push({ "variable": "input6","value": input6 });
payload.push({ "variable": "input7","value": input7 });
payload.push({ "variable": "input8","value": input8});
payload.push({ "variable": "input9","value": input9 });
payload.push({ "variable": "input10","value": input10 });

payload.push({ "variable": "input11","value": input11 });
payload.push({ "variable": "input12","value": input12});
payload.push({ "variable": "input13","value": input13 });
payload.push({ "variable": "input14","value": input14 });
payload.push({ "variable": "input15","value": input15});
payload.push({ "variable": "input16","value": input16 });
payload.push({ "variable": "input17","value": input17 });
payload.push({ "variable": "input18","value": input18});
payload.push({ "variable": "input19","value": input19 });
payload.push({ "variable": "input20","value": input20 });

payload.push({ "variable": "input21","value": input21 });
payload.push({ "variable": "input22","value": input22});
payload.push({ "variable": "input23","value": input23 });
payload.push({ "variable": "input24","value": input24 });
payload.push({ "variable": "input25","value": input25});
payload.push({ "variable": "input26","value": input26 });
payload.push({ "variable": "input27","value": input27 });
payload.push({ "variable": "input28","value": input28});
payload.push({ "variable": "input29","value": input29 });
payload.push({ "variable": "input30","value": input30 });

payload.push({ "variable": "input31","value": input31 });
payload.push({ "variable": "input32","value": input32});
payload.push({ "variable": "input33","value": input33 });
payload.push({ "variable": "input34","value": input34 });
payload.push({ "variable": "input35","value": input35});
payload.push({ "variable": "input36","value": input36 });
payload.push({ "variable": "input37","value": input37 });
payload.push({ "variable": "input38","value": input38});
payload.push({ "variable": "input39","value": input39 });
payload.push({ "variable": "input40","value": input40 });

payload.push({ "variable": "input41","value": input41 });
payload.push({ "variable": "input42","value": input42 });

payload.push({ "variable": "input43","value": input43 });

payload.push({ "variable": "Davronlocation","value":"My Address","location": {"lat":parseFloat(input44), "lng":parseFloat(input45)}});    //{"lat":-26.177394, "lng":28.256277}});


////COMMON INPUT SIGNALS
const commonjockey1 = (input20 + input21) ; //COMMON JOCKEY INPUT FOR TEMPLATE 1 OF SECURE LOGIC 
payload.push({ "variable": "commonjockey1","value": commonjockey1 });

const commonjockey2 = (input22 + input23) ; //COMMON JOCKEY INPUT FOR TEMPLATE 1 OF SECURE LOGIC 
payload.push({ "variable": "commonjockey2","value": commonjockey2 });

const commonelectric = (input13 + input14 + input15 + input16 + input17 + input18 + input19 ) ; 
payload.push({ "variable": "commonelectric","value": commonelectric });

const commondiesel = (input1 + input2 + input3 + input4 + input5 + input6 + input7 + input8 + input9 + input10 + input11 + input12 + input32 + input29 + input29 ) ; 
payload.push({ "variable": "commondiesel","value": commondiesel });

const commonfire = (input1 + input13) ;
payload.push({ "variable": "commonfire","value": commonfire });

const commonannunciator = (input24 + input25 + input26 + input27 + input28 ) ; 
payload.push({ "variable": "commonannunciator","value": commonannunciator });

const commonfault = (input1 + input2 + input3 + input4 + input5 + input6 + input7 + input8 + input9 + input10 + input11 + input12 + input30 +input13 + input14 + input15 + input16 + input17 + input18 + input19 +input20 + input21 + input22 + input23 + input24 + input25 + input26 + input27 + input28 + input29 + input32 ) ;
payload.push({ "variable": "commonfault","value": commonfault });

//// END OF COMMON INPUT SIGNALS








}