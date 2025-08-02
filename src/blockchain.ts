import {Block} from "./block";
import {DIFFICULTY} from "./const";

export class BlockChain {
    chain: Array<Block>;
    constructor() {
        this.chain = [Block.genesis()];
    }

    append(data: string): Block {
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

        const prefix = "0".repeat(DIFFICULTY);
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const last_block = chain[i-1];
            const actual_hash = Block.block_hash(block);
            if (block.last_hash != last_block.hash || block.hash != actual_hash) {
                return false;
            }

            if (!actual_hash.startsWith(prefix)) {
                return false;
            }
        }
        return true;
    }


}
