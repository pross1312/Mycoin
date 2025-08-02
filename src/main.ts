require("dotenv");
import express, { Express, Request, Response, NextFunction } from "express";
import fs from "fs"
import {Block} from "./block";
import {BlockChain} from "./blockchain";
import {Wallet} from "./wallet";
import {UTXOManager} from "./utxo";
import {P2PServer, MessageHandler} from "./p2pserver";
import {BLOCK_CHAIN_FILE, HTTP_PORT} from "./const";

enum MessageType {
    SYNC = "SYNC"
}

const block_chain = new BlockChain();
const wallet = new Wallet();
const utxo_manager = new UTXOManager();

const store_chain = () => {
    fs.writeFileSync(BLOCK_CHAIN_FILE, JSON.stringify(block_chain.chain), 'utf-8');
};

const load_chain = () => {
    if (!fs.existsSync(BLOCK_CHAIN_FILE)) {
        return false;
    }
    const stored_chain = JSON.parse(fs.readFileSync(BLOCK_CHAIN_FILE, 'utf-8'));
    if (!BlockChain.is_valid_chain(stored_chain)) {
        console.error("Invalid block chain file");
        fs.rmSync(BLOCK_CHAIN_FILE);
        return false
    } else {
        return block_chain.replace_if_needed(stored_chain);
    }
};

if (!load_chain()) {
    block_chain.append(JSON.stringify(wallet.new_coin_base_transaction(100)));
    store_chain();
}

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
            store_chain();
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

class AppError extends Error {
    status_code: number;
    message: string;
    constructor(status_code: number, message: string) {
        super(message);
        this.status_code = status_code;
        this.message = message;
    }
}

const success_handler = (res: Response, data: any, status_code: number = 200) => {
    res.status(status_code).json({
        success: true,
        status_code,
        data
    });
}

const app = express();
app.use(express.json());
app.use(express.raw({type: '*/*'}));

app.get("/block", (req: Request, res: Response) => {
    return success_handler(res, block_chain.chain);
});

app.post("/transaction", (req: Request, res: Response, next: NextFunction) => {
    const {recipient, amount} = req.body;
    console.log(recipient, amount);
    if (isNaN(Number(amount))) {
        return next(new AppError(400, "Invalid 'amount'"));
    }

    const [transaction, err] = wallet.new_transaction(utxo_manager, recipient, amount);
    if (err != null) {
        return next(new AppError(400, err.message));
    }

    return success_handler(res, transaction);
});

app.post("/mine", (req: Request, res: Response) => {
    const data: any = req.body.toString('utf8');
    const new_block = block_chain.append(data);
    console.log(`New block added ${new_block.to_string()}`);
    sync_current_chain();
    return success_handler(res, new_block);
});

app.use((err: any | AppError, req: Request, res: Response, next: NextFunction) => {
    const status_code = err?.status_code || 500;
    let message: string;
    if (status_code == 500) message = "Internal server error";
    else message = err?.message || "Bad request";

    if (status_code == 500) console.log(err);
    else console.log(`Error ${status_code}: ${message}`);

    res.status(status_code).json({
        success: false,
        status_code,
        data: message,
    });
});

app.listen(HTTP_PORT, () => {
    console.log(`Server started on port ${HTTP_PORT}`);
});
