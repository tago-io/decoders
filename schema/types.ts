type Versions = {
  [k: string]: {
    src: string;
    manifest: string;
  };
};

interface Network {
  name: string;
  images: {
    logo?: string;
    banner?: string;
    icon?: string;
  };
  versions: Versions;
  [k: string]:
    | string
    | {
        logo?: string;
        banner?: string;
        icon?: string;
      }
    | {
        [k: string]: {
          src: string;
          manifest: string;
        };
      };
}

interface Connector {
  name: string;
  images: {
    logo?: string;
  };
  versions: Versions;
  [k: string]:
    | string
    | {
        logo?: string;
      }
    | {
        [k: string]: {
          src: string;
          manifest: string;
        };
      };
}

interface ConnectorDetails {
  description: string;
  install_text?: string;
  install_end_text?: string;
  device_annotation?: string;
  device_parameters?: string[];
  networks: string[];
}

interface NetworkDetails {
  serial_number_config?: {
    case?: "upper" | "lower" | "";
    label?: string;
    mask?: string;
    required?: boolean;
  };
  middleware_endpoint?: string;
  documentation_url?: string;
  description: string;
  device_parameters?: unknown[];
}

export type { Network, NetworkDetails, Connector, ConnectorDetails, Versions };
