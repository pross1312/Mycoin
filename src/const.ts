export const KEY_FILE = "./key_file.pem";
export const BLOCK_CHAIN_FILE = "./block_chain.json";
export const DIFFICULTY = 4;
export const HTTP_PORT = process.env.PORT || 9999;
export const P2P_PORT = Number(process.env.P2P_PORT || 10000);
export const PEERS = process.env.PEERS ? process.env.PEERS.split(';') : [];
