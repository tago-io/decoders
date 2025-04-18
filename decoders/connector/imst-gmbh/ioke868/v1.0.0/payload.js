/*
 * iOKE868 decoder for TagoIO
 *
 * Modification History:
 * Date         Version     Modified By     Description
 * 2020-10-01   1.0         MR              Initial creation
 * 2020-10-13   1.1         MR              decoding only on ports,that identify, that the payload is not segmented
 * 2020-12-01   1.2         MR              usage of functions | connector
 * 2020-12-02   1.3         MR              conversion to float values of string objects
 * 2020-12-07   1.4         MR              >>> 0 for UINT32 for counter in status
 * 2020-12-08   1.5         MR              regard '+' and '-' on conversion to float values of string objects
 * 2020-12-09   1.6         MR              regard '+' and '-' only on start of string objects when converting to float values
 *                                          also convert when the payload is segmented at the risk that it is not possible, but with a warning message
 * 2020-12-15   1.7         MR              fix in length check on parsing meter id
 * 2020-12-16   1.8         MR              fix in object with string, when string cannot converted to string or float
 * 2020-12-17   1.9         MR              fix in mantissa calculation, when greater than 4 bytes
 * 2021-02-01   1.10        MR              fix for checking payload size | analyze OTAA Procedure State in status
 * 2020-02-23   1.11        MR              mantissa calculation as int64
 * 2020-03-30   1.12        MR              added keys for getting port and payload for TTIv3 / TTNv3
 * 2021-11-02   1.13        MR              status extended with system voltage and firmware type for firmware 1.1ff
 * 2023-01-18   1.14        MR              removed forwarding of empty object as value (e.g. for general_info, when values are not specified)
 *                                          otherwise zodError with TagoIO Admin - v7.8.1 & API - v8.4.8
 * 2025-01-07   1.15        MR              adapted to Admin/API version v7.55.1 / v8.23.8
 * 2025-01-17   1.16        MR              info field in status field updated to firmware version V1.2ff
 *                                          added error code 'no filtered data' for status field
 *                                          reserved byte added in Status Upload according to firmware version V1.3ff
 *                                          adjustments regarding linter errors / warnings
 * 2025-02-11   1.17        MR              renamed Reserved_V1.3 to Reserved_V1_3, otherwise decoding error 'Connection refused, invalid payload:'
 */

console.log("use of payload parser V1.16 for 'IMST iO881A for LoRaWAN®' on TagoIO");

//ports of none segmented payload
var PORT_SEGMENTATION_BIT = 0x40;
var STATUS_PORT = 0x03;
var STATUS_PORT_SEGMENTED = PORT_SEGMENTATION_BIT | STATUS_PORT;
var METER_VALUE_PORT = 0x05;
var METER_VALUE_PORT_SEGMENTED = PORT_SEGMENTATION_BIT | METER_VALUE_PORT;
var SEGMENTED_WARNING = "WARNING: decoding of segmented payload - values can be incorrect or incomplete"

//uniform start for the decoder
//@param:     bytes - uplink LoRaWAN® payload
//            port - uplink LoRaWAN® port
//@return:    object of interpreted information depending on port and segmentation
function startiO880AIMSTDecoder(bytes, port) {
    //create object to fill with indicated data fields
    var retObject = {
        raw: bytes,
        port: port,
        message: "data on this port are not intended for decoding"
    };

    switch (port) {
        case METER_VALUE_PORT_SEGMENTED:
            //remove segmentation byte
            bytes = bytes.slice(1);
            console.log(SEGMENTED_WARNING);
            retObject = decodeIRReaderPayload(bytes);
            break;
        case METER_VALUE_PORT:
            //upload port for meter data
            retObject = decodeIRReaderPayload(bytes);
            break;
        case STATUS_PORT_SEGMENTED:
            //remove segmentation byte
            bytes = bytes.slice(1);
            console.log(SEGMENTED_WARNING);
            retObject = decodeStatusPayload(bytes);
            break;
        case STATUS_PORT:
            //upload port for status data
            retObject = decodeStatusPayload(bytes);
            break;
    }
    return retObject;
}

/*****
decode meter data start
******/
var TYPE_MASK = 0xF0;
var SUB_TYPE_MASK = 0x0F;
var INFO_TYPE = 0x00;
var METER_ID_TYPE = 0x10;
var OBJECT_TYPE = 0x40;

var ERROR_METER_DATA = "ERROR: unable to decode meter data: hex ";
var ERROR_STATUS_FIELD = "ERROR: unable to decode status field: hex ";
var ERROR_TIME_FIELD = "ERROR: unable to decode time field: hex ";
var ERROR_METER_ID = "ERROR: unable to decode meter ID: hex ";
var ERROR_OBJECT_FIELD = "ERROR: unable to decode meter object field: hex ";

var INFO_STATUS_TYPE = 0x00;
var INFO_TIME_TYPE = 0x01;
var POWER_PHASE_TOTAL_TYPE = 0x00;
var POWER_PHASE_L1_TYPE = 0x01;
var POWER_PHASE_L2_TYPE = 0x02;
var POWER_PHASE_L3_TYPE = 0x03;
var OBJECT_WITH_UNIT = 0x00;
var OBJECT_WITHOUT_UNIT = 0x01;
var OBJECT_WITH_STRING = 0x02;

var STATUS_FIELD_HEADER_SIZE = 2;
var STATUS_FIELD_PAYLOAD_SIZE = 2;
var STATUS_FIELD_INFO_METER_TYPE_MASK = 0x3;
var STATUS_FIELD_INFO_INPUT_TYPE_MASK = 0x1C;
var STATUS_FIELD_INFO_INPUT_TYPE_SHIFT = 2;
var STATUS_INFO_INPUT_TYPE_UNKNOWN = 0;
var STATUS_INFO_INPUT_TYPE_IEC_A = 1;
var STATUS_INFO_INPUT_TYPE_IEC_B = 2;
var STATUS_INFO_INPUT_TYPE_IEC_C = 3;
var STATUS_INFO_INPUT_TYPE_IEC_D = 4;
var STATUS_INFO_INPUT_TYPE_SML = 6;
var STATUS_FIELD_OK = 0;
var STATUS_FIELD_NO_INPUT = 1;
var STATUS_FIELD_INPUT_FILE_ERROR = 2;
var STATUS_FIELD_INPUT_FILE_INCOMPLETE = 3;
var STATUS_FIELD_UNKNOWN_METER_ID = 4;
var STATUS_FIELD_NO_FILTERED_DATA = 5;
var STATUS_INFO_METER_TYPE_UNKNOWN = 0;
var STATUS_INFO_METER_TYPE_IMPORT = 1;
var STATUS_INFO_METER_TYPE_EXPORT = 2;
var STATUS_INFO_METER_TYPE_IMPORT_EXPORT = 3;

var TIME_FIELD_HEADER_SIZE = 2;
var TIME_FIELD_PAYLOAD_SIZE = 4;

var METER_FIELD_HEADER_SIZE = 2;  // Type + Length


