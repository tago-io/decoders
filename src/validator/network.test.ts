import { describe, it, expect } from 'vitest';
import { zNetwork, TypeNetwork } from './network'; // Adjust the path as needed

describe('zNetwork schema', () => {
  it('should validate a correct network object', () => {
    const validData = {
      id: '123456789012345678901234',
      name: 'Test Network',
      version: '1.0.0',
      description: 'A test network description',
      documentation_url: 'http://example.com',
      middleware_endpoint: 'middleware.example.com',
      serial_number: {
        case: 'upper',
        image: "https://file.tago.io/123456789012345678901234/image.png",
        label: 'Test Label',
        mask: 'Test Mask',
        required: true,
      },
      device_parameters: null,
      icon: "https://file.tago.io/123456789012345678901234/icon.png",
      logo: "https://file.tago.io/123456789012345678901234/logo.png",
      banner: "https://file.tago.io/123456789012345678901234/banner.png",
      payload_decoder: Buffer.from('decoder data'),
    };

    const result = zNetwork.safeParse(validData);
    console.log(result.error);
    expect(result.success).toBe(true);
  });

  it('should fail validation for a network object with invalid data', () => {
    const invalidData = {
      id: '123', // too short
      name: 'Test Network',
      version: '1.0.0',
      description: 'A test network description',
      documentation_url: 'invalid-url', // not a valid URL
      middleware_endpoint: 'invalid-url', // not a valid URL
      serial_number: {
        case: 'invalid-case', // not a valid enum value
        image: 'not a buffer or string',
        label: 'A very long label that exceeds the maximum allowed length of one hundred characters' +
               'A very long label that exceeds the maximum allowed length of one hundred characters',
        mask: 'A very long mask that exceeds the maximum allowed length of one hundred characters' +
              'A very long mask that exceeds the maximum allowed length of one hundred characters',
        required: 'not a boolean', // should be boolean
      },
      device_parameters: { /* add invalid data according to zIntegrationParameters */ },
      icon: 123, // not a buffer or string
      logo: 123, // not a buffer or string
      banner: 123, // not a buffer or string
      payload_decoder: 'too long data that exceeds the 64-byte limit', // too long
    };

    const result = zNetwork.safeParse(invalidData);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path[0]).toBe('middleware_endpoint');
    expect(result.error?.issues[0].message).toBe('Invalid domain');
    expect(result.error?.issues[1].path[0]).toBe('serial_number');
    expect(result.error?.issues[1].message).toBe("Invalid enum value. Expected 'lower' | 'upper' | '', received 'invalid-case'");
    expect(result.error?.issues[2].path[0]).toBe('serial_number');
    expect(result.error?.issues[2].message).toBe('String must contain at most 100 character(s)');

  });

  it('should transform serial_number to JSON string', () => {
    const data = {
      id: '123456789012345678901234',
      name: 'Test Network',
      version: '1.0.0',
      serial_number: {
        case: 'lower',
        label: 'Test Label',
        required: true,
      },
    };

    const result = zNetwork.parse(data);
    expect(result.serial_number).toBe(JSON.stringify({
      case: 'lower',
      label: 'Test Label',
      required: true,
    }));
  });
});
