import { Schema, model } from "mongoose"
import { ITransaction } from "./types"

const transactionSchema = new Schema<ITransaction>(
    {
        investor: { type: Schema.Types.ObjectId, required: true },
        method: { type: String, required: true },
        receipt: { type: String, required: true },
        amount: { type: Number, required: true },
        walletAddress: { type: String },
        type: { type: String, required: true },
        completed: { type: Boolean, default: false },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
)

const Transaction = model<ITransaction>('Transaction', transactionSchema)
export default Transaction