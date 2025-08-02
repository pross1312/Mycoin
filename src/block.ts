import * as crypto from 'crypto';
import {DIFFICULTY} from "./const";

export class Block {
    readonly timestamp: number;
    readonly last_hash: string;
    readonly hash: string;
    readonly data: any;
    readonly nounce: number;

    constructor(timestamp: number, last_hash: string, hash: string, data: any, nounce: number) {
        this.timestamp = timestamp;
        this.last_hash = last_hash;
        this.hash = hash;
        this.data = data;
        this.nounce = nounce;
    }

    equal(other: Block): boolean {
        return this.timestamp === other.timestamp &&
               this.last_hash === other.last_hash &&
               this.hash === other.hash &&
               JSON.stringify(this.data) === JSON.stringify(other.data);
    }

    static genesis(): Block {
        return new this(0, "-----", "fir57-h45h", null, 0);
    }

    static mine_block(last_block: Block, data: string): Block {
        const last_hash = last_block.hash;
        const timestamp = Date.now();
        let nounce = 0;
        const prefix = "0".repeat(DIFFICULTY);
        console.log(prefix);
        let hash: string;
        do {
            nounce++;
            hash = Block.hash(timestamp, last_hash, data, nounce);
        } while (!hash.startsWith(prefix))
        return new this(timestamp, last_hash, hash, data, nounce);
    }

    static hash(timestamp: number, last_hash: string, data: any, nounce: number): string {
        return crypto.createHash('sha256').update(`${timestamp}${last_hash}${data}${nounce}`).digest('hex');
    }

    static block_hash(block: Block): string {
        const {timestamp, last_hash, data, nounce} = block;
        return Block.hash(timestamp, last_hash, data, nounce);
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
