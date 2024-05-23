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

export { Network, Connector, Versions };
