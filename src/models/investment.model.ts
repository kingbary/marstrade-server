import { Schema, model } from "mongoose"
import { IInvestment, STATUS } from "./types"

const packageConverter: { [key: string]: number } = {
    'AGRICULTURE': 5,
    'FOREX': 2.5,
    'STOCK': 2.5,
    'INHERITANCE': 7.5,
    'ENERGY': 7.5,
    'CRYPTOCURRENCY': 2.5,
    'METAL': 7.5,
    'REAL_ESTATE': 5
}


const investmentSchema = new Schema<IInvestment>(
    {
        investor: { type: Schema.Types.ObjectId, required: true },
        investmentPlan: { type: String, required: true },
        investmentAmount: { type: Number, required: true },
        investmentPackage: { type: String, required: true },
        status: { type: String, default: STATUS.PENDING },
        isActive: { type: Boolean, default: true }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
)

investmentSchema.virtual('ROI')
    .get(function () {
        const timems = this.createdAt ? Date.now() - new Date(this.createdAt).getTime() : 0
        const daysPassed = Math.round(timems / (1000 * 60 * 60 * 24))
        const interest = this.investmentAmount * daysPassed * packageConverter[this.investmentPackage] * 0.01
        return interest
        // return this.investmentAmount * (1 + daysPassed * this.investmentPackage * 0.01)
    })

const Investment = model<IInvestment>('Investment', investmentSchema)
export default Investment