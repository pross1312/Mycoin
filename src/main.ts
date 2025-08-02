require("dotenv");
import express, { Express, Request, Response, NextFunction } from "express";
import {Block} from "./block";
import {BlockChain} from "./blockchain";
import {P2PServer} from "./p2pserver";

const HTTP_PORT = process.env.PORT || 9999;

const block_chain = new BlockChain();
const p2p_server = new P2PServer();

p2p_server.listen();
p2p_server.connect_to_peers();

const app = express();

app.use(express.json());
app.use(express.raw({type: '*/*'}));

app.get("/block", (req: Request, res: Response) => {
    // TODO: filter
    res.status(200).json(block_chain.chain);
});

app.post("/block", (req: Request, res: Response) => {
    const data: any = req.body.toString('utf8');
    const new_block = block_chain.append(data);
    console.log(`New block added ${new_block.to_string()}`);
    res.status(200).send("Ok");
});

app.listen(HTTP_PORT, () => {
    console.log(`Server started on port ${HTTP_PORT}`);
});
