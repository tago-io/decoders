/* This is an example for BoB Assistant payload parser.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "payload", "value": "53647f" }]
**
*/
const LEARNING = 0x6C;
const LEARNING_LEGACY = 0x4C;
const REPORT = 0x72;
const REPORT_LEGACY = 0x52;
const ALARM = 0x61;
const ALARM_LEGACY = 0x41;
const STATE = 0x53;

const SENSOR_START = 0x64;
const SENSOR_STOP = 0x65;
const SENSOR_STOP_WITH_ERASE = 0x6E;
const SENSOR_NO_VIB = 0x68;
const SENSOR_STOP_NO_VIB = 0x69;
const SENSOR_LEARN_NO_VIB = 0x6A;
const MACHINE_STOP = 0x7D;
const MACHINE_SART = 0x7E;
const SAMPLE_LF = 800;
const SAMPLE_HF = 25600;
const SAMPLE_LEGACY = 1000;

function Decoder(bytes, port) {

  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  var decoded = {};
  var lora = {};

  // Get raw payload
  var bytes_len_ = bytes.length;
  var temp_hex_str = ""

  lora.payload  = "";

  // BoB Assistant specific variables declaration
  var header = 0x00;
  var temperature = 0;
  var vibrationlevel = 0;
  var peakfrequency = 0;
  var batterypercentage = 0;
  // Learning frame variables 
  var learningpercentage = 0;
  var learningfromscratch = 0;
  //FFT signal
  var fft_00 = 0;
  var fft_01 = 0;
  var fft_02 = 0;
  var fft_03 = 0;
  var fft_04 = 0;
  var fft_05 = 0;
  var fft_06 = 0;
  var fft_07 = 0;
  var fft_08 = 0;
  var fft_09 = 0;
  var fft_10 = 0;
  var fft_11 = 0;
  var fft_12 = 0;
  var fft_13 = 0;
  var fft_14 = 0;
  var fft_15 = 0;
  var fft_16 = 0;
  var fft_17 = 0;
  var fft_18 = 0;
  var fft_19 = 0;
  var fft_20 = 0;
  var fft_21 = 0;
  var fft_22 = 0;
  var fft_23 = 0;
  var fft_24 = 0;
  var fft_25 = 0;
  var fft_26 = 0;
  var fft_27 = 0;
  var fft_28 = 0;
  var fft_29 = 0;
  var fft_30 = 0;
  var fft_31 = 0;
  // Report frame variables 
  var anomalylevel = 0;
  var vibrationpercentage = 0;
  var goodvibration = 0;
  var nbalarmreport = 0;
  var reportlength = 0;
  var reportid = 0;
  var badvibrationpercentage1020 = 0;
  var badvibrationpercentage2040 = 0;
  var badvibrationpercentage4060 = 0;
  var badvibrationpercentage6080 = 0;
  var badvibrationpercentage80100 = 0;
  /*var anomalylevelto20last24h = 0;
  var anomalylevelto50last24h = 0;
  var anomalylevelto80last24h = 0;
  var anomalylevelto20last30d = 0;
  var anomalylevelto50last30d = 0;
  var anomalylevelto80last30d = 0;
  var anomalylevelto20last6mo = 0;
  var anomalylevelto50last6mo = 0;
  var anomalylevelto80last6mo = 0;*/
  // State frame variables
  var state = 0;

  for( var j = 0; j < bytes_len_; j++ ){
    temp_hex_str   = bytes[j].toString( 16 ).toUpperCase( );
    if( temp_hex_str.length == 1 ){
      temp_hex_str = "0" + temp_hex_str;
    }
    lora.payload += temp_hex_str;
  }

  var date = new Date();
  var lDate = date.toISOString();
  
  var tab=[];

  // BoB assistant frame are sent on port #1
  if (port === 1){
    //header value
    header = bytes[0];

    switch(header){
      case LEARNING :
        decoded.header = "Learning";
        tab.push({label:"header" ,value:decoded.header, date:lDate}) ;
        learningpercentage = bytes[1];
        tab.push({label:"learningpercentage" ,value:learningpercentage, date:lDate}) ;
        vibrationlevel = (bytes[2]*128 + bytes[3] + bytes[4]/100)/10/121.45;
        tab.push({label:"vibrationlevel" ,value:vibrationlevel, date:lDate}) ;
        peakfrequency = bytes[5];
        if (peakfrequency < 128){ //peak LF
          peakfrequency = (peakfrequency+1)*SAMPLE_LF/256;
        } else { //peak HF
          peakfrequency = ((peakfrequency & 0x7F)+1)*SAMPLE_HF/256;
        }
        tab.push({label:"peakfrequency" ,value:peakfrequency, date:lDate}) ;
        temperature = bytes[6]-30;
        tab.push({label:"temperature" ,value:temperature, date:lDate}) ;
        learningfromscratch = bytes[7];
        tab.push({label:"learningfromscratch" ,value:learningfromscratch, date:lDate}) ;
        fft_00 = (bytes[8]*vibrationlevel)/127;
        tab.push({label:"fft_learning_00" ,value:fft_00, date:lDate}) ;
        fft_01 = (bytes[9]*vibrationlevel)/127;
        tab.push({label:"fft_learning_01" ,value:fft_01, date:lDate}) ;
        fft_02 = (bytes[10]*vibrationlevel)/127;
        tab.push({label:"fft_learning_02" ,value:fft_02, date:lDate}) ;
        fft_03 = (bytes[11]*vibrationlevel)/127;
        tab.push({label:"fft_learning_03" ,value:fft_03, date:lDate}) ;
        fft_04 = (bytes[12]*vibrationlevel)/127;
        tab.push({label:"fft_learning_04" ,value:fft_04, date:lDate}) ;
        fft_05 = (bytes[13]*vibrationlevel)/127;
        tab.push({label:"fft_learning_05" ,value:fft_05, date:lDate}) ;
        fft_06 = (bytes[14]*vibrationlevel)/127;
        tab.push({label:"fft_learning_06" ,value:fft_06, date:lDate}) ;
        fft_07 = (bytes[15]*vibrationlevel)/127;
        tab.push({label:"fft_learning_07" ,value:fft_07, date:lDate}) ;
        fft_08 = (bytes[16]*vibrationlevel)/127;
        tab.push({label:"fft_learning_08" ,value:fft_08, date:lDate}) ;
        fft_09 = (bytes[17]*vibrationlevel)/127;
        tab.push({label:"fft_learning_09" ,value:fft_09, date:lDate}) ;
        fft_10 = (bytes[18]*vibrationlevel)/127;
        tab.push({label:"fft_learning_10" ,value:fft_10, date:lDate}) ;
        fft_11 = (bytes[19]*vibrationlevel)/127;
        tab.push({label:"fft_learning_11" ,value:fft_11, date:lDate}) ;
        fft_12 = (bytes[20]*vibrationlevel)/127;
        tab.push({label:"fft_learning_12" ,value:fft_12, date:lDate}) ;
        fft_13 = (bytes[21]*vibrationlevel)/127;
        tab.push({label:"fft_learning_13" ,value:fft_13, date:lDate}) ;
        fft_14 = (bytes[22]*vibrationlevel)/127;
        tab.push({label:"fft_learning_14" ,value:fft_14, date:lDate}) ;
        fft_15 = (bytes[23]*vibrationlevel)/127;
        tab.push({label:"fft_learning_15" ,value:fft_15, date:lDate}) ;
        fft_16 = (bytes[24]*vibrationlevel)/127;
        tab.push({label:"fft_learning_16" ,value:fft_16, date:lDate}) ;
        fft_17 = (bytes[25]*vibrationlevel)/127;
        tab.push({label:"fft_learning_17" ,value:fft_17, date:lDate}) ;
        fft_18 = (bytes[26]*vibrationlevel)/127;
        tab.push({label:"fft_learning_18" ,value:fft_18, date:lDate}) ;
        fft_19 = (bytes[27]*vibrationlevel)/127;
        tab.push({label:"fft_learning_19" ,value:fft_19, date:lDate}) ;
        fft_20 = (bytes[28]*vibrationlevel)/127;
        tab.push({label:"fft_learning_20" ,value:fft_20, date:lDate}) ;
        fft_21 = (bytes[29]*vibrationlevel)/127;
        tab.push({label:"fft_learning_21" ,value:fft_21, date:lDate}) ;
        fft_22 = (bytes[30]*vibrationlevel)/127;
        tab.push({label:"fft_learning_22" ,value:fft_22, date:lDate}) ;
        fft_23 = (bytes[31]*vibrationlevel)/127;
        tab.push({label:"fft_learning_23" ,value:fft_23, date:lDate}) ;
        fft_24 = (bytes[32]*vibrationlevel)/127;
        tab.push({label:"fft_learning_24" ,value:fft_24, date:lDate}) ;
        fft_25 = (bytes[33]*vibrationlevel)/127;
        tab.push({label:"fft_learning_25" ,value:fft_25, date:lDate}) ;
        fft_26 = (bytes[34]*vibrationlevel)/127;
        tab.push({label:"fft_learning_26" ,value:fft_26, date:lDate}) ;
        fft_27 = (bytes[35]*vibrationlevel)/127;
        tab.push({label:"fft_learning_27" ,value:fft_27, date:lDate}) ;
        fft_28 = (bytes[36]*vibrationlevel)/127;
        tab.push({label:"fft_learning_28" ,value:fft_28, date:lDate}) ;
        fft_29 = (bytes[37]*vibrationlevel)/127;
        tab.push({label:"fft_learning_29" ,value:fft_29, date:lDate}) ;
        fft_30 = (bytes[38]*vibrationlevel)/127;
        tab.push({label:"fft_learning_30" ,value:fft_30, date:lDate}) ;
        fft_31 = (bytes[39]*vibrationlevel)/127;
        tab.push({label:"fft_learning_31" ,value:fft_31, date:lDate}) ;
        break;
      case LEARNING_LEGACY :
        decoded.header = "Learning";
        tab.push({label:"header" ,value:decoded.header, date:lDate}) ;
        learningpercentage = bytes[1];
        tab.push({label:"learningpercentage" ,value:learningpercentage, date:lDate}) ;
        vibrationlevel = (bytes[2]*128 + bytes[3] + bytes[4]/100)/10/121.45;
        tab.push({label:"vibrationlevel" ,value:vibrationlevel, date:lDate}) ;
        peakfrequency = bytes[5];
        peakfrequency = (peakfrequency+1)*SAMPLE_LEGACY/256;
        tab.push({label:"peakfrequency" ,value:peakfrequency, date:lDate}) ;
        temperature = bytes[6]-30;
        tab.push({label:"temperature" ,value:temperature, date:lDate}) ;
        learningfromscratch = bytes[7];
        tab.push({label:"learningfromscratch" ,value:learningfromscratch, date:lDate}) ;
        fft_00 = (bytes[8]*vibrationlevel)/127;
        tab.push({label:"fft_learning_00" ,value:fft_00, date:lDate}) ;
        fft_01 = (bytes[9]*vibrationlevel)/127;
        tab.push({label:"fft_learning_01" ,value:fft_01, date:lDate}) ;
        fft_02 = (bytes[10]*vibrationlevel)/127;
        tab.push({label:"fft_learning_02" ,value:fft_02, date:lDate}) ;
        fft_03 = (bytes[11]*vibrationlevel)/127;
        tab.push({label:"fft_learning_03" ,value:fft_03, date:lDate}) ;
        fft_04 = (bytes[12]*vibrationlevel)/127;
        tab.push({label:"fft_learning_04" ,value:fft_04, date:lDate}) ;
        fft_05 = (bytes[13]*vibrationlevel)/127;
        tab.push({label:"fft_learning_05" ,value:fft_05, date:lDate}) ;
        fft_06 = (bytes[14]*vibrationlevel)/127;
        tab.push({label:"fft_learning_06" ,value:fft_06, date:lDate}) ;
        fft_07 = (bytes[15]*vibrationlevel)/127;
        tab.push({label:"fft_learning_07" ,value:fft_07, date:lDate}) ;
        fft_08 = (bytes[16]*vibrationlevel)/127;
        tab.push({label:"fft_learning_08" ,value:fft_08, date:lDate}) ;
        fft_09 = (bytes[17]*vibrationlevel)/127;
        tab.push({label:"fft_learning_09" ,value:fft_09, date:lDate}) ;
        fft_10 = (bytes[18]*vibrationlevel)/127;
        tab.push({label:"fft_learning_10" ,value:fft_10, date:lDate}) ;
        fft_11 = (bytes[19]*vibrationlevel)/127;
        tab.push({label:"fft_learning_11" ,value:fft_11, date:lDate}) ;
        fft_12 = (bytes[20]*vibrationlevel)/127;
        tab.push({label:"fft_learning_12" ,value:fft_12, date:lDate}) ;
        fft_13 = (bytes[21]*vibrationlevel)/127;
        tab.push({label:"fft_learning_13" ,value:fft_13, date:lDate}) ;
        fft_14 = (bytes[22]*vibrationlevel)/127;
        tab.push({label:"fft_learning_14" ,value:fft_14, date:lDate}) ;
        fft_15 = (bytes[23]*vibrationlevel)/127;
        tab.push({label:"fft_learning_15" ,value:fft_15, date:lDate}) ;
        fft_16 = (bytes[24]*vibrationlevel)/127;
        tab.push({label:"fft_learning_16" ,value:fft_16, date:lDate}) ;
        fft_17 = (bytes[25]*vibrationlevel)/127;
        tab.push({label:"fft_learning_17" ,value:fft_17, date:lDate}) ;
        fft_18 = (bytes[26]*vibrationlevel)/127;
        tab.push({label:"fft_learning_18" ,value:fft_18, date:lDate}) ;
        fft_19 = (bytes[27]*vibrationlevel)/127;
        tab.push({label:"fft_learning_19" ,value:fft_19, date:lDate}) ;
        fft_20 = (bytes[28]*vibrationlevel)/127;
        tab.push({label:"fft_learning_20" ,value:fft_20, date:lDate}) ;
        fft_21 = (bytes[29]*vibrationlevel)/127;
        tab.push({label:"fft_learning_21" ,value:fft_21, date:lDate}) ;
        fft_22 = (bytes[30]*vibrationlevel)/127;
        tab.push({label:"fft_learning_22" ,value:fft_22, date:lDate}) ;
        fft_23 = (bytes[31]*vibrationlevel)/127;
        tab.push({label:"fft_learning_23" ,value:fft_23, date:lDate}) ;
        fft_24 = (bytes[32]*vibrationlevel)/127;
        tab.push({label:"fft_learning_24" ,value:fft_24, date:lDate}) ;
        fft_25 = (bytes[33]*vibrationlevel)/127;
        tab.push({label:"fft_learning_25" ,value:fft_25, date:lDate}) ;
        fft_26 = (bytes[34]*vibrationlevel)/127;
        tab.push({label:"fft_learning_26" ,value:fft_26, date:lDate}) ;
        fft_27 = (bytes[35]*vibrationlevel)/127;
        tab.push({label:"fft_learning_27" ,value:fft_27, date:lDate}) ;
        fft_28 = (bytes[36]*vibrationlevel)/127;
        tab.push({label:"fft_learning_28" ,value:fft_28, date:lDate}) ;
        fft_29 = (bytes[37]*vibrationlevel)/127;
        tab.push({label:"fft_learning_29" ,value:fft_29, date:lDate}) ;
        fft_30 = (bytes[38]*vibrationlevel)/127;
        tab.push({label:"fft_learning_30" ,value:fft_30, date:lDate}) ;
        fft_31 = (bytes[39]*vibrationlevel)/127;
        tab.push({label:"fft_learning_31" ,value:fft_31, date:lDate}) ;
        break;
      case REPORT :
        decoded.header = "Report";
        tab.push({label:"header" ,value:decoded.header, date:lDate}) ;
        anomalylevel = bytes[1]*100/127;
        tab.push({label:"anomalylevel" ,value:anomalylevel, date:lDate}) ;
        reportlength = bytes[6];
        if (reportlength > 59){
          reportlength = (reportlength-59)*60
        }
        vibrationpercentage = (bytes[2]*reportlength)/127;
        tab.push({label:"operatingtime" ,value:vibrationpercentage, date:lDate}) ;
        goodvibration = (bytes[3]*vibrationpercentage)/127;
        tab.push({label:"0_10pct_operating_time" ,value:goodvibration, date:lDate}) ;
        nbalarmreport = bytes[4];
        tab.push({label:"nbalarmreport" ,value:nbalarmreport, date:lDate}) ;
        temperature = bytes[5]-30;
        tab.push({label:"temperature" ,value:temperature, date:lDate}) ;
        tab.push({label:"reportlength" ,value:reportlength, date:lDate}) ;
        reportid = bytes[7];
        tab.push({label:"reportid" ,value:reportid, date:lDate}) ;
        vibrationlevel = (bytes[8]*128 + bytes[9] + bytes[10]/100)/10/121.45;
        tab.push({label:"vibrationlevel" ,value:vibrationlevel, date:lDate}) ;
        peakfrequency = bytes[11];
        if (peakfrequency < 128){ //peak LF
          peakfrequency = (peakfrequency+1)*SAMPLE_LF/256;
        } else { //peak HF
          peakfrequency = ((peakfrequency & 0x7F)+1)*SAMPLE_HF/256;
        }
        tab.push({label:"peakfrequency" ,value:peakfrequency, date:lDate}) ;
        badvibrationpercentage1020 = (vibrationpercentage - goodvibration)*bytes[12]/127;
        tab.push({label:"10_20pct_operating_time" ,value:badvibrationpercentage1020, date:lDate}) ;
        badvibrationpercentage2040 = (vibrationpercentage - goodvibration)*bytes[13]/127;
        tab.push({label:"20_40pct_operating_time" ,value:badvibrationpercentage2040, date:lDate}) ;
        badvibrationpercentage4060 = (vibrationpercentage - goodvibration)*bytes[14]/127;
        tab.push({label:"40_60pct_operating_time" ,value:badvibrationpercentage4060, date:lDate}) ;
        badvibrationpercentage6080 = (vibrationpercentage - goodvibration)*bytes[15]/127;
        tab.push({label:"60_80pct_operating_time" ,value:badvibrationpercentage6080, date:lDate}) ;
        badvibrationpercentage80100 = (vibrationpercentage - goodvibration)*bytes[16]/127;
        tab.push({label:"80_100pct_operating_time" ,value:badvibrationpercentage80100, date:lDate}) ;
        batterypercentage = bytes[17]*100/127;
        tab.push({label:"batterypercentage" ,value:batterypercentage, date:lDate}) ;
        tab.push({label:"anomalylevelto20last24h" ,value:bytes[18], date:lDate}) ;
        tab.push({label:"anomalylevelto50last24h" ,value:bytes[19], date:lDate}) ;
        tab.push({label:"anomalylevelto80last24h" ,value:bytes[20], date:lDate}) ;
        tab.push({label:"anomalylevelto20last30d" ,value:bytes[21], date:lDate}) ;
        tab.push({label:"anomalylevelto50last30d" ,value:bytes[22], date:lDate}) ;
        tab.push({label:"anomalylevelto80last30d" ,value:bytes[23], date:lDate}) ;
        tab.push({label:"anomalylevelto20last6mo" ,value:bytes[24], date:lDate}) ;
        tab.push({label:"anomalylevelto50last6mo" ,value:bytes[25], date:lDate}) ;
        tab.push({label:"anomalylevelto80last6mo" ,value:bytes[26], date:lDate}) ;
        break;
      case REPORT_LEGACY :
        decoded.header = "Report";
        tab.push({label:"header" ,value:decoded.header, date:lDate}) ;
        anomalylevel = bytes[1]*100/127;
        tab.push({label:"anomalylevel" ,value:anomalylevel, date:lDate}) ;
        reportlength = bytes[6];
        if (reportlength > 59){
          reportlength = (reportlength-59)*60
        }
        vibrationpercentage = (bytes[2]*reportlength)/127;
        tab.push({label:"operatingtime" ,value:vibrationpercentage, date:lDate}) ;
        goodvibration = (bytes[3]*vibrationpercentage)/127;
        tab.push({label:"0_10pct_operating_time" ,value:goodvibration, date:lDate}) ;
        nbalarmreport = bytes[4];
        tab.push({label:"nbalarmreport" ,value:nbalarmreport, date:lDate}) ;
        temperature = bytes[5]-30;
        tab.push({label:"temperature" ,value:temperature, date:lDate}) ;
        tab.push({label:"reportlength" ,value:reportlength, date:lDate}) ;
        reportid = bytes[7];
        tab.push({label:"reportid" ,value:reportid, date:lDate}) ;
        vibrationlevel = (bytes[8]*128 + bytes[9] + bytes[10]/100)/10/121.45;
        tab.push({label:"vibrationlevel" ,value:vibrationlevel, date:lDate}) ;
        peakfrequency = bytes[11];
        peakfrequency = (peakfrequency+1)*SAMPLE_LEGACY/256;
        tab.push({label:"peakfrequency" ,value:peakfrequency, date:lDate}) ;
        badvibrationpercentage1020 = (vibrationpercentage - goodvibration)*bytes[12]/127;
        tab.push({label:"10_20pct_operating_time" ,value:badvibrationpercentage1020, date:lDate}) ;
        badvibrationpercentage2040 = (vibrationpercentage - goodvibration)*bytes[13]/127;
        tab.push({label:"20_40pct_operating_time" ,value:badvibrationpercentage2040, date:lDate}) ;
        badvibrationpercentage4060 = (vibrationpercentage - goodvibration)*bytes[14]/127;
        tab.push({label:"40_60pct_operating_time" ,value:badvibrationpercentage4060, date:lDate}) ;
        badvibrationpercentage6080 = (vibrationpercentage - goodvibration)*bytes[15]/127;
        tab.push({label:"60_80pct_operating_time" ,value:badvibrationpercentage6080, date:lDate}) ;
        badvibrationpercentage80100 = (vibrationpercentage - goodvibration)*bytes[16]/127;
        tab.push({label:"80_100pct_operating_time" ,value:badvibrationpercentage80100, date:lDate}) ;
        batterypercentage = bytes[17]*100/127;
        tab.push({label:"batterypercentage" ,value:batterypercentage, date:lDate}) ;
        tab.push({label:"anomalylevelto20last24h" ,value:bytes[18], date:lDate}) ;
        tab.push({label:"anomalylevelto50last24h" ,value:bytes[19], date:lDate}) ;
        tab.push({label:"anomalylevelto80last24h" ,value:bytes[20], date:lDate}) ;
        tab.push({label:"anomalylevelto20last30d" ,value:bytes[21], date:lDate}) ;
        tab.push({label:"anomalylevelto50last30d" ,value:bytes[22], date:lDate}) ;
        tab.push({label:"anomalylevelto80last30d" ,value:bytes[23], date:lDate}) ;
        tab.push({label:"anomalylevelto20last6mo" ,value:bytes[24], date:lDate}) ;
        tab.push({label:"anomalylevelto50last6mo" ,value:bytes[25], date:lDate}) ;
        tab.push({label:"anomalylevelto80last6mo" ,value:bytes[26], date:lDate}) ;
        break;
      case ALARM :
        decoded.header = "Alarm";
        tab.push({label:"header" ,value:decoded.header, date:lDate}) ;
        anomalylevel = bytes[1]*100/127;
        tab.push({label:"anomalylevel" ,value:anomalylevel, date:lDate}) ;
        temperature = bytes[2]-30;
        tab.push({label:"temperature" ,value:temperature, date:lDate}) ;
        vibrationlevel = (bytes[4]*128 + bytes[5] + bytes[6]/100)/10/121.45;
        tab.push({label:"vibrationlevel" ,value:vibrationlevel, date:lDate}) ;
        peakfrequency = bytes[7];
        if (peakfrequency < 128){ //peak LF
          peakfrequency = (peakfrequency+1)*SAMPLE_LF/256;
        } else { //peak HF
          peakfrequency = ((peakfrequency & 0x7F)+1)*SAMPLE_HF/256;
        }
        tab.push({label:"peakfrequency" ,value:peakfrequency, date:lDate}) ;  
        fft_00 = (bytes[8]*vibrationlevel)/127;
        tab.push({label:"fft_00" ,value:fft_00, date:lDate}) ;
        fft_01 = (bytes[9]*vibrationlevel)/127;
        tab.push({label:"fft_01" ,value:fft_01, date:lDate}) ;
        fft_02 = (bytes[10]*vibrationlevel)/127;
        tab.push({label:"fft_02" ,value:fft_02, date:lDate}) ;
        fft_03 = (bytes[11]*vibrationlevel)/127;
        tab.push({label:"fft_03" ,value:fft_03, date:lDate}) ;
        fft_04 = (bytes[12]*vibrationlevel)/127;
        tab.push({label:"fft_04" ,value:fft_04, date:lDate}) ;
        fft_05 = (bytes[13]*vibrationlevel)/127;
        tab.push({label:"fft_05" ,value:fft_05, date:lDate}) ;
        fft_06 = (bytes[14]*vibrationlevel)/127;
        tab.push({label:"fft_06" ,value:fft_06, date:lDate}) ;
        fft_07 = (bytes[15]*vibrationlevel)/127;
        tab.push({label:"fft_07" ,value:fft_07, date:lDate}) ;
        fft_08 = (bytes[16]*vibrationlevel)/127;
        tab.push({label:"fft_08" ,value:fft_08, date:lDate}) ;
        fft_09 = (bytes[17]*vibrationlevel)/127;
        tab.push({label:"fft_09" ,value:fft_09, date:lDate}) ;
        fft_10 = (bytes[18]*vibrationlevel)/127;
        tab.push({label:"fft_10" ,value:fft_10, date:lDate}) ;
        fft_11 = (bytes[19]*vibrationlevel)/127;
        tab.push({label:"fft_11" ,value:fft_11, date:lDate}) ;
        fft_12 = (bytes[20]*vibrationlevel)/127;
        tab.push({label:"fft_12" ,value:fft_12, date:lDate}) ;
        fft_13 = (bytes[21]*vibrationlevel)/127;
        tab.push({label:"fft_13" ,value:fft_13, date:lDate}) ;
        fft_14 = (bytes[22]*vibrationlevel)/127;
        tab.push({label:"fft_14" ,value:fft_14, date:lDate}) ;
        fft_15 = (bytes[23]*vibrationlevel)/127;
        tab.push({label:"fft_15" ,value:fft_15, date:lDate}) ;
        fft_16 = (bytes[24]*vibrationlevel)/127;
        tab.push({label:"fft_16" ,value:fft_16, date:lDate}) ;
        fft_17 = (bytes[25]*vibrationlevel)/127;
        tab.push({label:"fft_17" ,value:fft_17, date:lDate}) ;
        fft_18 = (bytes[26]*vibrationlevel)/127;
        tab.push({label:"fft_18" ,value:fft_18, date:lDate}) ;
        fft_19 = (bytes[27]*vibrationlevel)/127;
        tab.push({label:"fft_19" ,value:fft_19, date:lDate}) ;
        fft_20 = (bytes[28]*vibrationlevel)/127;
        tab.push({label:"fft_20" ,value:fft_20, date:lDate}) ;
        fft_21 = (bytes[29]*vibrationlevel)/127;
        tab.push({label:"fft_21" ,value:fft_21, date:lDate}) ;
        fft_22 = (bytes[30]*vibrationlevel)/127;
        tab.push({label:"fft_22" ,value:fft_22, date:lDate}) ;
        fft_23 = (bytes[31]*vibrationlevel)/127;
        tab.push({label:"fft_23" ,value:fft_23, date:lDate}) ;
        fft_24 = (bytes[32]*vibrationlevel)/127;
        tab.push({label:"fft_24" ,value:fft_24, date:lDate}) ;
        fft_25 = (bytes[33]*vibrationlevel)/127;
        tab.push({label:"fft_25" ,value:fft_25, date:lDate}) ;
        fft_26 = (bytes[34]*vibrationlevel)/127;
        tab.push({label:"fft_26" ,value:fft_26, date:lDate}) ;
        fft_27 = (bytes[35]*vibrationlevel)/127;
        tab.push({label:"fft_27" ,value:fft_27, date:lDate}) ;
        fft_28 = (bytes[36]*vibrationlevel)/127;
        tab.push({label:"fft_28" ,value:fft_28, date:lDate}) ;
        fft_29 = (bytes[37]*vibrationlevel)/127;
        tab.push({label:"fft_29" ,value:fft_29, date:lDate}) ;
        fft_30 = (bytes[38]*vibrationlevel)/127;
        tab.push({label:"fft_30" ,value:fft_30, date:lDate}) ;
        fft_31 = (bytes[39]*vibrationlevel)/127;
        tab.push({label:"fft_31" ,value:fft_31, date:lDate}) ;
        break;
      case ALARM_LEGACY :
        decoded.header = "Alarm";
        tab.push({label:"header" ,value:decoded.header, date:lDate}) ;
        anomalylevel = bytes[1]*100/127;
        tab.push({label:"anomalylevel" ,value:anomalylevel, date:lDate}) ;
        temperature = bytes[2]-30;
        tab.push({label:"temperature" ,value:temperature, date:lDate}) ;
        vibrationlevel = (bytes[4]*128 + bytes[5] + bytes[6]/100)/10/121.45;
        tab.push({label:"vibrationlevel" ,value:vibrationlevel, date:lDate}) ;
        peakfrequency = bytes[7];
        peakfrequency = (peakfrequency+1)*SAMPLE_LEGACY/256;
        tab.push({label:"peakfrequency" ,value:peakfrequency, date:lDate}) ;  
        fft_00 = (bytes[8]*vibrationlevel)/127;
        tab.push({label:"fft_00" ,value:fft_00, date:lDate}) ;
        fft_01 = (bytes[9]*vibrationlevel)/127;
        tab.push({label:"fft_01" ,value:fft_01, date:lDate}) ;
        fft_02 = (bytes[10]*vibrationlevel)/127;
        tab.push({label:"fft_02" ,value:fft_02, date:lDate}) ;
        fft_03 = (bytes[11]*vibrationlevel)/127;
        tab.push({label:"fft_03" ,value:fft_03, date:lDate}) ;
        fft_04 = (bytes[12]*vibrationlevel)/127;
        tab.push({label:"fft_04" ,value:fft_04, date:lDate}) ;
        fft_05 = (bytes[13]*vibrationlevel)/127;
        tab.push({label:"fft_05" ,value:fft_05, date:lDate}) ;
        fft_06 = (bytes[14]*vibrationlevel)/127;
        tab.push({label:"fft_06" ,value:fft_06, date:lDate}) ;
        fft_07 = (bytes[15]*vibrationlevel)/127;
        tab.push({label:"fft_07" ,value:fft_07, date:lDate}) ;
        fft_08 = (bytes[16]*vibrationlevel)/127;
        tab.push({label:"fft_08" ,value:fft_08, date:lDate}) ;
        fft_09 = (bytes[17]*vibrationlevel)/127;
        tab.push({label:"fft_09" ,value:fft_09, date:lDate}) ;
        fft_10 = (bytes[18]*vibrationlevel)/127;
        tab.push({label:"fft_10" ,value:fft_10, date:lDate}) ;
        fft_11 = (bytes[19]*vibrationlevel)/127;
        tab.push({label:"fft_11" ,value:fft_11, date:lDate}) ;
        fft_12 = (bytes[20]*vibrationlevel)/127;
        tab.push({label:"fft_12" ,value:fft_12, date:lDate}) ;
        fft_13 = (bytes[21]*vibrationlevel)/127;
        tab.push({label:"fft_13" ,value:fft_13, date:lDate}) ;
        fft_14 = (bytes[22]*vibrationlevel)/127;
        tab.push({label:"fft_14" ,value:fft_14, date:lDate}) ;
        fft_15 = (bytes[23]*vibrationlevel)/127;
        tab.push({label:"fft_15" ,value:fft_15, date:lDate}) ;
        fft_16 = (bytes[24]*vibrationlevel)/127;
        tab.push({label:"fft_16" ,value:fft_16, date:lDate}) ;
        fft_17 = (bytes[25]*vibrationlevel)/127;
        tab.push({label:"fft_17" ,value:fft_17, date:lDate}) ;
        fft_18 = (bytes[26]*vibrationlevel)/127;
        tab.push({label:"fft_18" ,value:fft_18, date:lDate}) ;
        fft_19 = (bytes[27]*vibrationlevel)/127;
        tab.push({label:"fft_19" ,value:fft_19, date:lDate}) ;
        fft_20 = (bytes[28]*vibrationlevel)/127;
        tab.push({label:"fft_20" ,value:fft_20, date:lDate}) ;
        fft_21 = (bytes[29]*vibrationlevel)/127;
        tab.push({label:"fft_21" ,value:fft_21, date:lDate}) ;
        fft_22 = (bytes[30]*vibrationlevel)/127;
        tab.push({label:"fft_22" ,value:fft_22, date:lDate}) ;
        fft_23 = (bytes[31]*vibrationlevel)/127;
        tab.push({label:"fft_23" ,value:fft_23, date:lDate}) ;
        fft_24 = (bytes[32]*vibrationlevel)/127;
        tab.push({label:"fft_24" ,value:fft_24, date:lDate}) ;
        fft_25 = (bytes[33]*vibrationlevel)/127;
        tab.push({label:"fft_25" ,value:fft_25, date:lDate}) ;
        fft_26 = (bytes[34]*vibrationlevel)/127;
        tab.push({label:"fft_26" ,value:fft_26, date:lDate}) ;
        fft_27 = (bytes[35]*vibrationlevel)/127;
        tab.push({label:"fft_27" ,value:fft_27, date:lDate}) ;
        fft_28 = (bytes[36]*vibrationlevel)/127;
        tab.push({label:"fft_28" ,value:fft_28, date:lDate}) ;
        fft_29 = (bytes[37]*vibrationlevel)/127;
        tab.push({label:"fft_29" ,value:fft_29, date:lDate}) ;
        fft_30 = (bytes[38]*vibrationlevel)/127;
        tab.push({label:"fft_30" ,value:fft_30, date:lDate}) ;
        fft_31 = (bytes[39]*vibrationlevel)/127;
        tab.push({label:"fft_31" ,value:fft_31, date:lDate}) ;
        break;
      case STATE :
        decoded.header = "State";
        tab.push({label:"header" ,value:decoded.header, date:lDate}) ;
        state = bytes[1];
        switch(state){
          case SENSOR_START :
            tab.push({label:"State" ,value:"Sensor Start", date:lDate}) ;
            batterypercentage = bytes[2]*100/127;
            tab.push({label:"batterypercentage" ,value:batterypercentage, date:lDate}) ;         
            break;
          case SENSOR_STOP :
            tab.push({label:"State" ,value:"Sensor Stop", date:lDate}) ;
            batterypercentage = bytes[2]*100/127;
            tab.push({label:"batterypercentage" ,value:batterypercentage, date:lDate}) ;         
            break;
          case SENSOR_STOP_NO_VIB :
            tab.push({label:"State" ,value:"Sensor Stop No Vibration", date:lDate}) ;
            batterypercentage = bytes[2]*100/127;
            tab.push({label:"batterypercentage" ,value:batterypercentage, date:lDate}) ;         
            break;
          case SENSOR_NO_VIB :
            tab.push({label:"State" ,value:"No Vibration, learning postponed", date:lDate}) ;
            batterypercentage = bytes[2]*100/127;
            tab.push({label:"batterypercentage" ,value:batterypercentage, date:lDate}) ;         
            break;
          case SENSOR_LEARN_NO_VIB :
            tab.push({label:"State" ,value:"Learning in progress, but no vibration", date:lDate}) ;
            batterypercentage = bytes[2]*100/127;
            tab.push({label:"batterypercentage" ,value:batterypercentage, date:lDate}) ;         
            break;
          case SENSOR_STOP_WITH_ERASE :
            tab.push({label:"State" ,value:"Sensor Stop with flash erase", date:lDate}) ;
            batterypercentage = bytes[2]*100/127;
            tab.push({label:"batterypercentage" ,value:batterypercentage, date:lDate}) ;         
            break;
          case MACHINE_SART :
            tab.push({label:"State" ,value:"Machine Start", date:lDate}) ;
            batterypercentage = bytes[2]*100/127;
            tab.push({label:"batterypercentage" ,value:batterypercentage, date:lDate}) ;         
            break;
          case MACHINE_STOP :
            tab.push({label:"State" ,value:"Machine Stop", date:lDate}) ;
            batterypercentage = bytes[2]*100/127;
            tab.push({label:"batterypercentage" ,value:batterypercentage, date:lDate}) ;         
            break;
          default :
            break;
        }
        break;
      default :
        break;
    }
  decoded.data = tab;
  }
  return decoded;
}

// I'm adding this extra code to run the decoder.
const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");
if (payload_raw) {
  // Convert the data from Hex to Buffer (same as bytes from TTN).
  const buffer = Buffer.from(payload_raw.value, "hex");

  // Get the port variable.
  const port = payload.find((x) => x.variable === "port" || x.variable === "fport");

  // Run the TTN decoder.
  const decoded_payload = Decoder(buffer, port ? port.value : null);

  // Copy or generate a serie for this batch of data.
  const serie = payload[0].serie || String(new Date().getTime());

  // Normalize the decoded_payload.data
  if (decoded_payload && decoded_payload.data) {
    // transform/normalize the structure to TagoIO structure.
    const normalized_payload = decoded_payload.data.map((data) => {
      return { serie, variable: data.label.toLowerCase(), value: data.value, time: data.date };
    });
    // concat both array.
    // payload = payload.concat(normalized_payload);
    
    // console.log(normalized_payload);
    payload = normalized_payload;

  }
}

// Add ignorable variables in this array.
const ignore_vars = ['rf_chain', 'channel', 'modulation', 'app_id', 'dev_id', 'time', 'gtw_trusted', 'port'];

// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));