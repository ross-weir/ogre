import * as esbuild from "https://deno.land/x/esbuild@v0.15.10/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.6.0/mod.ts";

const result = await esbuild.build({
  plugins: [denoPlugin()],
  entryPoints: ["./web/entrypoint.ts"],
  outfile: "./dist/ergode.esm.js",
  bundle: true,
  format: "esm",
});

console.log(result);

esbuild.stop();
