import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";
import { PeerFeature, PeerFeatureId } from "./feature.ts";

export const KEEP_ALL_BLOCKS = -1;
export const MAX_MODE_FEATURE_SIZE = 512;

export interface ModeOpts {
  stateType: number;
  isVerifyingTransactions: boolean;
  popowSuffix?: number | undefined;
  blocksToKeep: number;
}

export class ModePeerFeature extends PeerFeature {
  readonly stateType: number;
  readonly isVerifyingTransactions: boolean;
  readonly popowSuffix: number | undefined;
  readonly blocksToKeep: number;

  constructor(
    { stateType, isVerifyingTransactions, popowSuffix, blocksToKeep }: ModeOpts,
  ) {
    super();

    this.stateType = stateType;
    this.isVerifyingTransactions = isVerifyingTransactions;
    this.popowSuffix = popowSuffix;
    this.blocksToKeep = blocksToKeep;
  }

  get id(): PeerFeatureId {
    return PeerFeatureId.Mode;
  }

  get isKeepingAllBlocks(): boolean {
    return this.blocksToKeep === KEEP_ALL_BLOCKS;
  }

  encode(writer: CursorWriter): void {
    writer.putInt8(this.stateType);
    writer.putInt8(this.isVerifyingTransactions ? 1 : 0);
    writer.putOption(this.popowSuffix, (w, v) => w.putInt32(v));
    writer.putInt32(this.blocksToKeep);
  }

  static decode(reader: CursorReader): ModePeerFeature {
    if (reader.buffer.byteLength > MAX_MODE_FEATURE_SIZE) {
      throw new Error("Mode feature too large to decode");
    }

    const stateType = reader.getInt8();
    const isVerifyingTransactions = reader.getInt8() === 1 ? true : false;
    const popowSuffix = reader.getOption<number>((r) => r.getInt32());
    const blocksToKeep = reader.getInt32();

    return new ModePeerFeature({
      stateType,
      isVerifyingTransactions,
      popowSuffix,
      blocksToKeep,
    });
  }
}
