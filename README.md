# Ergode

[![ci](https://github.com/ross-weir/ergode/actions/workflows/ci.yml/badge.svg)](https://github.com/ross-weir/ergode/actions/workflows/ci.yml)

`ergode` (ergo-node) is a Ergo node implemented in TypeScript targeting web & native runtimes.

Current focus is on building a light node for mobile phones. It would also be cool to see the library used to add light nodes to wallet browser extensions like the awesome Nautilus & SAFEW and smart devices like wearables & TVs.

### Why target web runtimes?

My vision for `ergode` is to provide a node that can run on smart devices: mobile phones, wearables like watches & TVs, etc. The development environment for each of these can vary substantially depending on the brand of the device. For example, Samsung based smart devices are built on Tizen OS which requires either C# or C, LG smart devices have WebOS which is nodejs, Android uses JVM, Apple swift, etc. One thing they all have in common is webview/support for web based apps so building a library based around web technology appears to be the best route to achieve high levels of portability and minimal platform specific code.

### How do you use functionality not available in web environments?

Web based environments don't allow raw TCP connections (p2p) for example. Currently the Ergo reference client only supports TCP as a p2p network transport.

To get around this, when running in web environments `ergode` depends on a sidecar app that will proxy TCP connections for us, currently this is done over websockets using some RPC type calls. The implementation of the sidecar will be the platform specific code we're trying to minimize by targeting web.

### How can the node run on web and natively?

Thanks to `Deno` the library can be bundled and distributed on NPM/CDN/denoland and used in web environments while also having the possibility to cross-compile to a standalone executable.

When running in web environments a sidecar providing platform functionality is required. When running natively a sidecar is not required and the app can use native platform functionality directly.

### Why Deno?

1. `Deno` implements Web standard APIs (unlike nodejs) making it easy to create libraries that can work both in web environments using a bridge and natively using functionality directly
2. Easy to cross-compile to a standalone executable and run on windows/linux/apple as well as bundle and run on the web
3. Good security model
4. Built with Rust and can be extended with Rust - we can leverage `sigma-rust` if needed (on native platforms at least)
