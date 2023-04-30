export type Guid = string & { readonly __brand: unique symbol };

export const guid = {
  new(): Guid {
    return crypto.randomUUID() as Guid;
  },
};

/** Implementors are uniquely identifiable based on a `guid` */
export interface Identifiable {
  guid: Guid;
}

// deno-lint-ignore no-explicit-any ban-types
type Constructor<T = {}> = new (...args: any[]) => T;

/** Mixin providing an `Identifiable` implementation based on UUID4 */
export function IdentifiableMixin<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements Identifiable {
    readonly guid: Guid;

    // deno-lint-ignore no-explicit-any
    constructor(...args: any[]) {
      super(...args);

      this.guid = guid.new();
    }
  };
}
