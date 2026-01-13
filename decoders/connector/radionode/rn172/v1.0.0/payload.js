/**
 * Radionode RN172 Payload Decoder
 */

(function() {
    let inputPayload = payload;
    let finalProcessedVariables = [];
    let mainData = {};
    let isModelOverridden = false;

    // --- Step 1.1: Input Normalization & Parsing ---
    // Extract the raw string from TagoIO array/object or handle raw string
    let rawString = "";
    if (typeof inputPayload === 'string') {
        rawString = inputPayload;
    } else if (Array.isArray(inputPayload) && inputPayload[0] && inputPayload[0].value) {
        rawString = inputPayload[0].value;
    } else if (typeof inputPayload === 'object' && inputPayload !== null && inputPayload.value) {
        rawString = inputPayload.value;
    }

    if (rawString) {
        // Handle form-urlencoded format (e.g., model=UA10&C000=...)
        rawString.trim().split('&').forEach(pair => {
            const [k, v] = pair.split('=');
            if (k && v) {
                try {
                    mainData[decodeURIComponent(k)] = decodeURIComponent(v);
                } catch (e) {
                    console.warn(`Decode error: ${e.message}`);
                }
            }
        });

        // Handle ATCQ format
        const atcqMatch = rawString.match(/ATCQ\s+([^,]+),([^,]+),([^,]+),([^,]+)/);
        if (atcqMatch) {
            const [, co2_val, o3_val, temp_val, hum_val] = atcqMatch;
            mainData.co2 = parseFloat(co2_val);
            mainData.o3 = parseFloat(o3_val);
            mainData.temperature = parseFloat(temp_val);
            mainData.humidity = parseFloat(hum_val);
            mainData.model = 'UA58-APC';
        }

        // Handle ATCD format
        const atcdMatch = rawString.match(/ATCD\s+(\S+,\S+)/);
        if (atcdMatch) {
            const [temp, hum] = atcdMatch[1].split(',').map(Number);
            mainData.temperature = temp;
            mainData.humidity = hum;
            mainData.model = 'UA-DEVICE';
        }
    }

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
        "UA-DEVICE_NULL": ["TEMP", "RH"],
        "RN400-PG": [],
        "RN172WC": []
    };

    // --- Step 2.2: Identify the Model and Override if necessary ---
    let modelKey = mainData.model || mainData.SMODEL;
    let originalSModel = modelKey;

    if (modelKey === 'UA-DEVICE' && mainData.C000) {
        const channelData = mainData.C000.split('|').filter(x => x.trim() !== '');
        if (channelData.length === 5) {
            modelKey = 'UA58-APC';
            isModelOverridden = true;
        } else if (channelData[3] && channelData[3].trim() === 'NULL') {
            modelKey = 'UA-DEVICE_NULL';
            isModelOverridden = true;
        }
    }

    const modelVars = ua_models_js[modelKey];

    if (modelKey && modelVars) {
        for (const key in mainData) {
            if (key.match(/^(C|P|CH)\d+/)) {
                const channelData = mainData[key].split('|').map(x => x.trim());

                const timestamp = parseFloat(channelData[0]);
                const time = !isNaN(timestamp) ? new Date(timestamp * 1000) : new Date();

                if (modelKey === 'UA-DEVICE_NULL') {
                    if (channelData.length >= 3) {
                         let valueIndex = 1;
                         for (let i = 0; i < modelVars.length; i++) {
                             const varName = modelVars[i];
                             const value = parseFloat(channelData[valueIndex]);
                             if (varName === 'TEMP' && (value < -50 || value > 100)) {
                                 valueIndex++;
                                 continue;
                             }
                             if (!isNaN(value) && varName !== '----') {
                                 const entry = {
                                     variable: varName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                                     value: value,
                                     time: time
                                 };
                                 if (varName === 'RH') entry.unit = '%';
                                 finalProcessedVariables.push(entry);
                             }
                             valueIndex++;
                         }
                    }
                } else {
                    if (channelData.length >= modelVars.length + 1) {
                        for (let i = 0; i < modelVars.length; i++) {
                            const varName = modelVars[i];
                            const value = parseFloat(channelData[i + 1]);
                            if (varName === 'TEMP' && (value < -50 || value > 100)) continue;

                            if (!isNaN(value) && varName !== '----') {
                                const entry = {
                                    variable: varName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                                    value: value,
                                    time: time
                                };
                                if (varName === 'CO2') entry.unit = 'ppm';
                                else if (varName === 'O3') entry.unit = 'ppb';
                                else if (varName === 'RH') entry.unit = '%';
                                else if (varName === 'mA') entry.unit = 'mA';
                                else if (varName === 'mV') entry.unit = 'mV';
                                else if (varName.startsWith('PM')) entry.unit = 'ug/m3';
                                finalProcessedVariables.push(entry);
                            }
                        }
                    }
                }
                delete mainData[key];
            }
        }
    }

    // --- Step 2.3: Process RN172WC tags ---
    if (modelKey === "RN172WC" && mainData.tags) {
        const tagValues = mainData.tags.split('|').filter(s => s.trim() !== '');
        if (tagValues.length >= 2) {
            const temp = parseFloat(tagValues[0].trim());
            const rh = parseFloat(tagValues[1].trim());
            if (!isNaN(temp)) finalProcessedVariables.push({ variable: 'temperature', value: temp, unit: 'C' });
            if (!isNaN(rh)) finalProcessedVariables.push({ variable: 'humidity', value: rh, unit: '%' });
        }
    }

    // --- Step 2.4/2.5: Process Static Keys ---
    const directMappings = {
        mac: 'mac',
        model: 'model',
        bat: 'battery',
        SMODEL: 'sensor_model'
    };

    for (const key in directMappings) {
        if (mainData.hasOwnProperty(key)) {
            let val = mainData[key];
            if (key === 'SMODEL' && isModelOverridden) val = modelKey;
            finalProcessedVariables.push({ variable: directMappings[key], value: val });
        }
    }

    // --- Step 2.6: Final Merge ---
    if (Array.isArray(inputPayload)) {
        inputPayload.forEach(item => {
            if (item && item.variable && !finalProcessedVariables.some(v => v.variable === item.variable)) {
                finalProcessedVariables.push(item);
            }
        });
    }

    payload = finalProcessedVariables;
})();