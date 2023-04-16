import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";
import { NetworkEncodable } from "../encoding.ts";

export abstract class BlockSolution implements NetworkEncodable {
  abstract get algorithmName(): string;
  abstract encode(writer: CursorWriter): void;

  static decode(reader: CursorReader): BlockSolution {
    return AutolykosV2Solution.decode(reader);
  }
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

  encode(writer: CursorWriter): void {
    throw new Error("Method not implemented.");
  }

  static decode(reader: CursorReader): AutolykosV2Solution {
    throw new Error("no impl");
  }
}
