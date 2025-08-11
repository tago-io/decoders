/**
 * CBOR Decoder for TagoIO
 * Parses CBOR-encoded payload and extracts device telemetry data
 */

/**
 * Simple CBOR decoder implementation
 * Handles basic CBOR data types needed for this payload
 */
function decodeCBOR(buffer: Buffer) {
    let offset = 0;
  
    function readByte() {
      if (offset >= buffer.length) throw new Error('Unexpected end of buffer');
      return buffer[offset++];
    }
  
    function readBytes(length: number) {
      if (offset + length > buffer.length) throw new Error('Unexpected end of buffer');
      const result = buffer.slice(offset, offset + length);
      offset += length;
      return result;
    }
  
    function readUint(length: number) {
      let result = 0;
      for (let i = 0; i < length; i++) {
        result = (result << 8) | readByte();
      }
      return result;
    }

    function readFloat32() {
      const bytes = readBytes(4);
      return bytes.readFloatBE(0);
    }

    function readFloat64() {
      const bytes = readBytes(8);
      return bytes.readDoubleBE(0);
    }
  
    function decodeItem(): any {
      if (offset >= buffer.length) return null;
  
      const initialByte = readByte();
      const majorType = (initialByte >> 5) & 0x07;
      const additionalInfo = initialByte & 0x1f;
  
      switch (majorType) {
        case 0: // Unsigned integer
          if (additionalInfo < 24) return additionalInfo;
          if (additionalInfo === 24) return readByte();
          if (additionalInfo === 25) return readUint(2);
          if (additionalInfo === 26) return readUint(4);
          if (additionalInfo === 27) return readUint(8);
          break;
  
        case 1: // Negative integer
          if (additionalInfo < 24) return -1 - additionalInfo;
          if (additionalInfo === 24) return -1 - readByte();
          if (additionalInfo === 25) return -1 - readUint(2);
          if (additionalInfo === 26) return -1 - readUint(4);
          if (additionalInfo === 27) return -1 - readUint(8);
          break;
  
        case 2: // Byte string
          let byteLength;
          if (additionalInfo < 24) byteLength = additionalInfo;
          else if (additionalInfo === 24) byteLength = readByte();
          else if (additionalInfo === 25) byteLength = readUint(2);
          else if (additionalInfo === 26) byteLength = readUint(4);
          else if (additionalInfo === 31) {
            // Indefinite length byte string
            const chunks: Buffer[] = [];
            while (true) {
              if (offset < buffer.length && buffer[offset] === 0xff) {
                offset++; // Skip break byte
                break;
              }
              const chunk = decodeItem();
              if (chunk instanceof Buffer) chunks.push(chunk);
            }
            return Buffer.concat(chunks);
          }
          return readBytes(byteLength);
  
        case 3: // Text string
          let textLength;
          if (additionalInfo < 24) textLength = additionalInfo;
          else if (additionalInfo === 24) textLength = readByte();
          else if (additionalInfo === 25) textLength = readUint(2);
          else if (additionalInfo === 26) textLength = readUint(4);
          else if (additionalInfo === 31) {
            // Indefinite length text string
            const chunks: string[] = [];
            while (true) {
              if (offset < buffer.length && buffer[offset] === 0xff) {
                offset++; // Skip break byte
                break;
              }
              const chunk = decodeItem();
              if (typeof chunk === 'string') chunks.push(chunk);
            }
            return chunks.join('');
          }
          return readBytes(textLength).toString('utf8');
  
        case 4: // Array
          let arrayLength;
          if (additionalInfo < 24) arrayLength = additionalInfo;
          else if (additionalInfo === 24) arrayLength = readByte();
          else if (additionalInfo === 25) arrayLength = readUint(2);
          else if (additionalInfo === 26) arrayLength = readUint(4);
          else if (additionalInfo === 31) {
            // Indefinite length array
            const result: any[] = [];
            while (true) {
              if (offset >= buffer.length) break;
              if (buffer[offset] === 0xff) {
                offset++; // Skip break byte
                break;
              }
              const item = decodeItem();
              if (item !== null) result.push(item);
            }
            return result;
          }
          const array: any[] = [];
          for (let i = 0; i < arrayLength; i++) {
            const item = decodeItem();
            array.push(item);
          }
          return array;
  
        case 5: // Map
          let mapLength;
          if (additionalInfo < 24) mapLength = additionalInfo;
          else if (additionalInfo === 24) mapLength = readByte();
          else if (additionalInfo === 25) mapLength = readUint(2);
          else if (additionalInfo === 26) mapLength = readUint(4);
          else if (additionalInfo === 31) {
            // Indefinite length map
            const result: any = {};
            while (true) {
              if (offset >= buffer.length) break;
              if (buffer[offset] === 0xff) {
                offset++; // Skip break byte
                break;
              }
              const key = decodeItem();
              if (key === null) break;
              const value = decodeItem();
              result[key] = value;
            }
            return result;
          }
          const map: any = {};
          for (let i = 0; i < mapLength; i++) {
            const key = decodeItem();
            const value = decodeItem();
            if (key !== null) map[key] = value;
          }
          return map;
  
        case 6: // Semantic tag
          const tagNumber = additionalInfo < 24 ? additionalInfo :
            additionalInfo === 24 ? readByte() :
              additionalInfo === 25 ? readUint(2) : 
              additionalInfo === 26 ? readUint(4) : readUint(8);
          const taggedValue = decodeItem();
  
          // Handle Unix timestamp (tag 1)
          if (tagNumber === 1) {
            return new Date(taggedValue * 1000);
          }
          return taggedValue;
  
        case 7: // Float, simple, break
          if (additionalInfo === 31) return null; // Break
          if (additionalInfo < 20) return additionalInfo;
          if (additionalInfo === 20) return false;
          if (additionalInfo === 21) return true;
          if (additionalInfo === 22) return null;
          if (additionalInfo === 23) return undefined;
          if (additionalInfo === 25) return readFloat32();
          if (additionalInfo === 26) return readFloat32();
          if (additionalInfo === 27) return readFloat64();
          break;
      }
  
      throw new Error(`Unsupported CBOR type: major=${majorType}, additional=${additionalInfo}`);
    }
  
    return decodeItem();
  }
  
