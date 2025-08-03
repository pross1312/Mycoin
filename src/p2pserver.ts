import {PEERS, P2P_PORT} from "./const";
import {WebSocket, WebSocketServer} from "ws";

export type MessageHandler = (message: string) => string | null;

export class P2PServer {
    sockets: Array<WebSocket>;
    server: WebSocketServer | undefined;
    handler: MessageHandler;

    constructor(message_handler: MessageHandler) {
        this.sockets = [];
        this.handler = message_handler;
    }

    listen() {
        this.server = new WebSocketServer({port: P2P_PORT});
        this.server.on('connection', (socket: WebSocket) => {
            this.new_connection(socket);
        });
        console.log(`P2P server started on ${P2P_PORT}`);
    }

    async connect_to_peers(): Promise<Array<WebSocket>> {
        const promises = PEERS.map(peer => {
            const socket = new WebSocket(peer)
            return new Promise<WebSocket | null>((resolve, reject) => {
                socket.on('error', (...err) => {
                    console.error(err);
                    resolve(null);
                });
                socket.on('open', () => {
                    this.new_connection(socket)
                    resolve(socket);
                });
            });
        });
        return (await Promise.all(promises)).filter(x => x !== null);
    }

    broadcast(message: string) {
        console.log(`Broadcasting message ${message} to ${this.sockets.length} peers`);
        this.sockets.forEach(socket => {
            socket.send(message);
        });
    }

    new_connection(socket: WebSocket) {
        this.sockets.push(socket);
        socket.on('error', (...err) => {
            console.error(err);
            socket.close();
            this.sockets.splice(this.sockets.indexOf(socket), 1);
        });
        socket.on('close', (...args) => {
            console.log(args);
            this.sockets.splice(this.sockets.indexOf(socket), 1);
        })
        socket.on('message', data => {
            const message = data.toString('utf-8')
            console.log(`New message ${message}`);
            const result = this.handler(message);
            if (result != null) {
                socket.send(result);
            }
        })
        console.log(`Socket connected`);
    }
}
