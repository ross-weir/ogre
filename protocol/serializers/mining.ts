import { BlockVersion } from "../../chain/block_header.ts";
import {
  AutolykosSolution,
  BlockSolution,
  PowAlgorithm,
} from "../../chain/mining.ts";
import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";
import { Serializer } from "./serializer.ts";

function isAutolykosSolution(obj: BlockSolution): obj is AutolykosSolution {
  return obj.algorithm === PowAlgorithm.Autolykos;
}

export class AutolykosV1SolutionSerializer
  extends Serializer<AutolykosSolution> {
  serialize(writer: CursorWriter, obj: BlockSolution): void {
    if (!isAutolykosSolution(obj)) {
      throw new Error("");
    }
  }

  deserialize(reader: CursorReader): AutolykosSolution {
    throw new Error("Method not implemented.");
  }
}

export class AutolykosV2SolutionSerializer
  extends Serializer<AutolykosSolution> {
  serialize(writer: CursorWriter, obj: BlockSolution): void {
    if (!isAutolykosSolution(obj)) {
      throw new Error("");
    }

    writer.putBytes(obj.pk); // might need special EC encoding
    writer.putBytes(obj.n);
  }

  deserialize(reader: CursorReader): AutolykosSolution {
    const pk = reader.getBytes(33); // might need special encoding
    const n = reader.getBytes(8);

    return new AutolykosSolution({
      pk,
      w: new Uint8Array(), // group generator
      d: 0n,
      n,
    });
  }
}

/** Get the PoW solution serializer based on the block version */
export function getSolutionSerializer(
  version: BlockVersion,
): Serializer<BlockSolution> {
  if (version === BlockVersion.Initial) {
    return new AutolykosV1SolutionSerializer();
  }

  return new AutolykosV2SolutionSerializer();
}
