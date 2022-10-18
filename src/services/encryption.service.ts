import * as bcrypt from "bcrypt"

export interface IEncryption {
    encrypt(value: string): Promise<string>;
    compare(val1: string, val2: string): Promise<boolean>;
}

export class Encryption implements IEncryption {
    async encrypt(plainTXt: string) {
        const saltRounds = 10
        const hash = await bcrypt.hash(plainTXt, saltRounds)
        return hash
    }

    async compare(plainTXt: string, hash: string) {
        const result = await bcrypt.compare(plainTXt, hash)
        return result
    }
}