// Object data without unit
var OBJECT_WITH_ID_FIELD_HEADER_SIZE = 4;  // Type + Length + GroupMask + Scaler
var OBJECT_WITH_ID_FIELD_TYPE_INDEX = 0;
var OBJECT_WITH_ID_FIELD_LENGTH_INDEX = 1;
var OBJECT_WITH_ID_FIELD_GROUP_MASK_INDEX = 2;
var OBJECT_WITH_ID_FIELD_OBIS_ID_INDEX = 3;
var OBJECT_WITH_ID_FIELD_SCALER_INDEX_DEPENDENT_OBIS_ID = 0;
var OBJECT_WITH_ID_FIELD_MANTISSA_INDEX_DEPENDENT_OBIS_ID = 1;

// Object data with unit
var OBJECT_ID_AND_UNIT_FIELD_HEADER_SIZE = 5;  // Type + Length + GroupMask + Unit + Scaler
var OBJECT_ID_AND_UNIT_FIELD_TYPE_INDEX = 0;
var OBJECT_ID_AND_UNIT_FIELD_LENGTH_INDEX = 1;
var OBJECT_ID_AND_UNIT_FIELD_GROUP_MASK_INDEX = 2;
var OBJECT_ID_AND_UNIT_FIELD_OBIS_ID_INDEX = 3;
var OBJECT_ID_AND_UNIT_FIELD_UNIT_INDEX_DEPENDENT_OBIS_ID = 0;
var OBJECT_ID_AND_UNIT_FIELD_SCALER_INDEX_DEPENDENT_OBIS_ID = 1;
var OBJECT_ID_AND_UNIT_FIELD_MANTISSA_INDEX_DEPENDENT_OBIS_ID = 2;

// Object data without string
var OBJECT_WITH_STRING_HEADER_SIZE = 3;  // Type + Length + GroupMask
var OBJECT_WITH_STRING_TYPE_INDEX = 0;
var OBJECT_WITH_STRING_LENGTH_INDEX = 1;
var OBJECT_WITH_STRING_GROUP_MASK_INDEX = 2;
var OBJECT_WITH_STRING_OBIS_ID_INDEX = 3;

//OBIS ID Groups
var OBIS_ID_GROUP_A = (1 << 7);
var OBIS_ID_GROUP_B = (1 << 6);
var OBIS_ID_GROUP_C = (1 << 5);
var OBIS_ID_GROUP_D = (1 << 4);
var OBIS_ID_GROUP_E = (1 << 3);
var OBIS_ID_GROUP_F = (1 << 2);

//naming of object fields
var OBIS_IDS_NAME = "OBIS_IDs";
var INFO_NAME = "general_info";
var INFO_LOG_NAME = "Info_Log";
//Variable field should NOT contain special characters such as *?!<>.-=$ or space
var OBIS_ID_DELIMITER = "_";

//lookup table for uploaded integer value to unit string
var dlmsUnits = {
    // code, unit
    //===========
    1: 'a',
    2: 'mo',
    3: 'wk',
    4: 'd',
    5: 'h',
    6: 'min.',
    7: 's',
    8: '°',
    9: '°C',
    10: 'currency',
    11: 'm',
    12: 'm/s',
    13: 'm³',
    14: 'm³',
    15: 'm³/h',
    16: 'm³/h',
    17: 'm³/d',
    18: 'm³/d',
    19: 'l',
    20: 'kg',
    21: 'N',
    22: 'Nm',
    23: 'Pa',
    24: 'bar',
    25: 'J',
    26: 'J/h',
    27: 'W',
    28: 'VA',
    29: 'var',
    30: 'Wh',
    31: 'VAh',
    32: 'varh',
    33: 'A',
    34: 'C',
    35: 'V',
    36: 'V/m',
    37: 'F',
    38: 'Ω',
    39: 'Ωm²/m',
    40: 'Wb',
    41: 'T',
    42: 'A/m',
    43: 'H',
    44: 'Hz',
    45: '1/(Wh)',
    46: '1/(varh)',
    47: '1/(VAh)',
    48: 'V²h',
    49: 'A²h',
    50: 'kg/s',
    51: 'S, mho',
    52: 'K',
    53: '1/(V²h)',
    54: '1/(A²h)',
    55: '1/m³',
    56: '%',
    57: 'Ah',
    60: 'Wh/m³',
    61: 'J/m³',
    62: 'Mol %',
    63: 'g/m³',
    64: 'Pa s',
    253: '',
    254: '',
    255: ''
};

