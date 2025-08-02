import {WebSocket, WebSocketServer} from "ws";

const P2P_PORT = Number(process.env.P2P_PORT || 10000);
const PEERS = process.env.PEERS ? process.env.PEERS.split(';') : [];

export class P2PServer {
    sockets: Array<WebSocket>;
    server: WebSocketServer | undefined;

    constructor() {
        this.sockets = [];
    }

    listen() {
        this.server = new WebSocketServer({port: P2P_PORT});
        this.server.on('connection', (socket: WebSocket) => {
            this.new_connection(socket);
        });
    }

    connect_to_peers() {
        PEERS.forEach(peer => {
            const socket = new WebSocket(peer)
            socket.on('error', console.error);
            socket.on('open', () => this.new_connection(socket));
        });
    }

    new_connection(socket: WebSocket) {
        this.sockets.push(socket);
        console.log(`Socket connected`);
    }
}
