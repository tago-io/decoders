import { describe, it, expect } from 'vitest';
import { zConnector, TypeConnector } from './connector'; // Adjust the path as needed

describe('zConnector schema', () => {
  it('should validate a correct connector object', () => {
    const validData = {
      id: '123456789012345678901234',
      name: 'Test Connector',
      version: '1.0.0',
      networks: ['network1', 'network2'],
      description: 'A test connector description',
      install_text: 'Installation instructions',
      install_end_text: 'End of installation instructions',
      device_annotation: 'Device annotation text',
      device_parameters: [{}],
      logo: "https://file.tago.io/123456789012345678901234/logo.png",
      payload_decoder: Buffer.from('decoder data'),
    };

    const result = zConnector.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('should fail validation for a connector object with invalid data', () => {
    const invalidData = {
      id: '123', // too short
      name: 'Test Connector',
      version: '1.0.0',
      networks: [], // empty array
      description: 'A very long description that exceeds the maximum allowed length of five hundred characters' +
                   'A very long description that exceeds the maximum allowed length of five hundred characters' +
                   'A very long description that exceeds the maximum allowed length of five hundred characters' +
                   'A very long description that exceeds the maximum allowed length of five hundred characters',
      install_text: 'Installation instructions',
      install_end_text: 'End of installation instructions',
      device_annotation: 'Device annotation text',
      device_parameters: { /* add invalid data according to zIntegrationParameters */ },
      logo: 123, // not a buffer or string
      payload_decoder: 'too long data that exceeds the 64-byte limit', // too long
    };

    const result = zConnector.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('networks');
      expect(result.error.issues[0].message).toBe('Array must contain at least 1 element(s)');

      expect(result.error.issues[1].path[0]).toBe('device_parameters');
      expect(result.error.issues[1].message).toBe('Expected array, received object');

      expect(result.error.issues[2].path[0]).toBe('logo');
      expect(result.error.issues[2].message).toBe('Expected string, received number');

      expect(result.error.issues[3].path[0]).toBe('payload_decoder');
      expect(result.error.issues[3].message).toBe('Invalid Payload Parser');
    }
  });

  it('should transform networks to JSON string', () => {
    const data = {
      id: '123456789012345678901234',
      name: 'Test Connector',
      version: '1.0.0',
      networks: ['network1', 'network2'],
    };

    const result = zConnector.parse(data);
    expect(result.networks).toBe(JSON.stringify(['network1', 'network2']));
  });
});
