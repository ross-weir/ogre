import { Version } from "./version.ts";

/** Version milestones for the ergo reference client */
export const REF_CLIENT_MILESTONE = {
  /** Initial launch version */
  initial: new Version(0, 0, 1),
  /** Sync v2 introduced */
  syncV2: new Version(4, 0, 16),
  /** Delivering broken block sections */
  brokenBlockSection4017: new Version(4, 0, 17),
  /** Delivering broken block sections */
  brokenBlockSection4018: new Version(4, 0, 18),
};
