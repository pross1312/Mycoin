import {BlockChain} from "./blockchain";
import {Block} from "./block";
import {UTXOManager} from "./utxo";
import fs from "fs";

export class MyCoin {
    blockchain: BlockChain;
    utxo_manager: UTXOManager;
    constructor() {
        this.blockchain = new BlockChain();
        this.utxo_manager = new UTXOManager();
    }

    replace(blocks: Array<Block>): Error | null {
        if (!BlockChain.is_valid_chain(blocks)) {
            return new Error("Invalid chain");
        }

        const old_utxo_manager = this.utxo_manager;
        this.utxo_manager = new UTXOManager();
        for (const block of blocks) {
            const {data: transactions} = block;
            if (transactions === null) {
                continue;
            }
            const err = this.utxo_manager.update(transactions);
            if (err !== null) {
                return err;
            }
        }
        this.blockchain.chain = blocks;
        return null;
    }

    add_blocks(...blocks: Array<Block>): Error | null {
        if (blocks.length === 0) {
            return null;
        }

        const last_block = this.blockchain.last();
        if (last_block.hash != blocks[0].last_hash) {
            return new Error("Fork is not supported");
        }

        if (!BlockChain.is_valid_chain(blocks)) {
            return new Error("Invalid chain");
        }

        for (const block of blocks) {
            const {data: transactions} = block;
            const err = this.utxo_manager.update(...transactions);
            if (err !== null) {
                return err;
            }
        }

        this.blockchain.append(...blocks);
        return null;
    }

    store_chain(storage_file_path: string) {
        fs.writeFileSync(storage_file_path, JSON.stringify(this.blockchain.chain), 'utf-8');
        console.log(`Data stored`);
    }

    load_chain(storage_file_path: string): boolean {
        if (!fs.existsSync(storage_file_path)) {
            return false;
        }
        const stored_chain = JSON.parse(fs.readFileSync(storage_file_path, 'utf-8'));
        if (!BlockChain.is_valid_chain(stored_chain)) {
            console.error("Invalid block chain file");
            fs.rmSync(storage_file_path);
            return false
        } else if (this.blockchain.replace_if_needed(stored_chain)) {
            for (const block of this.blockchain.chain) {
                if (block.data.length > 0) {
                    const err = this.utxo_manager.update(...block.data);
                    if (err != null) {
                        throw err;
                    }
                }
            }
            return true;
        }
        return false;
    }
}