/****
go through the payload bytes and interpret parts based on type fields
@param:     uploaded payload bytes of meter data (without segmentation byte if preivously attached)
@return:    object of interpreted meter fields and general information
****/
function decodeIRReaderPayload(payload) {
    //position in payload
    pos = 0
    //create empty object to fill with indicated data fields
    var results = {};
    //array for indicated meter objects
    results[OBIS_IDS_NAME] = [];
    //create empty object for general information
    results[INFO_NAME] = {};

    //type and length field at pos and pos+1 must be available for further interpretation
    if ((pos + 2) >= payload.length) {
        logDecodeError(payload, pos, [], ERROR_METER_DATA);
        return results;
    }

    //go through the payload bytes, but not beyond the end
    //type and length field at pos and pos+1 must be available for further interpretation
    while ((pos + 2) <= payload.length) {
        //type field defines the type of data which is included in the data field
        type = payload[pos];
        //length field indicates the number of bytes which are present in the data field
        typeLength = payload[pos + 1];
        //lookup main type
        switch (type & TYPE_MASK) {
            // INFO Field
            case INFO_TYPE:
                //lookup sub type of info field
                switch (type & SUB_TYPE_MASK) {
                    //Status Field
                    case INFO_STATUS_TYPE:
                        //analyze payload at define position as status information
                        retArray = decodeStatus(payload, pos);
                        if (retArray.length >= 1) {
                            //first element in returned array is always the length of presented status
                            length = retArray[0];
                            //if return array consist of at least 6 elements, than individual elements can be assigned
                            if (retArray.length >= 6) {
                                //info byte of data field
                                info = retArray[1];
                                results[INFO_NAME]["InfoByte"] = info
                                //error/status byte of data field
                                status = retArray[2];
                                results[INFO_NAME]["StatusByte"] = status
                                //protocol type - of interpreted info byte
                                inputType = retArray[3];
                                results[INFO_NAME]["InputType"] = inputType;
                                //meter type - of interpreted info byte
                                meterType = retArray[4];
                                results[INFO_NAME]["MeterType"] = meterType;
                                //interpreted error / status Field
                                infraredInputStatus = retArray[5];
                                results[INFO_NAME]["InfraredInputStatus"] = infraredInputStatus;
                                //if more than usual bytes were found, take these one-to-one
                                if (retArray.length > 6) {
                                    further = retArray[3];
                                    results[INFO_NAME]["further Status"] = further;
                                }
                            }
                            else {
                                logDecodeError(payload, pos, retArray, ERROR_STATUS_FIELD);
                            }
                        }
                        else {
                            logDecodeError(payload, pos, retArray, ERROR_STATUS_FIELD);
                        }
                        break;
                    //Time Field
                    case INFO_TIME_TYPE:
                        //analyze payload at define position as status information
                        retArray = decodeTime(payload, pos);
                        //if return array consist of at least 2 elements, than individual elements can be assigned
                        if (retArray.length >= 2) {
                            //first element in returned array is always the length of presented status
                            length = retArray[0];
                            //time value in seconds | >>> 0 for UINT32
                            time = retArray[1] >>> 0;
                            //create date object of received timestamp in milliseconds
                            var date = new Date(time * 1000);
                            //convert to a readable time string
                            results[INFO_NAME]["Time"] = date.toString();
                            //set indicator that the time was received from the device
                            results[INFO_NAME]["Time_Origin"] = "device time";
                        }
                        else {
                            logDecodeError(payload, pos, retArray, ERROR_TIME_FIELD);
                        }
                        break;
                    //sub type of info field is neither status nor time
                    default:
                        console.log("unsupported sub type for info: " + type.toString(16));
                        break;
                }
                //end of info type
                break;
            //Meter ID Field
            case METER_ID_TYPE:
                //analyze payload at define position as meter id
                retArray = decodeMeterID(payload, pos);
                //if return array consist of at least one elements, than length of object field is assigned
                if (retArray.length > 0) {
                    //first element in returned array is always the length of presented status
                    length = retArray[0];
                    //if return array consist of at least two elements, than meter id of the connected smart meter is assigned
                    if (retArray.length > 1) {
                        //meter id in string presentation
                        meterIDString = retArray[1];
                        results[INFO_NAME]["MeterID"] = meterIDString;
                    }
                    else {
                        logDecodeError(payload, pos, retArray, ERROR_METER_ID);
                    }
                }
                else {
                    logDecodeError(payload, pos, retArray, ERROR_METER_ID);
                }
                break;
            //Meter Object Field
            case OBJECT_TYPE:
                retArray = [];
                //lookup sub type of meter object field
                switch (type & SUB_TYPE_MASK) {
                    //field includes a meter data record which consists of an OBIS-ID field, a unit field, a scaler field and a mantissa field
                    case OBJECT_WITH_UNIT:
                        retArray = decodeObjectWithIDAndUnitField(payload, pos);
                        break;
                    //field includes a meter data record which consists of an OBIS-ID field, a scaler field and a mantissa field
                    case OBJECT_WITHOUT_UNIT:
                        retArray = decodeObjectWithIDField(payload, pos);
                        break;
                    //field includes meter data as a string and not a number with scaler (exponent) and mantissa
                    case OBJECT_WITH_STRING:
                        retArray = decodeObjectWithString(payload, pos);

                        //return [length, obisID, groupMask, stringBuffer];
                        if (retArray.length >= 4) {
                            length = retArray[0];
                            //obis id as string
                            obisID = retArray[1];
                            //group mask value, that indicates which of the six possible OBIS-ID Group values A-F is included in the following OBIS-ID Value Field
                            groupMask = retArray[2];
                            //stringBuffer
                            stringBuffer = retArray[3];

                            //create object to contain all information for one meter object field
                            objectResults = {};
                            //obis id as string
                            objectResults["OBIS_ID"] = obisID;
                            //group mask value
                            objectResults["GroupMask"] = groupMask;
                            //value in string representation
                            objectResults["rawValue"] = buffer_to_hex_string(stringBuffer);


                            //convert bytes to ascii
                            var stringValue = buffer_to_ascii(stringBuffer);
                            if (stringValue.length > 0) {
                                ////value in string representation
                                objectResults["stringValue"] = stringValue;
                                //if an ascii value for meter data is available, interpret meter data bytes to hex string and interpreted ascii value
                                var extractArray = extract_value_from_object_string_value(stringValue);
                                if (extractArray != null) {
                                    if (extractArray.length >= 1) {
                                        floatValue = extractArray[0]
                                        objectResults["value"] = floatValue;
                                    }
                                    if (extractArray.length >= 2) {
                                        unit = extractArray[1]
                                        objectResults["unit"] = unit;
                                    }
                                }
                                else {
                                    objectResults["value"] = stringValue;
                                }
                            }
                            else {
                                objectResults["value"] = buffer_to_hex_string(stringBuffer);
                            }


                            //check if float interpretation of string value was possible
                            if (retArray.length >= 4) {
                                //extracted float from string value
                                var floatValue = retArray[4];
                                //extracted float value
                                objectResults["floatValue"] = floatValue;
                            }
                            //add object with meter object information to array for indicated meter objects
                            results[OBIS_IDS_NAME].push(objectResults);
                            //return object with indicated data fields
                        }
                        //break OBJECT_TYPE
                        break;
                    //continue with next type
                    default:
                        console.log("unsupported sub type for object: " + type.toString(16));
                        break;
                }

                //if return array consist of at least 3 elements, rudimentary elements of meter object are available
                if (retArray.length >= 3) {
                    //first element in returned array is always the length of presented status
                    length = retArray[0];
                    //obis id as string
                    obisID = retArray[1];
                    //group mask value, that indicates which of the six possible OBIS-ID Group values A-F is included in the following OBIS-ID Value Field
                    groupMask = retArray[2];
                    //mantissa
                    value = retArray[3];

                    //if return array consist of at least 6 elements, than meter object with scaler and mantisse is available
                    if (retArray.length >= 6) {
                        //unit value, -1 if no unit is available
                        unit = retArray[3];
                        //scaler field
                        ascaler = retArray[4];
                        //check scaler for negative value - int8
                        if ((ascaler & 0x80) == 0x80)
                            ascaler -= 0x100;
                        //mantissa
                        value = retArray[5];

                        //create object to contain all information for one meter object field
                        objectResults = {};
                        //obis id as string
                        objectResults["OBIS_ID"] = obisID;
                        //group mask value
                        objectResults["GroupMask"] = groupMask;
                        if (unit != -1) {
                            //unit in string representation
                            objectResults["unit"] = resolveUnit(unit);
                        }
                        //scaler field
                        objectResults["Scaler"] = ascaler;
                        //mantissa
                        objectResults["rawValue"] = value * 1.0;
                        //calculated value of mantissa and scaler
                        objectResults["value"] = parseFloat((value * Math.pow(10, ascaler)).toFixed(ascaler < 0 ? ascaler * -1 : 0));

                        //add object with meter object information to array for indicated meter objects
                        results[OBIS_IDS_NAME].push(objectResults);
                    }
                }
                else {
                    logDecodeError(payload, pos, retArray, ERROR_OBJECT_FIELD);
                }
                break;
            default:
                //main type of info field is neither info nor Meter ID Field or Meter Object Field
                console.log("unsupported type: " + type.toString(16));
                break;
        }
        //set position in payload bytes to end of interpreted object
        //2 for type and length + length field value, which indicates the number of bytes which are present in the data field
        pos += 2 + typeLength;

        if (((pos + 2) > payload.length) && ((pos) < payload.length))
            logDecodeError(payload, pos, [], ERROR_METER_DATA);
    }

    //return object with indicated data fields
    return results;
}

function logDecodeError(bytes, pos, retArray, errorMessage) {
    if (retArray.length == 1)
        bytes = bytes.slice(pos, pos + 2 + retArray[0]);
    else
        bytes = bytes.slice(pos);
    byteString = bytes.map(function (byte) {
        return (('0' + (byte & 0xFF).toString(16)).slice(-2))
    }).join('-');
    console.log(errorMessage + byteString);
}

