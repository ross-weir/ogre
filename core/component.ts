/** A component providing node functionality */
export interface Component {
  /** Start running the component */
  start(): Promise<void>;

  /** Stop running the component and cleanup */
  stop(): Promise<void>;
}
