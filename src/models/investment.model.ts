import { Schema, model, Types } from "mongoose"

export interface IInvestment {
    investor: Types.ObjectId;
    investmentPlan: string;
    investmentPackage: number;
    investmentAmount: number;
    ROI: number;
    createdAt: Date;
}

export enum plans {
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM',
    VIP = 'VIP'
}
export type invPackage = 'AGRICULTURE' | 'FOREX' | 'STOCK' | 'INHERITANCE' | 'ENERGY' | 'CRYPTOCURRENCY' | 'METAL'
export type BASIC = 'AGRICULTURE' | 'FOREX'
export type PREMIUM = 'STOCK' | 'INHERITANCE'
export type VIP = 'ENERGY' | 'CRYPTOCURRENCY' | 'METAL'

const investmentSchema = new Schema<IInvestment>(
    {
        investor: { type: Schema.Types.ObjectId, required: true },
        investmentPlan: { type: String, required: true },
        investmentAmount: { type: Number, required: true },
        investmentPackage: { type: Number, required: true },
    },
    {
        toJSON: {
            virtuals: true,
        },
        timestamps: true
    }
)

investmentSchema.virtual('ROI')
    .get(function () {
        const timems = Date.now() - new Date(this.createdAt).getTime()
        const daysPassed = Math.round(timems / (1000 * 60 * 60 * 24))
        // const interest = this.investmentAmount * daysPassed * this.investmentPackage * 0.01
        // return this.investmentAmount + interest
        return this.investmentAmount * (1 + daysPassed * this.investmentPackage * 0.01)
    })

const Investment = model<IInvestment>('Investment', investmentSchema)
export default Investment