/**
 * Converts Unix timestamp to ISO string
 * @param {number|Date} timestamp - Unix timestamp or Date object
 * @returns {string} ISO formatted date string
 */
function formatTimestamp(timestamp: number | Date) {
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  if (typeof timestamp === 'number') {
    return new Date(timestamp * 1000).toISOString();
  }
  return new Date().toISOString();
}

/**
 * Extracts device ID from MQTT topic
 * @param {string} topic - MQTT topic string
 * @returns {string|null} Device ID or null if not found
 */
function extractDeviceId(topic: string) {
  if (!topic) return null;
  const match = topic.match(/\/cgw\/(\d+)\//);
  return match ? match[1] : null;
}

/**
 * Parses CBOR payload and converts to TagoIO data format
 * @param {string} hexPayload - Hexadecimal CBOR payload
 * @param {string} group - Group identifier
 * @param {string} receivedTime - Time payload was received
 * @param {Object} metadata - Additional metadata including MQTT topic
 * @returns {Array} Array of TagoIO data objects
 */
function parseCBORPayload(hexPayload: string, group: string, receivedTime: string, metadata: any = {}) {
  try {
    // Convert hex string to buffer
    const buffer = Buffer.from(hexPayload, 'hex');

    // Decode CBOR data
    const decodedData = decodeCBOR(buffer);

    if (!decodedData || typeof decodedData !== 'object') {
      return [{
        variable: 'parser_error',
        value: 'Failed to decode CBOR payload',
        time: receivedTime || new Date().toISOString()
      }];
    }

    const data: any[] = [];
    const time = receivedTime || new Date().toISOString();
    const deviceId = extractDeviceId(metadata.mqtt_topic);

    // Prepare additional metadata for battery variables
    const additionalMetadata: any = {
      mqtt_topic: metadata.mqtt_topic
    };

    // Add header info to metadata if available
    if (decodedData.hdr && Array.isArray(decodedData.hdr)) {
      additionalMetadata.header_info = decodedData.hdr.join(',');
      additionalMetadata.raw_header = decodedData.hdr;
    }

    // Add decoded CBOR structure to metadata
    additionalMetadata.cbor_decoded = JSON.stringify(decodedData, null, 2);

    // Process payload data (pld)
    if (decodedData.pld) {
      const payload = decodedData.pld;

      // Process reason code
      if (payload.reas && payload.reas.code !== undefined) {
        data.push({
          variable: 'reason_code',
          value: payload.reas.code,
          group,
          time: payload.reas.time ? formatTimestamp(payload.reas.time) : time
        });
      }

      // Process location data from GNSS
      if (payload.data && payload.data.gnss && Array.isArray(payload.data.gnss)) {
        for (const gnssEntry of payload.data.gnss) {
          if (gnssEntry.records && Array.isArray(gnssEntry.records)) {
            for (const record of gnssEntry.records) {
              if (record.d && Array.isArray(record.d) && record.d.length >= 2) {
                const [latitude, longitude, altitude] = record.d;
                const locationTime = record.t ? formatTimestamp(record.t) : time;
                
                data.push({
                  variable: 'location',
                  value: `${latitude},${longitude}`,
                  location: {
                    lat: latitude,
                    lng: longitude
                  },
                  group,
                  time: locationTime
                });

                // Add altitude as separate variable if available
                if (altitude !== undefined) {
                  data.push({
                    variable: 'altitude',
                    value: altitude,
                    unit: 'm',
                    group,
                    time: locationTime
                  });
                }
              }
            }
          }
        }
      }

      // Process motion data
      if (payload.data && payload.data.motion && Array.isArray(payload.data.motion)) {
        for (const motionEntry of payload.data.motion) {
          if (motionEntry.records && Array.isArray(motionEntry.records)) {
            for (const record of motionEntry.records) {
              if (record.d !== undefined) {
                data.push({
                  variable: 'motion',
                  value: record.d,
                  group,
                  time: record.t ? formatTimestamp(record.t) : time
                });
              }
            }
          }
        }
      }

      // Process abnormal temperature data
      if (payload.data && payload.data.abn_temp && Array.isArray(payload.data.abn_temp)) {
        for (const tempEntry of payload.data.abn_temp) {
          if (tempEntry.records && Array.isArray(tempEntry.records)) {
            for (const record of tempEntry.records) {
              if (record.d !== undefined) {
                data.push({
                  variable: 'abnormal_temperature',
                  value: record.d,
                  unit: '°C',
                  group,
                  time: record.t ? formatTimestamp(record.t) : time
                });

                // Add temperature reference values if available
                if (record.ref) {
                  if (record.ref.max !== undefined) {
                    data.push({
                      variable: 'temperature_max_ref',
                      value: record.ref.max,
                      unit: '°C',
                      group,
                      time: record.t ? formatTimestamp(record.t) : time
                    });
                  }
                  if (record.ref.min !== undefined) {
                    data.push({
                      variable: 'temperature_min_ref',
                      value: record.ref.min,
                      unit: '°C',
                      group,
                      time: record.t ? formatTimestamp(record.t) : time
                    });
                  }
                }
              }
            }
          }
        }
      }

      // Process abnormal illumination data
      if (payload.data && payload.data.abn_illum && Array.isArray(payload.data.abn_illum)) {
        for (const illumEntry of payload.data.abn_illum) {
          if (illumEntry.records && Array.isArray(illumEntry.records)) {
            for (const record of illumEntry.records) {
              if (record.d !== undefined) {
                data.push({
                  variable: 'abnormal_illumination',
                  value: record.d,
                  unit: 'lux',
                  group,
                  time: record.t ? formatTimestamp(record.t) : time
                });

                // Add illumination reference values if available
                if (record.ref && record.ref.max !== undefined) {
                  data.push({
                    variable: 'illumination_max_ref',
                    value: record.ref.max,
                    unit: 'lux',
                    group,
                    time: record.t ? formatTimestamp(record.t) : time
                  });
                }
              }
            }
          }
        }
      }

      // Process status information
      if (payload.stat) {
        const status = payload.stat;

        // Battery information - with enhanced metadata
        if (status.batt) {
          if (status.batt.pct !== undefined) {
            data.push({
              variable: 'battery_percentage',
              value: status.batt.pct,
              unit: '%',
              group,
              time,
              metadata: additionalMetadata
            });
          }
          if (status.batt.vol !== undefined) {
            data.push({
              variable: 'battery_voltage',
              value: status.batt.vol,
              unit: 'mV',
              group,
              time,
              metadata: additionalMetadata
            });
          }
        }

        // Cellular information
        if (status.cell && status.cell.rsrp !== undefined) {
          data.push({
            variable: 'cellular_rsrp',
            value: status.cell.rsrp,
            unit: 'dBm',
            group,
            time
          });
        }

        // Temperature and environmental data
        if (status.tear) {
          if (status.tear.code !== undefined) {
            data.push({
              variable: 'tear_code',
              value: status.tear.code === 1 ? "teared" : "Secure",
              group,
              time: status.tear.time ? formatTimestamp(status.tear.time) : time
            });
          }
        }
      }
    }

    // Process device information (dev)
    if (decodedData.pld && decodedData.pld.dev) {
      const device = decodedData.pld.dev;

      if (device.pid !== undefined) {
        data.push({
          variable: 'device_pid',
          value: device.pid,
          group,
          time
        });
      }

      if (device.imei) {
        data.push({
          variable: 'device_imei',
          value: device.imei,
          group,
          time
        });
      }
    }

    // Add device ID from MQTT topic if available
    if (deviceId) {
      data.push({
        variable: 'mqtt_device_id',
        value: deviceId,
        group,
        time
      });
    }

    return data;

  } catch (error) {
    console.error('CBOR parsing error:', error.message);
    return [{
      variable: 'parser_error',
      value: `CBOR parsing failed: ${error.message}`,
      time: receivedTime || new Date().toISOString(),
      metadata: { error_details: error.stack }
    }];
  }
}

// Main decoder logic
const payloadData = payload.find(x => ['payload', 'data'].includes(x.variable));

if (payloadData && payloadData.value) {
  const parsedData = parseCBORPayload(
    payloadData.value,
    payloadData.group,
    payloadData.time,
    payloadData.metadata || {}
  );

  // Replace the original payload with parsed data
  payload = parsedData;
}