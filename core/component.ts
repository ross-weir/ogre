import { EventEmitter } from "../events/mod.ts";

/** A component providing node functionality. */
export interface IComponent {
  /** Run any initialization before starting component. */
  beforeStart(): Promise<void>;
  /** Start running the component. */
  start(): Promise<void>;
  /** Stop running the component and cleanup. */
  stop(): Promise<void>;
}

export interface ComponentErrors {
  error: CustomEvent<Error>;
}

export abstract class Component<T = ComponentErrors>
  extends EventEmitter<T & ComponentErrors>
  implements IComponent {
  beforeStart(): Promise<void> {
    return Promise.resolve();
  }

  start(): Promise<void> {
    return Promise.resolve();
  }

  stop(): Promise<void> {
    return Promise.resolve();
  }
}
