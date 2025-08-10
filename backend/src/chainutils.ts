import crypto, {KeyObject} from 'crypto';
import fs from "fs";
const PRIVATE_KEY_FORMAT = "pem";
const PRIVATE_KEY_TYPE = "sec1";

const PUBLIC_KEY_FORMAT = "der";
const PUBLIC_KEY_TYPE = "spki";

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
            format: PRIVATE_KEY_FORMAT,
            type: PRIVATE_KEY_TYPE
        });
    }

    static private_key_to_file(private_key: KeyObject, file_path: string) {
        fs.writeFileSync(file_path, private_key.export({
            type: PRIVATE_KEY_TYPE,
            format: PRIVATE_KEY_FORMAT
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
        const exported = public_key.export({
            type: PUBLIC_KEY_TYPE,
            format: PUBLIC_KEY_FORMAT
        });
        return exported.toString('base64');
    }

    static hex_to_public_key(key_hex: string): KeyObject {
        return crypto.createPublicKey({
            key: key_hex,
            type: PUBLIC_KEY_TYPE,
            format: PUBLIC_KEY_FORMAT,
            encoding: "base64"
        });
    }
}
