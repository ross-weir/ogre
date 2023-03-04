#!/bin/bash

deno run -A _test/ws_bridge.ts &
pid=$!

cd $PWD/_test/web-e2e
yarn test >&1
exit_code=$?

kill $pid
exit $exit_code
