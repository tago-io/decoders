import { describe, it, expect } from 'vitest';
import { generateID, extractNameAndVersionFromPath } from './generate-id';

describe('generateID', () => {
  it('should generate a custom ID based on name and version', () => {
    const name = 'draginolns';
    const version = 'v1.0.0';
    const customID = generateID({ name, version });
    expect(customID).toBe('8b4ae16b01b2b6f7efbb76ed');
  });

  it('should generate different IDs for different names and same version', () => {
    const name1 = 'network1';
    const name2 = 'network2';
    const version = 'v1.0.0';
    const customID1 = generateID({ name: name1, version });
    const customID2 = generateID({ name: name2, version });
    expect(customID1).not.toBe(customID2);
  });

  it('should generate different IDs for same name and different versions', () => {
    const name = 'network';
    const version1 = 'v1.0.0';
    const version2 = 'v2.0.0';
    const customID1 = generateID({ name, version: version1 });
    const customID2 = generateID({ name, version: version2 });
    expect(customID1).not.toBe(customID2);
  });
});

describe('extractNameAndVersionFromPath', () => {
  it('should extract name and version from the path', () => {
    const path = "../../../../network/lorawan-actility/v1.0.0/payload.js";
    const { name, version } = extractNameAndVersionFromPath(path);
    expect(name).toBe('lorawan-actility');
    expect(version).toBe('v1.0.0');
  });

  it('should handle paths with different names and versions', () => {
    const path = "../../../../network/lorawan-ttittn-v3/v1.0.0/payload.js";
    const { name, version } = extractNameAndVersionFromPath(path);
    expect(name).toBe('lorawan-ttittn-v3');
    expect(version).toBe('v1.0.0');
  });

  it('should extract name and version correctly from complex paths', () => {
    const path = "../../../../network/lorawan-complex-name-with-dashes/v2.3.4-beta/payload.js";
    const { name, version } = extractNameAndVersionFromPath(path);
    expect(name).toBe('lorawan-complex-name-with-dashes');
    expect(version).toBe('v2.3.4-beta');
  });

  it('should handle missing version segment', () => {
    const path = "../../../../network/lorawan-missing-version/payload.js";
    expect(() => extractNameAndVersionFromPath(path)).toThrow();
  });

  it('should handle paths without network segment', () => {
    const path = "../../../../lorawan-no-network-segment/v1.0.0/payload.js";
    expect(() => extractNameAndVersionFromPath(path)).toThrow();
  });

  it('should handle empty path', () => {
    const path = "";
    expect(() => extractNameAndVersionFromPath(path)).toThrow();
  });
});
