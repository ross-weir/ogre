export interface EventCallback<EventType> {
  (evt: EventType): void;
}
export interface EventObject<EventType> {
  handleEvent: EventCallback<EventType>;
}
export type EventHandler<EventType> =
  | EventCallback<EventType>
  | EventObject<EventType>;

interface Listener {
  once: boolean;
  callback: any;
}

/**
 * Adds types to the EventTarget class. Hopefully this won't be necessary forever.
 *
 * https://github.com/microsoft/TypeScript/issues/28357
 * https://github.com/microsoft/TypeScript/issues/43477
 * https://github.com/microsoft/TypeScript/issues/299
 * etc
 *
 * Taken from libp2p-js
 */
export class EventEmitter<EventMap extends Record<string, any>>
  extends EventTarget {
  #listeners: Map<any, Listener[]> = new Map();

  listenerCount(type: string): number {
    const listeners = this.#listeners.get(type);

    if (listeners == null) {
      return 0;
    }

    return listeners.length;
  }

  addEventListener<K extends keyof EventMap>(
    type: K,
    listener: EventHandler<EventMap[K]> | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventHandler<Event>,
    options?: boolean | AddEventListenerOptions,
  ): void {
    super.addEventListener(type, listener, options);

    let list = this.#listeners.get(type);

    if (list == null) {
      list = [];
      this.#listeners.set(type, list);
    }

    list.push({
      callback: listener,
      once: (options !== true && options !== false && options?.once) ?? false,
    });
  }

  removeEventListener<K extends keyof EventMap>(
    type: K,
    listener?: EventHandler<EventMap[K]> | null,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener?: EventHandler<Event>,
    options?: boolean | EventListenerOptions,
  ): void {
    super.removeEventListener(type.toString(), listener ?? null, options);

    let list = this.#listeners.get(type);

    if (list == null) {
      return;
    }

    list = list.filter(({ callback }) => callback !== listener);
    this.#listeners.set(type, list);
  }

  dispatchEvent(event: Event): boolean {
    const result = super.dispatchEvent(event);

    let list = this.#listeners.get(event.type);

    if (list == null) {
      return result;
    }

    list = list.filter(({ once }) => !once);
    this.#listeners.set(event.type, list);

    return result;
  }

  safeDispatchEvent<Detail>(
    type: keyof EventMap,
    detail: CustomEventInit<Detail>,
  ): boolean {
    return this.dispatchEvent(new CustomEvent<Detail>(type as string, detail));
  }
}