/****
go through the payload bytes starting at pos and interpret status
@param: payload - uploaded payload bytes of meter data (without segmentation byte if previously attached)
        pos - position in payload for status on type field
@return: array - [length, infoFieldByte, status/error field byte, interpreted inputType string, interpreted meterType string, interpreted error / status field as string, further bytes] or
                 [length, infoFieldByte, status/error field byte, interpreted inputType string, interpreted meterType string, interpreted error / status field as string] or
                 [length] or
                 []
                 depending on the available bytes
****/
function decodeStatus(payload, pos) {
    if (payload.length - pos >= STATUS_FIELD_HEADER_SIZE) {
        pos++;
        var length = payload[pos++];
        if ((length >= STATUS_FIELD_PAYLOAD_SIZE) && (payload.length >= length + pos)) {
            info = payload[pos++];
            status = payload[pos++];
            infraredInputStatus = "unknown";
            switch (status) {
                case STATUS_FIELD_OK:
                    infraredInputStatus = "ok";
                    break;
                case STATUS_FIELD_NO_INPUT:
                    infraredInputStatus = "no input";
                    break;
                case STATUS_FIELD_INPUT_FILE_ERROR:
                    infraredInputStatus = "input file error";
                    break;
                case STATUS_FIELD_INPUT_FILE_INCOMPLETE:
                    infraredInputStatus = "input file incomplete";
                    break;
                case STATUS_FIELD_UNKNOWN_METER_ID:
                    infraredInputStatus = "pairing error, meter ID doesn't match";
                    break;
                case STATUS_FIELD_NO_FILTERED_DATA:
                    infraredInputStatus = "no filtered data";
                    break;
            }
            inputType = "unknown protocol";
            switch ((info & STATUS_FIELD_INFO_INPUT_TYPE_MASK) >> STATUS_FIELD_INFO_INPUT_TYPE_SHIFT) {
                case STATUS_INFO_INPUT_TYPE_IEC_A:
                    inputType = "IEC Mode A";
                    break;
                case STATUS_INFO_INPUT_TYPE_IEC_B:
                    inputType = "IEC Mode B";
                    break;
                case STATUS_INFO_INPUT_TYPE_IEC_C:
                    inputType = "IEC Mode C";
                    break;
                case STATUS_INFO_INPUT_TYPE_IEC_D:
                    inputType = "IEC Mode D";
                    break;
                case STATUS_INFO_INPUT_TYPE_SML:
                    inputType = "SML";
                    break;
            }
            meterType = "unknown";
            switch (info & STATUS_FIELD_INFO_METER_TYPE_MASK) {
                case STATUS_INFO_METER_TYPE_IMPORT:
                    meterType = "import";
                    break;
                case STATUS_INFO_METER_TYPE_EXPORT:
                    meterType = "export";
                    break;
                case STATUS_INFO_METER_TYPE_IMPORT_EXPORT:
                    meterType = "import + export";
                    break;
            }
            if (length > STATUS_FIELD_PAYLOAD_SIZE) {
                further = payload.slice(pos, pos + length - 2);
                return [length, info, status, inputType, meterType, infraredInputStatus, further];
            }
            else
                return [length, info, status, inputType, meterType, infraredInputStatus];
        }
        return [length];
    }
    return [];
}

/****
go through the payload bytes starting at pos and interpret time
@param: payload - uploaded payload bytes of meter data (without segmentation byte if previously attached)
        pos - position in payload for time on type field
@return: array - [length, time in seconds] or
                 [length] or
                 []
                 depending on the available bytes
****/
function decodeTime(payload, pos) {
    //check, that length in payload starting at pos has at least type and length field for time
    if (payload.length >= pos + TIME_FIELD_HEADER_SIZE) {
        //type field + 1
        pos++;
        //get length and set pos to start of time value field
        var length = payload[pos++];
        //check, that length in payload for time is required one
        if ((length == TIME_FIELD_PAYLOAD_SIZE) && (payload.length >= length + pos)) {
            //get bytes for time value from payload
            var timeBuffer = payload.slice(pos, pos + 4);
            //MSB buffer to value | >>> 0 for UINT32
            var time = (timeBuffer[3] | timeBuffer[2] << 8 | timeBuffer[1] << 16 | timeBuffer[0] << 24) >>> 0;
            //return array with length and time in seconds
            return [length, time];
        }
        //return array with length
        return [length];
    }
    //return empty array
    return [];
}

/****
go through the payload bytes starting at pos and interpret meter id
@param: payload - uploaded payload bytes of meter data (without segmentation byte if previously attached)
        pos - position in payload for meter id on type field
@return: array - [length, meter id as string] or
                 [length] or
                 []
                 depending on the available bytes
****/
function decodeMeterID(payload, pos) {
    //check, that length in payload starting at pos has at least type and length field for time
    if (payload.length >= pos + METER_FIELD_HEADER_SIZE) {
        //type field + 1
        pos++;
        //get length and set pos to start of meter id value field
        var length = payload[pos++];
        //check, that length in payload for meter id is required one
        if (payload.length >= pos + length) {
            //get bytes for meter id from payload
            var meterID = payload.slice(pos, pos + length);
            //interpret buffer ot ascii value
            var meterIDName = buffer_to_ascii(meterID);

            if (meterIDName.length > 0)
                //if an ascii value for meter id is available, interpret meter id bytes to hex string and interpreted ascii value
                meterIDString = buffer_to_hex_string(meterID) + " ( " + buffer_to_ascii(meterID) + " )";
            else
                //if no ascii value for meter id is available, interpret meter id bytes to hex string
                meterIDString = buffer_to_hex_string(meterID);
            //return array with length and meter id as string
            return [length, meterIDString];
        }
        else
            //return array with length
            return [length];
    }
    //return empty array
    return [];
}

/****
interpret bytes buffer to meter object with unit
@param: payload - uploaded payload bytes of meter data (without segmentation byte if previously attached)
        pos - position in payload for meter id on type field
@return: array - [length, obisID as string, groupMask byte, unit byte if available otherwise -1, scaler byte, manntissa int value] or
                 [length] or
                 []
                 depending on the available bytes
****/
function decodeObjectWithIDAndUnitField(payload, pos) {
    return decodeObject(payload, pos, OBJECT_ID_AND_UNIT_FIELD_HEADER_SIZE, OBJECT_ID_AND_UNIT_FIELD_TYPE_INDEX,
        OBJECT_ID_AND_UNIT_FIELD_LENGTH_INDEX, OBJECT_ID_AND_UNIT_FIELD_OBIS_ID_INDEX,
        OBJECT_ID_AND_UNIT_FIELD_GROUP_MASK_INDEX, OBJECT_ID_AND_UNIT_FIELD_UNIT_INDEX_DEPENDENT_OBIS_ID,
        OBJECT_ID_AND_UNIT_FIELD_SCALER_INDEX_DEPENDENT_OBIS_ID, OBJECT_ID_AND_UNIT_FIELD_MANTISSA_INDEX_DEPENDENT_OBIS_ID);
}

