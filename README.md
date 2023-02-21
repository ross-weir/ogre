# Ergode

[![ci](https://github.com/ross-weir/ergode/actions/workflows/ci.yml/badge.svg)](https://github.com/ross-weir/ergode/actions/workflows/ci.yml) [![codecov](https://codecov.io/github/ross-weir/ergode/branch/main/graph/badge.svg?token=9LGTORWR68)](https://codecov.io/github/ross-weir/ergode)

> Note: This README & project is very much a WIP, some steps may be wrong or missing. Steps required to run/build/develop the node will be added over time.

`ergode` (ergo-node) is a Ergo node implemented in TypeScript targeting web &
native runtimes.

Initial focus is on light operating modes but `ergode` plans to be multi-mode like the `Ergo` reference client so full operating mode could be
added in the distant future.

## Build and Run

`Ergode` can run both natively on desktop via CLI and in the web. Explanations for both below.

You must have `deno` installed to perform the build process. The CLI & NPM package is not currently published anywhere but will be in the future.

### Native

To build the CLI run:

```
deno task build:cli
```

After doing so you should see an executable in `./bin/ergode` that will run the application:

```
./bin/ergode run --help

ergode.exe run

Start running Ergode

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -n, --network  Which Ergo network to connect to
       [required] [choices: "mainnet", "testnet", "devnet"] [default: "mainnet"]
  -c, --config   Path to the Ergode config file
                                             [required] [default: "ergode.toml"]
```

I plan to have the CLI use sensible mainnet configuration by default so very little is required by users to get a mainnet
node up the running. Just download the executable and run it. Configuration will also be possible through a `ergode.toml` file.

### Web

To build `Ergode` as an NPM package run:

```
deno task build:npm
```

After doing so you should see an NPM package in `./dist/npm`. You can use this locally for the time being to add `ergode` to applications
like `React`, in the future it will be published to NPM for usage.

To install `ergode` locally via NPM, in your NPM project run:

```
yarn add /path/to/ergode/dist/npm
```

It should now be usable in your application, for example:

```ts
import { createWebNode } from "@ergode/node";

const node = createWebNode(
  {
    networkType: "devnet",
    config: {
      peers: { knownAddrs: ["/ip4/10.0.2.2/tcp/9020"] },
      logging: { console: { level: "DEBUG" } },
    },
  },
  { bridgeAddr: "/ip4/10.0.2.2/tcp/8109/ws" },
);


node.start();
```

A real basic example can be found here: [here](https://github.com/ross-weir/Ergode.Tizen/tree/main/ErgodeTizenUI).

Running in the web browser/web extensions requires an external bridge component, we will go over bridges in the next section.

#### Bridging

When running in web environments like browsers, webviews and web extensions an external component is required to provide low level networking and platform features not available
in the web.

Some examples:

- [Web extensions use `Native Messaging` in conjuction with a native app](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging)
  - This is how `ergode` could be used to add a light node to web extension wallets like `nautilus` and `SAFEW`.
  - The bridge used for this would be `stdio`.
- [`Capacitor plugin`](https://capacitorjs.com/docs/plugins)
  - This is how TCP connections will be provided to a `ergode` mobile phone app.
  - Since `ergode` is build around being webview compatible `ionic` + `capacitor` seems like a good choice of tech.
- When working on ErgoHack VI I created a bridge based on websockets to communicate with a service app running on Tizen OS.
  - Websockets could be a generic bridge solution.
  - Security will need to be considered for this in practice.
  - Example: https://github.com/ross-weir/Ergode.Bridge

### Why target web runtimes?

High portability.

A big goal (if not the main goal) for `ergode` is to provide a node that can run on smart devices:
mobile phones, wearables like watches & TVs, etc. The development environment
for each of these can vary substantially depending on the brand of the device.
For example, Samsung based smart devices are built on Tizen OS which requires
either C# or C, LG smart devices have WebOS which is nodejs, Android uses JVM,
Apple swift, etc. One thing they all have in common is webview/support for web
based apps so building a library based around web technology appears to be the
best route to achieve high levels of portability and minimal platform specific
code.

Although the focus is for smart devices,  `deno` implements a JavaScript runtime that abides by Web Standards (unlike nodejs),
a useful side-effect is `ergode` can also run natively as a CLI with basically no extra effort.
