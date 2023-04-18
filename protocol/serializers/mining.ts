import { bytesToHex, hexToBytes } from "../../_utils/hex.ts";
import { BlockVersion } from "../../chain/block_header.ts";
import {
  AutolykosSolution,
  BlockSolution,
  PowAlgorithm,
} from "../../chain/mining.ts";
import { GROUP_ELEMENT_GENERATOR } from "../../crypto/mod.ts";
import { CursorReader, CursorWriter } from "../../io/cursor_buffer.ts";
import { GroupElementSerializer } from "./crypto.ts";
import { Serializer } from "./serializer.ts";

function isAutolykosSolution(obj: BlockSolution): obj is AutolykosSolution {
  return obj.algorithm === PowAlgorithm.Autolykos;
}

export class AutolykosV1SolutionSerializer
  extends Serializer<AutolykosSolution> {
  serialize(writer: CursorWriter, obj: BlockSolution): void {
    if (!isAutolykosSolution(obj)) {
      throw new TypeError(
        "AutolykosV1SolutionSerializer can only handle autolykos based solutions",
      );
    }

    const geSerializer = new GroupElementSerializer();

    geSerializer.serialize(writer, obj.pk);
    geSerializer.serialize(writer, obj.w);
    writer.putBytes(obj.n);

    const dHex = obj.d.toString(16);
    const dBytes = hexToBytes(dHex);

    writer.putUint8(dBytes.byteLength);
    writer.putBytes(dBytes);
  }

  deserialize(reader: CursorReader): AutolykosSolution {
    const geSerializer = new GroupElementSerializer();
    const pk = geSerializer.deserialize(reader);
    const w = geSerializer.deserialize(reader);
    const n = reader.getBytes(8);
    const dLength = reader.getUint8();
    const dBytes = reader.getBytes(dLength);
    const dHex = bytesToHex(dBytes);
    const d = BigInt(`0x${dHex}`);

    return new AutolykosSolution({
      pk,
      w,
      d,
      n,
    });
  }
}

export class AutolykosV2SolutionSerializer
  extends Serializer<AutolykosSolution> {
  serialize(writer: CursorWriter, obj: BlockSolution): void {
    if (!isAutolykosSolution(obj)) {
      throw new TypeError(
        "AutolykosV2SolutionSerializer can only handle autolykos based solutions",
      );
    }

    const geSerializer = new GroupElementSerializer();

    geSerializer.serialize(writer, obj.pk);
    writer.putBytes(obj.n);
  }

  deserialize(reader: CursorReader): AutolykosSolution {
    const geSerializer = new GroupElementSerializer();
    const pk = geSerializer.deserialize(reader);
    const n = reader.getBytes(8);

    return new AutolykosSolution({
      pk,
      w: GROUP_ELEMENT_GENERATOR,
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
