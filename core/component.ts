export interface Component {
  start(): Promise<void>;

  stop(): Promise<void>;
}
