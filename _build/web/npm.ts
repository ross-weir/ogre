// Build web based node as a NPM compatible package.
import { build, emptyDir } from "https://deno.land/x/dnt@0.33.1/mod.ts";
import * as path from "https://deno.land/std@0.176.0/path/mod.ts";
import { version } from "../../version.ts";

function shimsPath(): string {
  const dir = path.dirname(path.fromFileUrl(import.meta.url));

  return path.join(dir, "shims.ts");
}

await emptyDir("./dist/npm");

/**
 * Improvements:
 * - Run another tool like esbuild over the output to perform treeshaking and remove
 * native related code that will never execute in web.
 */
await build({
  entryPoints: ["./_build/web/entrypoint.ts"],
  outDir: "./dist/npm",
  typeCheck: false,
  // TODO: very much want to get this working, we need to disable deno shims though to use generated npm package in web env
  // But by disabling deno shims we fail to generate declarations because of some Deno specific functionality
  // used in the logger module intended for use when running natively (i.e file based logging)
  // Could create a custom no-op shim for this or come up with some other way to get this to work.

  // Could I use deno shims, then shim out the nodejs imports using `mappings`?
  declaration: true,
  test: false,
  scriptModule: false, // only support ESM
  shims: {
    custom: [{
      module: shimsPath(),
      globalNames: ["Deno"],
    }],
  },
  mappings: {
    "https://deno.land/x/zod@v3.20.5/mod.ts": {
      name: "zod",
      version: "3.20.5",
    },
  },
  package: {
    name: "@ergode/node",
    version,
    description:
      "An Ergo node implementation targeting web native environments",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/ross-weir/ergode.git",
    },
    bugs: {
      url: "https://github.com/ross-weir/ergode/issues",
    },
  },
  compilerOptions: {
    lib: ["es2021", "dom"],
  },
});