/****
interpret bytes buffer to meter object without unit
@param: payload - uploaded payload bytes of meter data (without segmentation byte if previously attached)
        pos - position in payload for meter id on type field
@return: array - [length, obisID as string, groupMask byte, unit byte if available otherwise -1, scaler byte, manntissa int value] or
                 [length] or
                 []
                 depending on the available bytes
****/
function decodeObjectWithIDField(payload, pos) {
    return decodeObject(payload, pos, OBJECT_WITH_ID_FIELD_HEADER_SIZE, OBJECT_WITH_ID_FIELD_TYPE_INDEX,
        OBJECT_WITH_ID_FIELD_LENGTH_INDEX, OBJECT_WITH_ID_FIELD_OBIS_ID_INDEX, OBJECT_WITH_ID_FIELD_GROUP_MASK_INDEX,
        -1, OBJECT_WITH_ID_FIELD_SCALER_INDEX_DEPENDENT_OBIS_ID, OBJECT_WITH_ID_FIELD_MANTISSA_INDEX_DEPENDENT_OBIS_ID);
}

/****
interpret bytes buffer to meter object with string
@param: payload - uploaded payload bytes of meter data (without segmentation byte if previously attached)
        pos - position in payload for meter id on type field
@return: array - [length, obisID as string, groupMask byte, unit byte if available otherwise -1, scaler byte, manntissa int value] or
                 [length] or
                 []
                 depending on the available bytes
****/
function decodeObjectWithString(payload, pos) {
    return decodeObject(payload, pos, OBJECT_WITH_STRING_HEADER_SIZE, OBJECT_WITH_STRING_TYPE_INDEX,
        OBJECT_WITH_STRING_LENGTH_INDEX, OBJECT_WITH_STRING_OBIS_ID_INDEX, OBJECT_WITH_STRING_GROUP_MASK_INDEX,
        -1, -1, -1);
}

/****
go through the payload bytes starting at pos and interpret meter object
@param: payload - uploaded payload bytes of meter data (without segmentation byte if previously attached)
        pos - position in payload for time on type field
        headerSize - minimal length for type and length field
        typeIndex - index in payload after pos for type field
        lengthIndex - index in payload after pos for length field
        obisIDIndex - index in payload after pos for OBIS ID field
        unitIndexDependentObisID - index in payload for unit after OBIS ID or -1 if not contained in payload
        scalerIndexDependentObisID - index in payload for scaler after OBIS ID or -1 if not contained in payload
        mantissaIndexDependentObisID - index in payload for mantissa after OBIS ID or -1 if not contained in payload
@return: array - [length, obisID as string, groupMask byte, unit byte if available otherwise -1, scaler byte, manntissa int value] or
                 [length, obisID as string, groupMask byte, stringValue]
                 [length] or
                 []
                 depending on the available bytes
****/
function decodeObject(payload, pos, headerSize, typeIndex, lengthIndex, obisIDIndex, groupMaskIndex, unitIndexDependentObisID,
    scalerIndexDependentObisID, mantissaIndexDependentObisID) {
    //check, that length in payload starting at pos has at least expected length
    if (payload.length >= pos + headerSize) {
        //get type byte
        var type = payload[pos + typeIndex];
        //get length byte
        var length = payload[pos + lengthIndex];

        //check, that length in payload starting at groupMask byte has at least expected length
        if (payload.length >= pos + lengthIndex + length) {
            //var obisIDLength = 0;
            //get group mask byte
            var groupMask = payload[pos + groupMaskIndex];
            var obisIDResult = resolveObisID(groupMask, payload, obisIDIndex, pos)
            var obisIDLength = obisIDResult.obisIDLength;
            var obisID = obisIDResult.obisID;

            //obis id should not exceed the specified length and should be valid
            if ((length > obisIDLength + 1) && (obisID != null)) {
                //number of bytes between obis id and mantissa
                var subLength = 2; /*groupMask & scaler*/
                //default value for unit, if it is not attached
                var unit = -1;
                //position of unit in payload
                var unitPos = pos + 3  /* type + length + groupMask */ + obisIDLength + unitIndexDependentObisID;
                //if meter data object includes unit
                if ((unitIndexDependentObisID >= 0) && (payload.length > unitPos)) {
                    //get unit integer value of payload
                    unit = payload[unitPos];
                    //increment number of bytes between obis id and mantissa, because unit is attached
                    subLength++;
                }

                //position of unit in payload
                scalerPos = pos + 3 /*type & length & groupMask */ + obisIDLength + scalerIndexDependentObisID;
                //if meter data object includes scalar
                if ((scalerIndexDependentObisID >= 0) && (payload.length > scalerPos)) {
                    //DataType_ObjectWithNumberAndUnit || DataType_ObjectWithNumber
                    //get unit value of payload
                    var scaler = payload[scalerPos];

                    //interpret last bytes in payload as mantissa
                    var mantissa = 0;
                    var mantissaPos = pos + obisIDIndex + obisIDLength + mantissaIndexDependentObisID;
                    if ((payload.length >= pos + groupMaskIndex + length) && ((pos + groupMaskIndex + length) >= mantissaPos)) {
                        var length = length - obisIDLength - subLength;
                        mantissa = getInt64(payload, mantissaPos, length);
                        //return array with length, obisID as string, groupMask byte, unit byte if available otherwise -1, scaler byte andmanntissa int value]
                        return [length, obisID, groupMask, unit, scaler, mantissa];
                    }
                }
                else {
                    //ObjectWithString
                    //get bytes of payload, which represent meter data
                    var stringBuffer = payload.slice(pos + 3 /* type + length + groupMask */ + obisIDLength, pos + 2 /* type + length */ + length);
                    return [length, obisID, groupMask, stringBuffer];
                }
            }
        }
        //return array with length
        return [length];
    }
    //return empty array
    return [];
}

function resolveObisID(groupMask, payload, obisIDIndex, pos) {
    var obisIDLength = 0;
    //the Group Mask indicates which of the six possible OBIS-ID Group values A-F is included in the following OBIS-ID Value Field.
    //The Bit-Mapping is as follows:
    //    Bit 7 = 1 → OBIS-ID Group A attached
    //    Bit 6 = 1 → OBIS-ID Group B attached
    //    Bit 5 = 1 → OBIS-ID Group C attached
    //    Bit 4 = 1 → OBIS-ID Group D attached
    //    Bit 3 = 1 → OBIS-ID Group E attached
    //    Bit 2 = 1 → OBIS-ID Group F attached
    //    Bit 1 : not used
    //    Bit 0 : not used
    //interpret group mask byte for OBIS ID length
    for (maskBit = OBIS_ID_GROUP_A; maskBit >= OBIS_ID_GROUP_F; maskBit >>= 1) {
        if ((groupMask & maskBit) == maskBit)
            obisIDLength++;
    }

    var i = 0;
    //check, that length in payload starting at pos has at least for group mask, obis id  and scaler
    if (payload.length > (pos + 1 /*groupMask*/ + obisIDLength + 1 /*scaler*/)) {
        //variable for OBIS ID as string
        var obisID = "";
        //interpret group mask byte for OBIS ID
        for (maskBit = OBIS_ID_GROUP_A; maskBit >= OBIS_ID_GROUP_F; maskBit >>= 1) {
            //if a OBIS ID Group is not attached, then use 'X' at that position for OBIS ID string
            value = "X";
            //check if a OBIS ID Group is attached
            if ((groupMask & maskBit) == maskBit) {
                //get one byte of obis id
                valueNum = payload[pos + obisIDIndex + (i++)];
                //convert obis id byte to string
                value = valueNum.toString(10);
            }
            //add byte in string representation or 'X' to obi sid string
            obisID += value;
            //add delimiter to obis id string, when it is not the last position of obis id
            if (maskBit > OBIS_ID_GROUP_F)
                obisID += OBIS_ID_DELIMITER;
        }
        return { 'obisIDLength': obisIDLength, 'obisID': obisID };
    }
    return { 'obisIDLength': 0, 'obisID': null };
}

