require("dotenv");
import express, { Express, Request, Response, NextFunction } from "express";
import fs from "fs"
import {Block} from "./block";
import {Transaction, TransactionOutput, TransactionInput, Wallet} from "./wallet";
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
        console.error(`Invalid message ${message.toString().substr(0, 100)}, error: ${err}`);
    }
    return null;
});

p2p_server.listen();
p2p_server.connect_to_peers().then(async sockets => {
    if (sockets.length === 0 && !mycoin.load_chain(BLOCK_CHAIN_FILE)) {
        const block = await Block.mine_block(mycoin.blockchain.last(), wallet.public_key, [wallet.new_coin_base_transaction(100)])
        mycoin.add_blocks(block);
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

const format_address = (data: string): {short: string, full: string} => {
    if (data.length === 0) return {
        short: '',
        full: '',
    };
    return {
        short: `0x${Buffer.from(data, 'utf-8').subarray(35).toString('hex').substr(0, 16)}`,
        full: data,
    }
}

const app = express();
app.use(express.json());
app.use(express.raw({type: '*/*'}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`New request: ${req.path}`);
    return next();
});

function paginate<T>(items: T[], page: number, limit: number) {
    const total = items.length;
    const totalPage = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    return {
        pagination: {
            page,
            limit,
            total,
            totalPage,
        },
        data: items.slice(startIndex, endIndex)
    };
}

app.use("/", express.static("public"));

app.get("/api/blocks", (req: Request, res: Response) => {
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 10;

    const blocks = mycoin.blockchain.chain.slice(1).map((block, i) => ({
        block: i + 1,
        age: block.timestamp,
        txn: block.data.length,
        miner: format_address(block.miner),
        reward: 0.12
    })).reverse();

    return success_handler(res, paginate(blocks, page, limit));
});

app.get("/api/transactions", (req: Request, res: Response) => {
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 10;

    return success_handler(res, paginate(mycoin.blockchain.chain.slice(1).flatMap(block => block.data).map(({id, timestamp, initiator, outputs}: Transaction) => ({
        id,
        initiator: format_address(initiator),
        receiver: format_address(outputs.find(txout => txout.address !== initiator)?.address || ""),
        timestamp,
        amount: outputs.reduce((acc: number, output) => (output.address !== initiator ? acc + output.amount : acc), 0)
    })).sort((a, b) => b.timestamp - a.timestamp), page, limit));
});

app.get("/api/wallet", (req: Request, res: Response) => {
    let {address} = req.query;
    if (!address) {
        address = wallet.public_key;
    }

    success_handler(res, {
        address: format_address(address as string),
        balance: mycoin.utxo_manager.get_balance(address as string)
    });
});


app.get("/api/transaction/wallet/:address", (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 10;

    const {address} = req.params;
    if (!address) {
        return next(new AppError(400, "Invalid address"));
    }
    let transactions: Array<Transaction> = [];
    for (const block of mycoin.blockchain.chain) {
        transactions = transactions.concat(block.data.filter(({initiator, outputs}: Transaction) => initiator === address || outputs.find((output: TransactionOutput) => output.address === address) !== undefined));
    }
    return success_handler(res, paginate(transactions.map(({id, timestamp, initiator, outputs}) => ({
        id,
        initiator: format_address(initiator),
        receiver: format_address(outputs.find(txout => txout.address !== initiator)?.address || ""),
        timestamp,
        amount: outputs.reduce((acc: number, output) => (output.address !== initiator ? acc + output.amount : acc), 0)
    })).sort((a, b) => b.timestamp - a.timestamp), page, limit));
});

app.get("/api/latest-block", (req: Request, res: Response) => {
    const {length: _length} = req.query;
    let length = Number(_length);
    if (isNaN(length) || length === 0) length = 5;
    let i = Math.max(1, mycoin.blockchain.chain.length - length + 1);
    const result = mycoin.blockchain.chain.slice(1).slice(-length!).map(x => ({
        id: i++,
        timestamp: x.timestamp,
        amount: x.data.reduce((acc: any, x: any) => acc + x.outputs.reduce((sum: any, txo: any) => txo.amount + sum, 0), 0),
        miner: format_address(x.miner),
        transactionCount: x.data.length,
        duration: x.duration,
    })).reverse();
    console.log(result);
    return success_handler(res, result);
});

app.get("/api/latest-transaction", (req: Request, res: Response) => {
    const {length: _length} = req.query;
    let length = Number(_length);
    if (isNaN(length) || length === 0) length = 5;

    let result: Array<Transaction> = [];
    for (let i = mycoin.blockchain.chain.length - 1; length > 0 && i >= 1; i--) {
        const block = mycoin.blockchain.chain[i];
        const transactions = block.data;
        const slice = transactions.reverse().slice(0, length)
        length -= slice.length;
        result = result.concat(slice);
    }
    const response = result.map(x => ({
        id: x.id,
        amount: x.outputs.reduce((acc: any, output: any) => acc + (output.address === x.initiator ? 0 : output.amount), 0),
        timestamp: x.timestamp,
        from: format_address(x.initiator),
        to: format_address(x.outputs.find(txout => txout.address !== x.initiator)?.address || ""),
    }));
    console.log(response);
    return success_handler(res, response);
});

app.post("/api/transaction", (req: Request, res: Response, next: NextFunction) => {
    const amount = Number(req.body.amount);
    if (isNaN(Number(amount))) {
        return next(new AppError(400, "Invalid 'amount'"));
    }

    const recipient = req.body.recipient as string;
    if (!recipient) {
        return next(new AppError(400, "No 'recipient' provided"));
    }

    console.log(`New transaction ${format_address(recipient)} amount ${amount}`);

    let [transaction, err] = wallet.new_transaction(mycoin.utxo_manager, recipient, amount);
    if (err != null) {
        return next(new AppError(400, err.message));
    }

    Block.mine_block(mycoin.blockchain.last(), wallet.public_key, [transaction]).then(block => {
        const err = mycoin.add_blocks(block);
        if (err != null) {
            console.log(err);
            return;
        }
        p2p_server.broadcast(build_message(MessageType.SYNC, [block]));
        mycoin.store_chain(BLOCK_CHAIN_FILE);
    }).catch(console.error);

    return success_handler(res, transaction);
});

app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError(404, "Not found"));
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
