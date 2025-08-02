import {Block} from "./block";

export class BlockChain {
    chain: Array<Block>;
    constructor() {
        this.chain = [Block.genesis()];
    }

    append(data: any): Block {
        const block = Block.mine_block(this.chain[this.chain.length - 1], data);
        this.chain.push(block);
        return block;
    }

    replace_if_needed(chain: Array<Block>) {
        if (chain.length > this.chain.length) {
            this.chain = chain;
            return true;
        }
        return false;
    }

    static is_valid_chain(chain: Array<Block>) {
        if (!Block.genesis().equal(chain[0])) return false;

        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const last_block = chain[i-1];
            if (block.last_hash != last_block.hash || block.hash != Block.block_hash(block)) {
                return false;
            }
        }
        return true;
    }


}
