import yargs from "https://deno.land/x/yargs@v17.7.0-deno/deno.ts";
import * as toml from "https://deno.land/std@0.177.0/encoding/toml.ts";
import { NetworkType } from "../../config/mod.ts";
import { createNativeNode, Ergode } from "../../node/mod.ts";
import { version } from "../../version.ts";
import { secretQuote } from "./secret_file.ts";
import { PartialErgodeConfig } from "../../config/schema.ts";

let _ergode: Ergode | undefined;

interface RunOpts {
  network: NetworkType;
  config: string;
}

function scriptName() {
  let name = "ergode";

  if (Deno.build.os === "windows") {
    name = `${name}.exe`;
  }

  return name;
}

async function getConfig(configPath: string) {
  try {
    const userCfgStr = await Deno.readTextFile(configPath);

    return toml.parse(userCfgStr);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      console.log(`Config file not found: '${configPath}'`);
      console.log("Default configuration will be used");

      return {};
    } else {
      throw e;
    }
  }
}

async function runHandler({ network, config }: RunOpts) {
  // createNativeNode will throw an error if config file is invalid.
  const cfg = await getConfig(config) as PartialErgodeConfig;

  _ergode = createNativeNode({ networkType: network, config: cfg });
  _ergode.start();
}

async function onExit() {
  if (_ergode) {
    await _ergode.stop();
  }
}

globalThis.addEventListener("unload", onExit);
Deno.addSignalListener("SIGINT", onExit);

yargs(Deno.args).scriptName(scriptName()).command(
  "run",
  "Start running Ergode",
  // deno-lint-ignore no-explicit-any
  function (yargs: any) {
    return yargs.option("network", {
      alias: "n",
      demandOption: true,
      default: "mainnet",
      describe: "Which Ergo network to connect to",
      choices: ["mainnet", "testnet", "devnet"],
    }).option("config", {
      alias: "c",
      demandOption: true,
      default: "ergode.toml",
      describe: "Path to the Ergode config file",
    });
  },
  runHandler,
).command(
  "ogre",
  "???",
  {},
  () => console.log(secretQuote),
).version(
  `Ergode version: v${version}`,
).parse();
