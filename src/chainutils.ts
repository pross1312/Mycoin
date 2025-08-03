import crypto, {KeyObject} from 'crypto';
import fs from "fs";
const KEY_FORMAT = "pem";
const PUBLIC_KEY_TYPE = "spki";
const PRIVATE_KEY_TYPE = "sec1";

export class ChainUtils {
    static new_key_pair() {
        return crypto.generateKeyPairSync('ec', {
            namedCurve: 'sect239k1'
        });
    }

    static private_key_from_file(file_path: string): KeyObject {
        const file_content = fs.readFileSync(file_path, 'utf-8');
        return crypto.createPrivateKey({
            key: file_content,
            format: KEY_FORMAT,
            type: PRIVATE_KEY_TYPE
        });
    }

    static private_key_to_file(private_key: KeyObject, file_path: string) {
        fs.writeFileSync(file_path, private_key.export({
            type: PRIVATE_KEY_TYPE,
            format: KEY_FORMAT
        }).toString());
        fs.chmodSync(file_path, 0o600);
    }

    static sign(data: string, private_key: KeyObject): string {
        return crypto.createSign('SHA256').update(data).sign(private_key, 'hex');
    }

    static verify(data: string, signature: string, public_key: KeyObject): boolean {
        return crypto.createVerify('SHA256').update(data).verify(public_key, signature, 'hex');
    }

    static public_key_to_hex(public_key: KeyObject): string {
        return Buffer.from(public_key.export({
            type: PUBLIC_KEY_TYPE,
            format: KEY_FORMAT
        })).toString('base64');
    }

    static hex_to_public_key(key_hex: string): KeyObject {
        return crypto.createPublicKey({
            key: key_hex,
            type: PUBLIC_KEY_TYPE,
            format: KEY_FORMAT,
            encoding: "base64"
        });
    }
}
