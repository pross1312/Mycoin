import {PEERS, P2P_PORT} from "./const";
import {WebSocket, WebSocketServer} from "ws";

export type MessageHandler = (message: string) => string | null;

export class P2PServer {
    static RECONNECT_INTERVAL = 5000;
    sockets: {[key: string]: WebSocket};
    server: WebSocketServer | undefined;
    handler: MessageHandler;
    reconnect_timer: null | ReturnType<typeof setTimeout>;

    constructor(message_handler: MessageHandler) {
        this.sockets = {};
        this.handler = message_handler;
        this.reconnect_timer = null;
    }

    listen() {
        this.server = new WebSocketServer({port: P2P_PORT});
        this.server.on('connection', (socket: WebSocket, req) => {
            this.new_connection(socket, `${req.socket.remoteAddress}:${req.socket.remotePort}`);
        });
        console.log(`P2P server started on ${P2P_PORT}`);
    }

    async connect_to_peers(): Promise<Array<WebSocket>> {
        const to_be_connected = PEERS.filter(url => {
            const socket = this.sockets[url];
            return socket === undefined || socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED;
        })
        if (to_be_connected.length === 0) {
            return Object.values(this.sockets);
        }
        const promises = to_be_connected.map(peer => {
            const socket = new WebSocket(peer)
            return new Promise<void>((resolve, reject) => {
                socket.on('error', (err) => {
                    console.log(`Failed to connect to ${peer}, error: ${err}`);
                    resolve();
                });
                socket.on('open', () => {
                    this.new_connection(socket, peer);
                    resolve();
                });
            });
        });
        if (this.reconnect_timer === null) {
            this.reconnect_timer = setInterval(async () => {
                await this.connect_to_peers();
            }, P2PServer.RECONNECT_INTERVAL);
        }
        await Promise.all(promises);
        return Object.values(this.sockets);
    }

    broadcast(message: string) {
        console.log(`Broadcasting message to ${this.sockets.size} peers`);
        for (const key in this.sockets) {
            this.sockets[key].send(message);
        }
    }

    new_connection(socket: WebSocket, id: string) {
        this.sockets[id]?.close();
        this.sockets[id] = socket;
        socket.on('error', (err) => {
            console.log(`An error occurred on connection ${id}, error: ${err}`);
            socket.close();
            delete this.sockets[id];
        });
        socket.on('close', (...args) => {
            console.log(`Socket closed`);
            delete this.sockets[id];
        });
        socket.on('message', data => {
            const message = data.toString('utf-8')
            const result = this.handler(message);
            if (result != null) {
                socket.send(result);
            }
        });
        console.log(`Socket connected ${id}`);
    }
}
