export type TxOutputData = { txid: string, index: number, amount: number }

type UTXOInternal = Map<string, Array<TxOutputData>>;

export class UTXOManager {
    utxo: UTXOInternal;
    constructor() {
        this.utxo = new Map();
    }

    add(address: string, ...outputs: Array<TxOutputData>) {
        this.utxo.set(address, (this.utxo.get(address) || []).concat(...outputs));
    }

    take(address: string, amount: number): Array<TxOutputData> {
        if (!(address in this.utxo) || amount <= 0) {
            return [];
        }
        const outputs = this.utxo.get(address)!;

        for (let i = 0; i < outputs.length; i++) {
            amount -= outputs[i].amount
            if (amount <= 0) {
                console.log("outputs ", outputs);
                const result = outputs.splice(0, i);
                console.log("outputs ", outputs);
                console.log("results ", result);
            }
        }
        return [];
    }
}
