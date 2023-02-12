import {
  mergeUserConfigAndValidate,
  NetworkType,
  PartialErgodeConfig,
} from "../config/mod.ts";
import { setupLogging } from "../log/mod.ts";
import { Protocol } from "../protocol/mod.ts";
import { Transport } from "../transports/mod.ts";

export interface NodeOpts {
  networkType: NetworkType;
  config: PartialErgodeConfig;
  transport: Transport;
  protocols: Protocol[];
}

export class Ergode {
  constructor() {
  }

  async runForever() {
  }

  static create(opts: NodeOpts): Ergode {
    const config = mergeUserConfigAndValidate(opts.networkType, opts.config);

    setupLogging(config.logging);
    // create context

    // create all components from context

    return new Ergode();
  }
}
