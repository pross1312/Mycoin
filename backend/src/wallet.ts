import * as crypto from 'crypto';
import * as fs from 'fs';
import {ChainUtils} from "./chainutils";
import {KEY_FILE} from "./const";
import {UTXOManager} from "./utxo";

export interface TransactionInput {
    txid: string;
    output_index: number;
    signature: string;
}

export interface TransactionOutput {
    address: string; // NOTE: public key
    amount: number;
}

export interface Transaction {
    id: string;
    initiator: string;
    inputs: Array<TransactionInput>;
    outputs: Array<TransactionOutput>;
    timestamp: number;
}

export class Wallet {
    private_key: crypto.KeyObject;
    public_key: string;

    constructor() {
        try {
            this.private_key = ChainUtils.private_key_from_file(KEY_FILE);
            this.public_key = ChainUtils.public_key_to_hex(crypto.createPublicKey(this.private_key));
            console.log(`Loaded key pair`);
        } catch (err) {
            const {privateKey, publicKey} = ChainUtils.new_key_pair();
            this.private_key = privateKey;
            this.public_key = ChainUtils.public_key_to_hex(crypto.createPublicKey(this.private_key));
            ChainUtils.private_key_to_file(this.private_key, KEY_FILE);
        }
        console.log(`Wallet initialized: ${this.public_key}`);
    }

    new_coin_base_transaction(amount: number): Transaction {
        const id = crypto.randomUUID();
        return {
            id,
            initiator: "",
            inputs: [],
            timestamp: Date.now(),
            outputs: [{
                address: this.public_key,
                amount
            }]
        };
    }

    new_transaction(utxo_manager: UTXOManager, recipient: string, amount: number): [Transaction | null, Error | null] {
        const tx_inputs = utxo_manager.take(this.public_key, amount);
        if (tx_inputs.length == 0) {
            return [null, new Error("Not enough balance")];
        }
        const left_over = tx_inputs.reduce((acc, cur) => cur.amount + acc, 0) - amount;

        const id = crypto.randomUUID();
        const outputs = [
            {
                address: recipient,
                amount
            },
            {
                address: this.public_key,
                amount: left_over
            }
        ];


        const inputs = tx_inputs.map(({ txid, index, amount }) => {return {
            txid,
            output_index: index,
            signature: ChainUtils.sign(`${this.public_key}${JSON.stringify(outputs)}${txid}${index}`, this.private_key),
        }});

        return [{
            id,
            initiator: this.public_key,
            inputs,
            outputs,
            timestamp: Date.now(),
        }, null];
    }
}
