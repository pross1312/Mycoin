import * as crypto from 'crypto';
import {DIFFICULTY} from "./const";

export class Block {
    readonly timestamp: number;
    readonly last_hash: string;
    readonly hash: string;
    readonly data: any;
    readonly nounce: number;
    readonly duration: number;
    readonly miner: string;

    constructor(timestamp: number, last_hash: string, hash: string, data: any, nounce: number, duration: number, miner: string) {
        this.timestamp = timestamp;
        this.last_hash = last_hash;
        this.hash = hash;
        this.data = data;
        this.nounce = nounce;
        this.duration = duration;
        this.miner = miner;
    }

    equal(other: Block): boolean {
        return this.timestamp === other.timestamp &&
               this.last_hash === other.last_hash &&
               this.hash === other.hash &&
               JSON.stringify(this.data) === JSON.stringify(other.data);
    }

    static genesis(): Block {
        return new this(0, "-----", "fir57-h45h", [], 0, 0, "");
    }

    static mine_block(last_block: Block, miner: string, data: any): Promise<Block> {
        return new Promise<Block>((resolve, reject) => {
            const last_hash = last_block.hash;
            const timestamp = Date.now();
            let nounce = 0;
            const prefix = "0".repeat(DIFFICULTY);
            let hash: string;
            const data_str = JSON.stringify(data);
            do {
                nounce++;
                hash = Block.hash(timestamp, last_hash, data_str, nounce, miner);
            } while (!hash.startsWith(prefix))
            const duration = Date.now() - timestamp;
            resolve(new this(timestamp, last_hash, hash, data, nounce, duration, miner));
        });
    }

    static hash(timestamp: number, last_hash: string, data_str: string, nounce: number, miner: string): string {
        return crypto.createHash('sha256').update(`${timestamp}${last_hash}${data_str}${nounce}${miner}`).digest('hex');
    }

    static block_hash(block: Block): string {
        const {timestamp, last_hash, data, nounce, miner} = block;
        const data_str = JSON.stringify(data);
        return Block.hash(timestamp, last_hash, data_str, nounce, miner);
    }

    to_string(): string {
        return `----BLOCK----
Timestamp: ${this.timestamp}
Lash hash: ${this.last_hash.substr(0, 10)}
Hash     : ${this.hash.substr(0, 10)}
Nounce   : ${this.nounce}
Data     : ${this.data}
`;
    }
}
