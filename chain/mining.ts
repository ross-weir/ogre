export abstract class BlockSolution {
  abstract get algorithmName(): string;
}

export interface AutolykosOpts {
  pk: Uint8Array;
  w: Uint8Array;
  n: Uint8Array;
  d: bigint;
}

export class AutolykosV2Solution extends BlockSolution {
  readonly pk: Uint8Array;
  readonly w: Uint8Array;
  readonly n: Uint8Array;
  readonly d: bigint;

  constructor(opts: AutolykosOpts) {
    super();

    this.pk = opts.pk;
    this.w = opts.w;
    this.n = opts.n;
    this.d = opts.d;
  }

  get algorithmName(): string {
    return "AutolykosV2";
  }
}
