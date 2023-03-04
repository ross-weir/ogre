import { useState, useEffect } from "react";
import { createWebNode, Ergode } from "@ergode/node";

export interface NodeState {
  connectedPeers: number;
}

let _node: Ergode | undefined = undefined;

function App() {
  const [nodeState, setNodeState] = useState<NodeState>({ connectedPeers: 0 });

  useEffect(() => {
    if (_node) {
      return;
    }

    _node = createWebNode(
      {
        networkType: "devnet",
        config: {
          logging: { console: { level: "DEBUG" } },
          peers: { knownAddrs: ["/ip4/127.0.0.1/tcp/9020"] },
        },
      },
      { bridgeAddr: "/ip4/127.0.0.1/tcp/8109/ws" }
    );

    _node.addEventListener("peer:new", () => {
      setNodeState((prevState) => ({
        ...prevState,
        connectedPeers: prevState.connectedPeers + 1,
      }));
    });

    _node.start();
  }, []);

  return <span id="node-state">{JSON.stringify(nodeState)}</span>;
}

export default App;
