require("dotenv");
import express, { Express, Request, Response, NextFunction } from "express";
import fs from "fs"
import {Block} from "./block";
import {Wallet} from "./wallet";
import {MyCoin} from "./mycoin";
import {P2PServer, MessageHandler} from "./p2pserver";
import {PEERS, BLOCK_CHAIN_FILE, HTTP_PORT} from "./const";

enum MessageType {
    SYNC = "SYNC",
    ASK = "ASK",
    REPLACE = "REPLACE",
}

const wallet = new Wallet();
const mycoin = new MyCoin();

const build_message = (type: MessageType, data: any): string => {
    return JSON.stringify({
        type,
        data
    })
};

const message_handler = new Map<MessageType, (message: object) => string|null >([
    [MessageType.SYNC, (data: any) => {
        if (!data || !Array.isArray(data)) {
            throw new Error(`Invalid data ${JSON.stringify(data)}`);
        }

        const err = mycoin.add_blocks(...data);
        if (err !== null) {
            console.log(err.message);
        } else {
            console.log("Chain synced");
        }
        return null;
    }],
    [MessageType.ASK, (_: any) => {
        return JSON.stringify({
            type: MessageType.REPLACE,
            data: mycoin.blockchain.chain
        });
    }],
    [MessageType.REPLACE, (data: any) => {
        if (!data || !Array.isArray(data)) {
            throw new Error(`Invalid data ${JSON.stringify(data)}`);
        }

        const err = mycoin.replace(data);
        if (err !== null) {
            console.log(err.message);
        }

        mycoin.store_chain(BLOCK_CHAIN_FILE);
        return null;
    }]
]);

const p2p_server = new P2PServer((message: string): string | null => {
    try {
        const parsed_message = JSON.parse(message);
        const type = parsed_message["type"];
        console.log(`New ${type} message`);
        if (!(type in MessageType)) {
            throw new Error(`Unknown type ${type}`);
        }
        return message_handler.get(type as MessageType)!(parsed_message["data"]);
    } catch(err) {
        console.error(`Invalid message ${message}, error: ${err}`);
    }
    return null;
});

p2p_server.listen();
p2p_server.connect_to_peers().then(sockets => {
    if (sockets.length === 0 && !mycoin.load_chain(BLOCK_CHAIN_FILE)) {
        mycoin.add_blocks(Block.mine_block(mycoin.blockchain.last(), JSON.stringify(wallet.new_coin_base_transaction(100))));
        mycoin.store_chain(BLOCK_CHAIN_FILE);
        return;
    } else if (sockets.length !== 0) {
        p2p_server.broadcast(build_message(MessageType.ASK, null));
    }
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
    return success_handler(res, mycoin.blockchain.chain);
});

app.get("/balance", (req: Request, res: Response) => {
    let {address} = req.query;
    if (!address) {
        address = wallet.public_key;
    }

    success_handler(res, mycoin.utxo_manager.get_balance(address as string));
});

app.post("/transaction", (req: Request, res: Response, next: NextFunction) => {
    const {recipient, amount} = req.body;
    console.log(`New transaction ${recipient.substr(0, 32)} amount ${amount}`);
    if (isNaN(Number(amount))) {
        return next(new AppError(400, "Invalid 'amount'"));
    }

    let [transaction, err] = wallet.new_transaction(mycoin.utxo_manager, recipient, amount);
    if (err != null) {
        return next(new AppError(400, err.message));
    }

    const block = Block.mine_block(mycoin.blockchain.last(), JSON.stringify(transaction));
    err = mycoin.add_blocks(block);
    if (err != null) {
        return next(new AppError(400, err.message));
    }

    p2p_server.broadcast(build_message(MessageType.SYNC, [block]));
    mycoin.store_chain(BLOCK_CHAIN_FILE);

    return success_handler(res, transaction);
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
