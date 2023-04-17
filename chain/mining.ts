export enum PowAlgorithm {
  Autolykos,
}

export abstract class BlockSolution {
  /** Algorithm used to produce the solution */
  abstract get algorithm(): PowAlgorithm;
}

export interface AutolykosOpts {
  pk: Uint8Array;
  w: Uint8Array;
  n: Uint8Array;
  d: bigint;
}

export class AutolykosSolution extends BlockSolution {
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

  get algorithm(): PowAlgorithm {
    return PowAlgorithm.Autolykos;
  }
}
