# Mycoin

My individual project about basic blockchain and cryptocurrency for Modern Sofware course in HCMUS

Each node is also a miner, and has a wallet.

# Quickstart

```bash
$ cd frontend
$ npm install
$ cd ../backend
$ npm install
$ cd ..
$ sh start.sh                                                      # this will build frontend and bundled it to backend
$ PEERS="ws://localhost:19001" sh start.sh 2                       # start another node that connects to the first node
$ PEERS="ws://localhost:19001;ws://localhost:190002" sh start.sh 2 # start another node that connects to the first 2 node
```
