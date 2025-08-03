import {Wallet, Transaction} from "./wallet";
import {ChainUtils} from "./chainutils";

export type TxOutputData = { address: string, txid: string, index: number, amount: number }

export class UTXOManager {
    utxo: Array<TxOutputData>;
    constructor() {
        this.utxo = [];
    }

    get_balance(address: string): number {
        return this.utxo.reduce((acc, cur) => acc + (cur.address === address ? cur.amount : 0), 0);
    }

    add(...outputs: Array<TxOutputData>) {
        this.utxo = this.utxo.concat(...outputs);
    }

    take(address: string, amount: number): Array<TxOutputData> {
        let result: Array<TxOutputData> = [];
        for (let i = this.utxo.length - 1; amount > 0 && i >= 0; i--) {
            const output = this.utxo[i];
            if (address !== output.address) {
                continue;
            }
            amount -= output.amount;
            result = result.concat(this.utxo[i]);
        }
        if (amount > 0) {
            return [];
        }
        return result;
    }

    update(...transactions: Array<Transaction>): Error | null {
        const cloned = [...this.utxo];
        for (const tx of transactions) {
            const err = this._update(tx);
            if (err !== null) {
                this.utxo = cloned;
                return err;
            }
        }
        console.log("Update utxo", this.utxo);
        return null;
    }

    private _update(transaction: Transaction): Error | null {
        const {id, inputs, outputs} = transaction;
        let sum_input = 0;
        const output_str = `${JSON.stringify(outputs)}`;
        for (const input of inputs) {
            const {txid, output_index, signature} = input;
            const prev_out = this.utxo.find(x => x.txid === txid && output_index === x.index);
            if (prev_out === undefined) {
                return new Error("Could not find utxo");
            }

            if (!ChainUtils.verify(`${output_str}${txid}${output_index}`, signature, ChainUtils.hex_to_public_key(prev_out.address))) {
                return new Error("Invalid signature");
            }

            sum_input += prev_out.amount;
            this.utxo.splice(this.utxo.indexOf(prev_out), 1)[0];
        }

        if (inputs.length !== 0 && sum_input < outputs.reduce((acc, cur) => cur.amount + acc, 0)) {
            return new Error("Not enough balance");
        }

        this.add(...outputs.map((x, i) => {return {
            address: x.address,
            txid: id,
            index: i,
            amount: x.amount
        }}));
        return null;
    }
}
