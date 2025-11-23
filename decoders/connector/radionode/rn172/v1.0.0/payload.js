console.log("--- TagoIO Payload Parser START (Final Updated Version with Model Override) ---");

// Wrap the entire script in a self-executing function to avoid global scope issues.
(function() {
    let inputPayload = payload;
    let finalProcessedVariables = [];
    let mainData = {};
    let isModelOverridden = false; // Flag to track if the model was overridden

    console.log("Step 1: Initial 'payload' received:", JSON.stringify(inputPayload, null, 2));

    // --- Step 1.1: Input Normalization & Parsing ---
    if (Array.isArray(inputPayload) && typeof inputPayload[0] === 'object') {
        mainData = inputPayload[0];
    } else if (typeof inputPayload === 'object' && inputPayload !== null) {
        mainData = inputPayload;
    } else if (typeof inputPayload === 'string') {
        // Handle form-urlencoded format
        inputPayload.trim().split('&').forEach(pair => {
            const [k, v] = pair.split('=');
            if (k && v) {
                try {
                    mainData[decodeURIComponent(k)] = decodeURIComponent(v);
                } catch (e) {
                    console.warn(`Decode error for pair '${pair}': ${e.message}`);
                }
            }
        });

        // Handle ATCQ format
        const atcqMatch = inputPayload.match(/ATCQ\s+([^,]+),([^,]+),([^,]+),([^,]+)/);
        if (atcqMatch) {
            console.log("Input matches ATCQ format. Parsing sensor data...");
            const [, co2_val, o3_val, temp_val, hum_val] = atcqMatch;
            const values = [parseFloat(co2_val), parseFloat(o3_val), parseFloat(temp_val), parseFloat(hum_val)];
            if (values.every(v => !isNaN(v))) {
                mainData.co2 = values[0];
                mainData.o3 = values[1];
                mainData.temperature = values[2];
                mainData.humidity = values[3];
                mainData.model = 'UA58-APC';
            } else {
                console.warn("ATCQ values could not be parsed as numbers.");
            }
        }
        
        // Handle ATCD format
        const atcdMatch = inputPayload.match(/ATCD\s+(\S+,\S+)/);
        if (atcdMatch) {
            console.log("Input matches ATCD format. Parsing sensor data...");
            const [temp, hum] = atcdMatch[1].split(',').map(Number);
            if (!isNaN(temp) && !isNaN(hum)) {
                mainData.temperature = temp;
                mainData.humidity = hum;
                mainData.model = 'UA-DEVICE';
            }
        }
    } else {
        console.error("Invalid payload format. Expected string, object, or array of objects.");
        payload = [];
        return;
    }

    console.log("Step 2: Parsing dynamic and static keys.");

    // --- Step 2.1: Define the Models Lookup Table ---
    const ua_models_js = {
        "UA58-KFG": ["CO", "O2", "H2S", "CO2"],
        "UA58-CO2": ["CO2", "TEMP", "RH"],
        "UA58-DFG": ["CO", "CH2O", "C6H6"],
        "UA58-LEL": ["LEL", "TEMP", "RH", "CLAS"],
        "UA58-APC": ["CO2", "O3", "TEMP", "RH"],
        "UA50": ["TVOC", "ECO2"],
        "UA52-CO2": ["CO2", "TEMP"],
        "UA52-O2": ["O2", "TEMP"],
        "UA53-CO": ["CO", "TEMP", "RH"],
        "UA53-H2S": ["H2S", "TEMP", "RH"],
        "UA53-O3": ["O3", "TEMP", "RH"],
        "UA53-SO2": ["SO2", "TEMP", "RH"],
        "UA53-NO2": ["NO2", "TEMP", "RH"],
        "UA54-NH3": ["NH3", "TEMP", "RH"],
        "UA54-H2S": ["H2S", "TEMP", "RH"],
        "UA54-C2H4": ["C2H4", "TEMP", "RH"],
        "UA54-EO": ["EO", "TEMP", "RH"],
        "UA54-H2": ["H2", "TEMP", "RH"],
        "UA54-HCL": ["HCL", "TEMP", "RH"],
        "UA54-NO": ["NO", "TEMP", "RH"],
        "UA54-CL2": ["CL2", "TEMP", "RH"],
        "UA54-O2": ["O2", "TEMP", "RH"],
        "UA54-VOC": ["VOC", "TEMP", "RH"],
        "UA10": ["TEMP", "RH"],
        "UA11": ["TEMP", "TEMP"],
        "UA12": ["TEMP", "TEMP"],
        "UA13": ["TEMP"],
        "UA20A": ["mA", "mA"],
        "UA20B": ["mA"],
        "UA20C": ["mV", "mV"],
        "UA20D": ["Puls"],
        "UA20E": ["CH1", "CH2", "CH3", "CH4", "CH5", "CH6"],
        "UA59-CO2": ["CO2", "TEMP"],
        "UA60-PMVT": ["PM25", "PM10", "PM01", "TVOC", "TEMP", "RH"],
        "UA-DEVICE": ["TEMP", "RH"],
        "UA-DEVICE_NULL": ["TEMP", "RH"], // New model to handle null values
        "RN400-PG": [],
        "RN172WC": []
    };

    // --- Step 2.2: Identify the Model and Override if necessary ---
    let modelKey = mainData.model || mainData.SMODEL;
    let originalSModel = modelKey; // Store the original SMODEL

    // Override the model if the payload structure matches UA58-APC.
    if (modelKey === 'UA-DEVICE' && mainData.C000) {
        const channelData = mainData.C000.split('|').filter(x => x.trim() !== '');
        // Check if the payload has 4 sensor values + 1 timestamp
        if (channelData.length === 5) {
            modelKey = 'UA58-APC';
            isModelOverridden = true;
            console.log(`SMODEL '${originalSModel}' overridden to '${modelKey}' based on payload structure.`);
        }
    }
    
    // Check for the specific UA-DEVICE payload with a NULL value
    if (modelKey === 'UA-DEVICE' && mainData.C000) {
        const channelData = mainData.C000.split('|');
        if (channelData[3] && channelData[3].trim() === 'NULL') {
            modelKey = 'UA-DEVICE_NULL';
            isModelOverridden = true;
            console.log(`SMODEL '${originalSModel}' overridden to '${modelKey}' based on NULL value in payload.`);
        }
    }

    const modelVars = ua_models_js[modelKey];

    if (!modelKey || !modelVars) {
        console.error(`Unknown or missing model '${modelKey}'. Cannot process dynamic channels.`);
    } else {
        console.log(`Model '${modelKey}' identified. Channel variables: ${modelVars.join(', ')}`);
        
        for (const key in mainData) {
            // Check for patterns like C000, P001, CH1, etc.
            if (key.match(/^(C|P|CH)\d+/)) {
                console.log(`Dynamic key '${key}' found. Parsing data...`);
                const channelData = mainData[key].split('|').map(x => x.trim());

                if (modelKey === 'UA-DEVICE_NULL') {
                    // Specific parsing for payloads with NULL value
                    if (channelData.length >= 3) {
                         const timestamp = parseFloat(channelData[0]);
                         let valueIndex = 1;
                         
                         for (let i = 0; i < modelVars.length; i++) {
                             const varName = modelVars[i];
                             const value = parseFloat(channelData[valueIndex]);

                             // Add a range check for temperature values
                             if (varName === 'TEMP' && (value < -50 || value > 100)) {
                                 console.warn(`Ignoring out-of-range temperature value: ${value}`);
                                 valueIndex++;
                                 continue;
                             }
                             
                             if (!isNaN(value) && varName !== '----') {
                                 const entry = {
                                     variable: varName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                                     value: value,
                                     time: new Date(timestamp * 1000)
                                 };
                                 if (varName === 'RH') entry.unit = '%';
                                 finalProcessedVariables.push(entry);
                             }
                             valueIndex++;
                         }
                    }
                } else {
                    // Original parsing logic
                    if (channelData.length >= modelVars.length + 1) {
                        const timestamp = parseFloat(channelData[0]);
                        for (let i = 0; i < modelVars.length; i++) {
                            const varName = modelVars[i];
                            const value = parseFloat(channelData[i + 1]);

                            // Add a range check for temperature values
                            if (varName === 'TEMP' && (value < -50 || value > 100)) {
                                console.warn(`Ignoring out-of-range temperature value: ${value}`);
                                continue;
                            }

                            if (!isNaN(value) && varName !== '----') {
                                const entry = {
                                    variable: varName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                                    value: value,
                                    time: new Date(timestamp * 1000)
                                };

                                // Add specific units based on the variable name
                                if (varName === 'CO2') entry.unit = 'ppm';
                                else if (varName === 'O3') entry.unit = 'ppb';
                                else if (varName === 'RH') entry.unit = '%';
                                else if (varName === 'mA') entry.unit = 'mA';
                                else if (varName === 'mV') entry.unit = 'mV';
                                else if (varName.startsWith('PM')) entry.unit = 'ug/m3';
                                
                                finalProcessedVariables.push(entry);
                            }
                        }
                    } else {
                        console.warn(`Mismatch in number of channel values (${channelData.length - 1}) and expected variables (${modelVars.length}) for model '${modelKey}'.`);
                    }
                }
                
                // Remove the processed key to prevent double-handling
                delete mainData[key];
            }
        }
    }

    // --- Step 2.3: Process the RN172WC 'tags' payload separately ---
    if (modelKey === "RN172WC" && mainData.tags) {
        console.log("Processing RN172WC 'tags' payload...");
        const tagValues = mainData.tags.split('|').filter(s => s.trim() !== '');
        
        if (tagValues.length >= 2) {
            const temp = parseFloat(tagValues[0].trim());
            const rh = parseFloat(tagValues[1].trim());

            if (!isNaN(temp)) {
                finalProcessedVariables.push({ variable: 'temperature', value: temp, unit: 'C' });
            }
            if (!isNaN(rh)) {
                finalProcessedVariables.push({ variable: 'humidity', value: rh, unit: '%' });
            }
        }
    }

    // --- Step 2.4: Process Static Keys ---
    const directMappings = {
        mac: 'mac',
        ver: 'version',
        model: 'model',
        ip: 'ip',
        splrate: 'splrate',
        rsti: 'rsti',
        interval: 'interval',
        tags: 'tags',
        sig: 'signal',
        bat: 'battery',
        SMODEL: 'sensor_model',
        analog_1: 'analog_1',
        analog_2: 'analog_2',
        co2: 'co2',
        o3: 'o3'
    };

    for (const key in directMappings) {
        if (mainData.hasOwnProperty(key)) {
            let value = mainData[key];
            const variableName = directMappings[key];
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) value = numValue;

            const entry = { variable: variableName, value };
            if (key === 'temperature') entry.unit = 'C';
            if (key === 'humidity') entry.unit = '%';
            if (key === 'co2') entry.unit = 'ppm';
            if (key === 'o3') entry.unit = 'ppb';
            finalProcessedVariables.push(entry);
        }
    }
    
    // --- Step 2.5: Override the sensor_model variable ---
    if (isModelOverridden) {
        const smodelIndex = finalProcessedVariables.findIndex(item => item.variable === 'sensor_model');
        if (smodelIndex !== -1) {
            finalProcessedVariables[smodelIndex].value = modelKey;
            console.log(`Updated 'sensor_model' to '${modelKey}'.`);
        }
    }


    console.log("Step 3: Final payload for TagoIO:", JSON.stringify(finalProcessedVariables, null, 2));
    console.log("--- TagoIO Payload Parser END ---");

    // Assign the final array back to the payload variable for TagoIO.
    payload = finalProcessedVariables;
})();