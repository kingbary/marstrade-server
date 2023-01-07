import { Schema, model } from "mongoose"
import { IInvestment, STATUS } from "./types"

const investmentSchema = new Schema<IInvestment>(
    {
        investor: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        transaction: {type: Schema.Types.ObjectId, required: true, ref: 'Transaction'},
        investmentPlan: { type: String, required: true },
        investmentAmount: { type: Number, required: true },
        investmentPackage: { type: String, required: true },
        status: { type: String, default: STATUS.PENDING },
        isActive: { type: Boolean, default: true },
        ROI: { type: Number, default: 0 }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
)

// investmentSchema.virtual('ROI')
//     .get(function () {
//         const timems = this.createdAt ? Date.now() - new Date(this.createdAt).getTime() : 0
//         const daysPassed = Math.round(timems / (1000 * 60 * 60 * 24))
//         const interest = this.investmentAmount * daysPassed * packageConverter[this.investmentPackage] * 0.01
//         return interest
//     })

const Investment = model<IInvestment>('Investment', investmentSchema)
export default Investment