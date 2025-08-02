import * as crypto from 'crypto';
import * as fs from 'fs';
import {KEY_FILE} from "./const";
import {UTXOManager} from "./utxo";

interface TransactionInput {
    txid: string;
    output_index: number;
    signature: string;
}

interface TransactionOutput {
    address: string; // NOTE: public key
    amount: number;
}

interface Transaction {
    id: string;
    inputs: Array<TransactionInput>;
    outputs: Array<TransactionOutput>;
}

const KEY_FORMAT = "pem";
const PUBLIC_KEY_TYPE = "spki";
const PRIVATE_KEY_TYPE = "sec1";

export class Wallet {
    private_key: crypto.KeyObject;
    public_key: string;

    constructor() {
        try {
            const file_content = fs.readFileSync(KEY_FILE, 'hex');
            this.private_key = crypto.createPrivateKey({
                key: file_content,
                format: KEY_FORMAT,
                type: PRIVATE_KEY_TYPE
            });
            this.public_key = Wallet._public_key_to_hex(crypto.createPublicKey(this.private_key));
            console.log(`Loaded key pair`);
        } catch (err) {
            const {privateKey, publicKey} = crypto.generateKeyPairSync('ec', {
                namedCurve: 'sect239k1'
            })
            this.private_key = privateKey;
            this.public_key = Wallet._public_key_to_hex(publicKey);
            fs.writeFileSync(KEY_FILE, this.private_key.export({
                type: PRIVATE_KEY_TYPE,
                format: KEY_FORMAT
            }).toString());
            fs.chmodSync(KEY_FILE, 0o600);
        }
        console.log(`Wallet initialized: ${this.public_key}`);
    }

    private static _public_key_to_hex(key: crypto.KeyObject) {
        return Buffer.from(key.export({
            type: PUBLIC_KEY_TYPE,
            format: KEY_FORMAT
        })).toString('base64');
    }

    private static _hex_to_public_key(key: string): crypto.KeyObject {
        return crypto.createPublicKey({
            key,
            type: PUBLIC_KEY_TYPE,
            format: KEY_FORMAT,
            encoding: "base64"
        });
    }

    private _sign(data: string): string {
        return crypto.createSign('SHA256').update(data).sign(this.private_key, 'hex');
    }

    private static _verify(data: string, signature: string, public_key: string): boolean {
        return crypto.createVerify('SHA256').update(data).verify(Wallet._hex_to_public_key(public_key), signature, 'hex');
    }

    new_coin_base_transaction(amount: number): Transaction {
        const id = crypto.randomUUID();
        return {
            id,
            inputs: [],
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

        const id = crypto.randomUUID();
        const outputs = [
            {
                address: recipient,
                amount
            }
        ];

        const inputs = tx_inputs.map(({ txid, index, amount }) => {return {
            txid,
            output_index: index,
            signature: this._sign(`${JSON.stringify(outputs)}${txid}${index}`),
        }});

        return [{
            id,
            inputs,
            outputs
        }, null];
    }
}
