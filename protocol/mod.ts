export interface Protocol {
  handleMessage(): Promise<void>;
}