function getInt64(input, index, length) {
    //https://ncona.com/2016/07/bitwise-operations-in-javascript/
    //even though JavaScript numbers are built using 64 bits, they will be converted to 32 bits when doing binary operations
    var value = 0;

    if ((index + length) <= input.length) {
        // most significant bit set ?
        if (input[index] & 0x80) {
            // yes, perform sign extension
            value = -1;
        }

        for (i = 0; i < length; i++) {
            // shift by 8 bits
            value = value * 256;
            value = value + input[index++];
        }
    }
    return value;
}

/***
try to get floating point value from string when notaion is xxx.xx*unit
@param:     interpreted string value from hex ascii
@return:    converted numbers to string, '' if a control characters was found
****/
function extract_value_from_object_string_value(stringValue) {
    var andSign = "&";
    var pos = stringValue.indexOf(andSign);
    if (pos != -1) {
        //'&' show several values and are not edited
        return null;
    }
    else {
        var unitDivider = "*";
        pos = stringValue.indexOf(unitDivider);
        if (pos != -1) {
            var unit = stringValue.slice(pos + 1);

            var valueStringPart = stringValue.slice(0, pos);
            var value = extract_float_value(valueStringPart);
            if (value != null) {
                return [value, unit];
            }
        }
        else {
            var value = extract_float_value(stringValue);
            if (value != null) {
                return [value];
            }
        }
    }
    return null;
}

function extract_float_value(stringValue) {
    //alles außer 0-9, Punkt, + und -

    //check '+' or '-' occurs maximum one time
    var regex = /[\+-]/g;
    if ((stringValue.match(regex) || []).length <= 1) {
        // if '+' or '-' is available, then the string should start with it
        // "-56789.5678" vs "365677-678688"
        if (stringValue.search(regex) <= 0) {
            // everything except 0-9, '.', '+' and '-'
            regex = /[^0-9\.\+-]/g;
            if (stringValue.search(regex) == -1) {
                // check for several points, e.g. in a date
                // "45678.98765" vs "01.01.2000"
                regex = /\./g;
                if ((stringValue.match(regex) || []).length <= 1) {
                    var value = parseFloat(stringValue);
                    return value;
                }
            }
        }
    }
    return null;
}

/****
convert bytes buffer to string
@param:     byte buffer of numbers
@return:    converted numbers to string, '' if a control characters was found
****/
function buffer_to_ascii(hexBuffer) {
    //value for interpreted string
    var str = '';
    for (var n = 0; n < hexBuffer.length; n++) {
        // if there is one control characters then skip ascii string
        if (hexBuffer[n] < 0x21)
            return '';
        //convert a unicode number into a character and add to already converted ones
        str += String.fromCharCode(parseInt(hexBuffer[n], 10));
    }
    //return converted string
    return str;
}

/****
go through the bytes buffer starting and interpret byte to ascii value
@param:     byte buffer of numbers
@return:    convert a numbers into string, '' if a control characters was found
****/
function buffer_to_hex_string(hexBuffer) {
    var str = '';
    for (var n = 0; n < hexBuffer.length; n++) {
        str += ("0" + hexBuffer[n].toString(16)).slice(-2);
        if (n + 1 < hexBuffer.length)
            str += "-";
    }
    return str;
}

/****
convert number to unit string
@param:     unit byte
@return:    string representation for unit number or number as string, if not available
****/
function resolveUnit(unit) {
    //check if number is contained in lookup table
    if (dlmsUnits[unit])
        //return string representation for unit number
        return dlmsUnits[unit];
    //if not contained in lookup table return number as string
    return unit.toString();
}
/*****
decode meter data end
******/

/*****
decode status start
******/

var ERROR_STATUS_PAYLOAD = "ERROR: unable to decode status: hex ";

var SYSTEM_TIME_FIELD_POS = 0;
var SYSTEM_TIME_FIELD_SIZE = 4;
var FIRMWARE_VERSION_MINOR_POS = 4;
var FIRMWARE_VERSION_MAJOR_POS = 5;
var LAST_SYNC_TIME_FIELD_POS = 6;
var LAST_SYNC_TIME_FIELD_SIZE = 4;
var RESET_COUNTER_FIELD_POS = 10;
var RESET_COUNTER_FIELD_SIZE = 4;
var STATUS_BITS_FIELD_POS = 14;
var STATUS_BITS_FIELD_SIZE = 2;
var CORRECT_RECEIVED_METER_FILES_FIELD_POS = 16;
var CORRECT_RECEIVED_METER_FILESFIELD_SIZE = 4;
var INCORRECT_RECEIVED_METER_FILES_FIELD_POS = 20;
var INCORRECT_RECEIVED_METER_FILESFIELD_SIZE = 4;
var UPLOADED_METER_MESSAGES_FIELD_POS = 24;
var UPLOADED_METER_MESSAGES_FIELD_SIZE = 4;
var RESERVED_1_3_POS = 28;
var RESERVED_1_3_SIZE = 1;
var STATUS_SIZE_1_0 = UPLOADED_METER_MESSAGES_FIELD_POS + UPLOADED_METER_MESSAGES_FIELD_SIZE;
var STATUS_SIZE_1_3 = RESERVED_1_3_POS + RESERVED_1_3_SIZE;

//individual bits of the status bytes
var LORAWAN_ACTIVATED_STATE_STATUS_BIT_MASK = 1 << 0;
var NETWORK_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK = 1 << 1;
var SYSTEM_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK = 1 << 2;
var OTAA_PROCEDURE_STATE_STATUS_BIT_MASK = 1 << 3;
var LORAWAN_CONFIGURATION_STATE_STATUS_BIT_MASK = 1 << 4;
// Bit 5: reserved
var CALENDAR_EVENT_LIST_CONFIGURATION_STATE_STATUS_BIT_MASK = 1 << 6;
var OBIS_ID_FILTER_LIST_CONFIGURATION_STATE_STATUS_BIT_MASK = 1 << 7;

