import { Schema, model } from 'mongoose'
import { IWallet } from './types'

const walletSchema = new Schema<IWallet>({
    type: String,
    address: String,
    barcode: String
})

const Wallet = model<IWallet>('Wallet', walletSchema)
export default Wallet