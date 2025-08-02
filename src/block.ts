import * as crypto from 'crypto';

export class Block {
    readonly timestamp: number;
    readonly last_hash: string;
    readonly hash: string;
    readonly data: any;

    constructor(timestamp: number, last_hash: string, hash: string, data: any) {
        this.timestamp = timestamp;
        this.last_hash = last_hash;
        this.hash = hash;
        this.data = data;
    }

    equal(other: Block): boolean {
        return this.timestamp === other.timestamp &&
               this.last_hash === other.last_hash &&
               this.hash === other.hash &&
               JSON.stringify(this.data) === JSON.stringify(other.data);
    }

    static genesis(): Block {
        return new this(0, "-----", "fir57-h45h", null);
    }

    static mine_block(last_block: Block, data: any): Block {
        const timestamp = Date.now();
        const last_hash = last_block.hash;
        const hash = Block.hash(timestamp, last_hash, data);
        return new this(timestamp, last_hash, hash, data);
    }

    static hash(timestamp: number, last_hash: string, data: any): string {
        return crypto.createHash('sha256').update(`${timestamp}${last_hash}${data}`).digest('hex');
    }

    static block_hash(block: Block): string {
        const {timestamp, last_hash, data} = block;
        return Block.hash(timestamp, last_hash, data);
    }

    to_string(): string {
        return `----BLOCK----
Timestamp: ${this.timestamp}
Lash hash: ${this.last_hash.substr(0, 10)}
Hash     : ${this.hash.substr(0, 10)}
Data     : ${this.data}
`;
    }
}
