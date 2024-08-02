/* 
** NOTES:
   The Siglog 32A2 sends a string of characters that gets split into specific inputs. 

** TESTING
[
  {
       "variable": "payload",
        "value": "1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,ERn1,0,0,0,1,ERR U,ERR U,13.789,17,V1.7,#0015,-26.12155,28.20558",
        "metadata": {
        "mqtt_topic": "&0015"
        }
  }
]

** SETTING A SPECIFIC LOCATION OF A SIGLOG 32A2 IF NOT GNSS ACTIVE  
   GNSS LOCATION
   payload.push({ "variable": "Sitelocation","value":"My Address","location": {"lat":parseFloat(input44), "lng":parseFloat(input45)}});    
      
   FIXED LOCATION 
   payload.push({ "variable": "Sitelocation","value":"My Address","location": {"lat":-26.107132, "lng":28.053449 }});  

** CREATING COMMON SIGNALS
   const commonfault = (splitValues[1] + splitValues[2] ) ;  //Split value represents the input number 
   payload.push({ "variable": "commonfault","value": commonfault });
*/

function deviceTester(slstr: any) {
  const splitValues = slstr.split(",");
  if (splitValues[0] !== "1") {
    throw new Error("String Not Valid");
  }
  if (slstr.length < 120) {
    throw new Error("String Length Not Valid");
  }
  return true;
}

function decodePayload(bytes: any) {
  const splitValues = bytes.split(",");

  for (let i = 0; i < splitValues.length; i++) {
    payload.push({ variable: `input${i}`, value: splitValues[i] });
  }

  ///Common signals can be added here

  payload.push({
    variable: "sitelocation",
    value: "My Address",
    location: {
      lat: parseFloat(splitValues[44]),
      lng: parseFloat(splitValues[45]),
    },
  });
}

const rawValues1 = payload.find((item: any) => item.variable === "payload");

if (rawValues1) {
  try {
    const buffer = rawValues1.value;
    if (deviceTester(buffer)) {
      decodePayload(buffer);
    }
  } catch (error) {
    payload = [{ variable: "parse_error", value: error.message }];
  }
} else {
  try {
    // throw new Error("Payload Not Valid");
  } catch (error) {
    // Print the error to the Live Inspector.
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
