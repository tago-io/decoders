type LocationGeoJSON = {
  type: "Point";
  coordinates: number[];
};

type LocationLatLng = {
  lat: number;
  lng: number;
};
interface Metadata {
  color?: string;
  x?: string | number;
  y?: string | number;
  label?: string;
  file?: {
    url: string;
    md5: string;
    path: string;
  };
  icon?: string;
  fixed_position?: {
    [key: string]: {
      color: string;
      icon: string;
      value: string;
      x: string;
      y: string;
    };
  };
  sentValues?: [
    {
      label: string;
      value: string | number | boolean;
    }
  ];
  [key: string]: any;
}
interface Data {
  /**
   * Name of the variable for the data.
   */
  variable: string;
  /**
   * Data value.
   */
  value?: string | number | boolean;
  /**
   * Group for the data. Used for grouping different data values.
   */
  group?: string;
  /**
   * Series for the data. Used for grouping different data values.
   *
   * @deprecated Deprecating this in favor of 'group'.
   */
  serie?: string;
  /**
   * Unit for the data value.
   */
  unit?: string;
  /**
   * Location for the data value.
   */
  location?: LocationGeoJSON | LocationLatLng | null;
  /**
   * Metadata for the data value.
   */
  metadata?: Metadata;
  /**
   * Timestamp for the data value.
   */
  time?: string | Date;
}

interface TagsObj {
  key: string;
  value: string;
}

interface ConfigurationParams {
  sent: boolean;
  key: string;
  value: string;
  id?: string;
}
interface DeviceInfo {
  id: string;
  profile: string;
  bucket: string;
  tags: TagsObj[];
  params: ConfigurationParams[];
}

declare let payload: Data[];
declare const device: DeviceInfo;
declare const raw_payload: any;

/**
 * Intellisense for this lib is unavailable
 */
declare function dayjs(...args: any[]): any;
/**
 * Intellisense for this lib is unavailable
 */
declare function loraPacket(...args: any[]): any;

/**
 * @deprecated
 * Not available for payload parser
 */
declare const async: unknown;

/**
 * @deprecated
 * Not available for payload parser
 */
declare const await: unknown;

/**
 * @deprecated
 * Not available for payload parser
 */
declare const yield: unknown;

/**
 * @deprecated
 * Not available for payload parser
 */
// declare const require: unknown;

/**
 * @deprecated Use \`dayjs\` instead.
 */
declare function moment(...args: any[]): any;
