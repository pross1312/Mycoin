require("dotenv");
import express, { Express, Request, Response, NextFunction } from "express";
import {Block} from "./block";
import {BlockChain} from "./blockchain";
import {P2PServer, MessageHandler} from "./p2pserver";

enum MessageType {
    SYNC = "SYNC"
}

const HTTP_PORT = process.env.PORT || 9999;
const block_chain = new BlockChain();

const sync_current_chain = () => {
    p2p_server.broadcast(JSON.stringify({
        type: MessageType.SYNC,
        data: block_chain.chain
    }));
};

const message_handler = new Map<MessageType, (message: object)=>void>([
    [MessageType.SYNC, (data: any) => {
        if (!data) {
            throw new Error(`Invalid data ${data}`);
        }

        if (!BlockChain.is_valid_chain(data)) {
            throw new Error(`Invalid blockchain ${data}`);
        }

        if (block_chain.replace_if_needed(data as Array<Block>)) {
            console.log(`Chain synced`);
        } else {
            console.log(`Chain rejected`);
            if (data.length < block_chain.chain.length) {
                sync_current_chain();
            }
        }
    }]
]);

const p2p_server = new P2PServer((message: string) => {
    try {
        const parsed_message = JSON.parse(message);
        const type = parsed_message["type"];
        if (!(type in MessageType)) {
            throw new Error(`Unknown type ${type}`);
        }
        message_handler.get(type as MessageType)!(parsed_message["data"]);
    } catch(err) {
        console.error(`Invalid message ${message}, error: ${err}`);
    }
});

p2p_server.listen();
p2p_server.connect_to_peers().then(() => {
    p2p_server.broadcast("test");
    sync_current_chain();
}).catch(console.error);

const app = express();

app.use(express.json());
app.use(express.raw({type: '*/*'}));

app.get("/block", (req: Request, res: Response) => {
    // TODO: filter
    res.status(200).json(block_chain.chain);
});

app.post("/mine", (req: Request, res: Response) => {
    const data: any = req.body.toString('utf8');
    const new_block = block_chain.append(data);
    console.log(`New block added ${new_block.to_string()}`);
    sync_current_chain();
    res.status(200).send("Ok");
});

app.listen(HTTP_PORT, () => {
    console.log(`Server started on port ${HTTP_PORT}`);
});
