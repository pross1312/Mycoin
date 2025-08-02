import {WebSocket, WebSocketServer} from "ws";

const P2P_PORT = Number(process.env.P2P_PORT || 10000);
const PEERS = process.env.PEERS ? process.env.PEERS.split(';') : [];

export type MessageHandler = (message: string) => void;

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

    async connect_to_peers() {
        const promises = PEERS.map(peer => {
            const socket = new WebSocket(peer)
            return new Promise<void>((resolve, reject) => {
                socket.on('error', (...err) => {
                    console.error(err);
                    resolve();
                });
                socket.on('open', () => {
                    this.new_connection(socket)
                    resolve();
                });
            });
        });
        await Promise.all(promises);
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
            this.handler(message);
        })
        console.log(`Socket connected`);
    }
}