//Key Names
var STATUS_PRE_STRING = "Status_";
var STATUS_TIME_NAME = STATUS_PRE_STRING + "Time";
var STATUS_FIRMWARE_VERSION_NAME = STATUS_PRE_STRING + "Firmware_Version";
var STATUS_LAST_SYNC_TIME_NAME = STATUS_PRE_STRING + "Last_Sync_Time";
var STATUS_RESET_COUNTER_NAME = STATUS_PRE_STRING + "Reset_Counter";
var STATUS_LORAWAN_STATUS_NAME = STATUS_PRE_STRING + "LoRaWAN_Activation_State";
var STATUS_NETWORK_TIME_STATUS_NAME = STATUS_PRE_STRING + "Network_Time_State";
var STATUS_SYSTEM_TIME_STATUS_NAME = STATUS_PRE_STRING + "System_Time_State";
var STATUS_OTAA_PROCEDURE_STATUS_NAME = STATUS_PRE_STRING + "OTAA_Procedure_State";
var STATUS_LORAWAN_CONFIGURATION_STATUS_NAME = STATUS_PRE_STRING + "LoRaWAN_Configuration_State";
var STATUS_CALENDAR_EVENT_STATUS_NAME = STATUS_PRE_STRING + "Calendar_Event_List_State";
var STATUS_OBIS_ID_FILTER_LIST_STATUS_NAME = STATUS_PRE_STRING + "OBIS_ID_Filter_List_State";
var STATUS_CORRECT_RECEIVED_METER_FILES_COUNTER_NAME = STATUS_PRE_STRING + "Correct_Received_Meter_Files_Counter";
var STATUS_INCORRECT_RECEIVED_METER_FILES_COUNTER_NAME = STATUS_PRE_STRING + "Incorrect_Received_Meter_Files_Counter";
var STATUS_UPLOADED_METER_DATA_MESSAGES_COUNTER_NAME = STATUS_PRE_STRING + "Uploaded_Meter_Data_Messages_Counter";
var STATUS_RESERVED_1_3_NAME = STATUS_PRE_STRING + "Reserved_V1_3";

/****
go through the payload bytes and interpret individual bytes
@param:     uploaded payload bytes of status (without segmentation byte if preivously attached)
@return:    object of interpreted status information
****/
function decodeStatusPayload(statusData) {
    //create empty object to fill with indicated status fields
    var statusResults = {};
    statusResults[INFO_LOG_NAME] = [];

    //go through the payload bytes, but not beyond the end
    if (statusData.length >= STATUS_SIZE_1_0) {
        //iO881A System Time ( from embedded RTC ) bytes buffer
        var systemTimeBuffer = statusData.slice(SYSTEM_TIME_FIELD_POS, SYSTEM_TIME_FIELD_POS + SYSTEM_TIME_FIELD_SIZE);

        //Firmware Version - minor version
        var firmwareVersionMinor = statusData[FIRMWARE_VERSION_MINOR_POS];
        //Firmware Version - major version
        var firmwareVersionMajor = statusData[FIRMWARE_VERSION_MAJOR_POS];
        //Time of last Synchronization bytes buffer
        var lastSyncTimeBuffer = statusData.slice(LAST_SYNC_TIME_FIELD_POS, LAST_SYNC_TIME_FIELD_POS + LAST_SYNC_TIME_FIELD_SIZE);
        //Reset Counter bytes buffer
        var resetCounterBuffer = statusData.slice(RESET_COUNTER_FIELD_POS, RESET_COUNTER_FIELD_POS + RESET_COUNTER_FIELD_SIZE);
        //Status / Error bytes buffer
        var statusBitsBuffer = statusData.slice(STATUS_BITS_FIELD_POS, STATUS_BITS_FIELD_POS + STATUS_BITS_FIELD_SIZE);
        //correctly received meter files bytes buffer
        var correctReceivedMeterFilesCounterBuffer = statusData.slice(CORRECT_RECEIVED_METER_FILES_FIELD_POS, CORRECT_RECEIVED_METER_FILES_FIELD_POS + CORRECT_RECEIVED_METER_FILESFIELD_SIZE);
        //faulty received meter files with read / CRC errors bytes buffer
        var incorrectReceivedMeterFilesCounterBuffer = statusData.slice(INCORRECT_RECEIVED_METER_FILES_FIELD_POS, INCORRECT_RECEIVED_METER_FILES_FIELD_POS + INCORRECT_RECEIVED_METER_FILESFIELD_SIZE);
        //uploaded meter data messages bytes buffer
        var uploadedMeterDataMessagesCounterBuffer = statusData.slice(UPLOADED_METER_MESSAGES_FIELD_POS, UPLOADED_METER_MESSAGES_FIELD_POS + UPLOADED_METER_MESSAGES_FIELD_SIZE);

        //convert system time buffer to seconds | >>> 0 for UINT32
        var epochSeconds = (systemTimeBuffer[0] | systemTimeBuffer[1] << 8 | systemTimeBuffer[2] << 16 | systemTimeBuffer[3] << 24) >>> 0;

        //create date object of system time milliseconds
        var systemTime = new Date(epochSeconds * 1000);

        //convert last sync time buffer to seconds | >>> 0 for UINT32
        var epochSeconds = (lastSyncTimeBuffer[0] | lastSyncTimeBuffer[1] << 8 | lastSyncTimeBuffer[2] << 16 | lastSyncTimeBuffer[3] << 24) >>> 0;
        //create date object of last sync time milliseconds
        var lastSyncTime = new Date(epochSeconds * 1000);

        //convert reset Counter bytes buffer to number
        var resetCounter = (resetCounterBuffer[0] | resetCounterBuffer[1] << 8 | resetCounterBuffer[2] << 16 | resetCounterBuffer[3] << 24) >>> 0;;
        //convert status / error bytes buffer to number
        var statusBits = statusBitsBuffer[0] | statusBitsBuffer[1] << 8;
        //convert correctly received meter files bytes buffer to number | >>> 0 for UINT32
        var correctReceivedMeterFilesCounter = (correctReceivedMeterFilesCounterBuffer[0] | correctReceivedMeterFilesCounterBuffer[1] << 8 | correctReceivedMeterFilesCounterBuffer[2] << 16 | correctReceivedMeterFilesCounterBuffer[3] << 24) >>> 0;;
        //convert faulty received meter files with read / CRC errors bytes buffer to number | >>> 0 for UINT32
        var incorrectReceivedMeterFilesCounter = (incorrectReceivedMeterFilesCounterBuffer[0] | incorrectReceivedMeterFilesCounterBuffer[1] << 8 | incorrectReceivedMeterFilesCounterBuffer[2] << 16 | incorrectReceivedMeterFilesCounterBuffer[3] << 24) >>> 0;;
        //convert uploaded meter data messages bytes buffer to number | >>> 0 for UINT32
        var uploadedMeterDataMessagesCounter = (uploadedMeterDataMessagesCounterBuffer[0] | uploadedMeterDataMessagesCounterBuffer[1] << 8 | uploadedMeterDataMessagesCounterBuffer[2] << 16 | uploadedMeterDataMessagesCounterBuffer[3] << 24) >>> 0;;

        //add system time to status result object as string
        statusResults[STATUS_TIME_NAME] = systemTime.toString();
        //add firmware version string to status result object, consisting of major and minor version
        statusResults[STATUS_FIRMWARE_VERSION_NAME] = firmwareVersionMajor + "." + firmwareVersionMinor;
        //add last sync time to status result object as string
        statusResults[STATUS_LAST_SYNC_TIME_NAME] = lastSyncTime.toString();
        //add reset counter number to status result object
        statusResults[STATUS_RESET_COUNTER_NAME] = resetCounter;

        //analyze status / error bytes and add accordingly named info to to status result object
        //Bit 0: LoRaWAN® Activation State | 1 = LoRaWAN® Stack is not activated | 0 = Stack is activated
        statusResults = analyzeBitsToResultString(statusResults, statusBits, LORAWAN_ACTIVATED_STATE_STATUS_BIT_MASK, STATUS_LORAWAN_STATUS_NAME, "not activated", "activated");
        //Bit 1: Network Time Synchronization State | 1 = No synchronization via LoRaWAN® | 0 = Synchronized via LoRaWAN®
        statusResults = analyzeBitsToResultString(statusResults, statusBits, NETWORK_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK, STATUS_NETWORK_TIME_STATUS_NAME, "not synchronized", "synchronized");
        //Bit 2: System Time Synchronization State | 1 = RTC not synchronized at all | 0 = RTC synchronized ( via local serial interface or LoRaWAN® )
        statusResults = analyzeBitsToResultString(statusResults, statusBits, SYSTEM_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK, STATUS_SYSTEM_TIME_STATUS_NAME, "not synchronized", "synchronized");
        //Bit 3:  Over The Air Activation Procedure State | OTAA procedure active | 0 = OTAA procedure not active
        statusResults = analyzeBitsToResultString(statusResults, statusBits, OTAA_PROCEDURE_STATE_STATUS_BIT_MASK, STATUS_OTAA_PROCEDURE_STATUS_NAME, "OTAA procedure active", "OTAA procedure not active");
        //Bit 4: LoRaWAN Configuration State | 1 = Configuration is invalid → Activation not possible | 0 = Configuration is valid
        statusResults = analyzeBitsToResultString(statusResults, statusBits, LORAWAN_CONFIGURATION_STATE_STATUS_BIT_MASK, STATUS_LORAWAN_CONFIGURATION_STATUS_NAME, "not available", "available");
        //Bit 6: Calendar Event List Configuration State | 1 = List is empty → in this case a default "Get Network Time" event is scheduled every hour at 05:00min for RTC synchronization | 0 = List contains at least one item
        statusResults = analyzeBitsToResultString(statusResults, statusBits, CALENDAR_EVENT_LIST_CONFIGURATION_STATE_STATUS_BIT_MASK, STATUS_CALENDAR_EVENT_STATUS_NAME, "is empty", "contains at least one item");
        //Bit 7: OBIS ID Filter List Configuration State | 1  = List is empty | 0 = List contains at least one filter item
        statusResults = analyzeBitsToResultString(statusResults, statusBits, OBIS_ID_FILTER_LIST_CONFIGURATION_STATE_STATUS_BIT_MASK, STATUS_OBIS_ID_FILTER_LIST_STATUS_NAME, "is empty", "contains at least one item");

        //add reader counters to status result object as string
        statusResults[STATUS_CORRECT_RECEIVED_METER_FILES_COUNTER_NAME] = correctReceivedMeterFilesCounter;
        statusResults[STATUS_INCORRECT_RECEIVED_METER_FILES_COUNTER_NAME] = incorrectReceivedMeterFilesCounter;
        statusResults[STATUS_UPLOADED_METER_DATA_MESSAGES_COUNTER_NAME] = uploadedMeterDataMessagesCounter;

        if (statusData.length >= STATUS_SIZE_1_3) {
            var reserved = statusData[RESERVED_1_3_POS];
            statusResults[STATUS_RESERVED_1_3_NAME] = reserved;
        }
    }
    else {
        logDecodeError(statusResults, statusData, 0, [], ERROR_STATUS_PAYLOAD);
    }

    return (statusResults);
}

