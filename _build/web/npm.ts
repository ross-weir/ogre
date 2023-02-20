// Build web based node as a NPM compatible package.
import { build, emptyDir } from "https://deno.land/x/dnt@0.33.1/mod.ts";
import { version } from "../../version.ts";

await emptyDir("./dist/npm");

await build({
  entryPoints: ["./_build/web/entrypoint.ts"],
  outDir: "./dist/npm",
  typeCheck: false,
  // TODO: very much want to get this working, we need to disable deno shims though to use generated npm package in web env
  // But by disabling deno shims we fail to generate declarations because of some Deno specific functionality
  // used in the logger module intended for use when running natively (i.e file based logging)
  // Could create a custom no-op shim for this or come up with some other way to get this to work.
  declaration: false,
  test: false,
  shims: {},
  package: {
    name: "@ergode/node",
    version,
    description: "Ergode ergo node targeting web environments",
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