/****
analyze single bit of status / error bytes
@param:     results - object with indicated status fields
            bits - status / errors bytes for analyzing
            propertyName - name, with will be the key on adding to result object
            setString - string, which will be added as value to result object, if specified bit is set
            notSetString - string, which will be added as value to result object, if specified bit is not set
@return:    object of interpreted status information
****/
function analyzeBitsToResultString(results, bits, mask, propertyName, setString, notSetString) {
    if ((bits & mask) == mask)
        //specified bit is set
        results[propertyName] = setString;
    else
        //specified bit is not set
        results[propertyName] = notSetString;
    //return result object with added information
    return results;
}

function modulo(a, b) {
    return a - Math.floor(a / b) * b;
}
function ToUint32(x) {
    return modulo(x, Math.pow(2, 32));

}

/*****
decode status end
******/


/*****
TagoIO decoder start
******/

function adaptToTagoIOObisIDFormat(payload, valueArray, timestamp) {
    valueArray.forEach(
        function (element) {
            obisid = element["OBIS_ID"];
            value = element["value"];
            floatValue = element["floatValue"];
            unit = element["unit"];
            if (obisid && (typeof value !== 'undefined')) {
                var tagoioObject = {};
                tagoioObject["variable"] = obisid;
                if (floatValue)
                    tagoioObject["value"] = floatValue;
                else
                    tagoioObject["value"] = value;
                if (unit)
                    tagoioObject["unit"] = unit;
                tagoioObject["group"] = timestamp;
                payload.push(tagoioObject);
            }
        }
    );
    return payload;
}

function adaptToTagoIOPayloadFormat(payload, retObject, timestamp) {
    for (var key in retObject) {
        // check if the property/key is defined in the object itself, not in parent
        if (retObject.hasOwnProperty(key)) {
            value = retObject[key];
            if (value.constructor === Array) {
                paylad = adaptToTagoIOObisIDFormat(payload, value, timestamp);
            }
            else {
                //don't accept objects (e.g. "general_info": {})
                if (value.constructor !== Object) {

                    var tagoioObject = {};
                    tagoioObject["variable"] = key;
                    tagoioObject["value"] = value;
                    tagoioObject["group"] = timestamp;
                    payload.push(tagoioObject);
                }
            }
            var tagoioObject = {};
            tagoioObject["variable"] = "Timestamp";
            tagoioObject["value"] = timestamp;
            tagoioObject["group"] = timestamp;
            payload.push(tagoioObject);
        }
    }
    return payload;
}


// Add ignorable variables in this array.
const ignore_vars = ['coding_rate', 'counter', 'confirmed', 'is_retry'];
// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));

//check if payload key and port key are available
const payloadObject = payload.find(
    (x) =>
        x.variable === "payload_raw" ||
        x.variable === "payload_hex" ||
        x.variable === "payload" ||
        x.variable === "data"
);
const portObject = payload.find(
    (x) =>
        x.variable === "port" ||
        x.variable === "Port" ||
        x.variable === "fport" ||
        x.variable === "fPort"
);

if ((payloadObject) && (portObject)) {
    //get payload as string
    var payloadValueString = payloadObject.value;
    //get timestamp as number
    var datetime = payloadObject.group;
    //get port as number
    var portValue = portObject.value;

    payload = [
        { variable: 'debug', value: 1 },
        { variable: 'payloadValueString', value: payloadValueString },
        { variable: 'datetime', value: datetime },
        { variable: 'portValue', value: portValue }
    ];

    if (payloadValueString && portValue && datetime) {
        payloadValue = [];

        var result = [];
        //make hex array from payload string
        while (payloadValueString.length >= 2) {
            payloadValue.push(parseInt(payloadValueString.substring(0, 2), 16));
            payloadValueString = payloadValueString.substring(2, payloadValueString.length);
        }
        retObject = startiO880AIMSTDecoder(payloadValue, portValue);
        console.log("decoded elements:");
        console.log(retObject);
        payload = adaptToTagoIOPayloadFormat(payload, retObject, datetime);
    }
}

/*****
TagoIO decoder end
******/