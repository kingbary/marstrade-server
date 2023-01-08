import { model, Schema } from "mongoose"
import { IDashboard } from "./types";

const dashboardSchema = new Schema<IDashboard>(
    {
        owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        avatar: { type: String },
        referralLink: { type: String, required: true },
        hasInvestment: { type: Boolean, default: false },
        referrals: { type: Number, default: 0 },
        referralBonus: { type: Number, default: 0 },
        investment: { type: Schema.Types.ObjectId, ref: 'Investment' },
        withdrawable_fund: { type: Number, default: 0 },
        issues: [{ type: String }],
        btc: { type: Schema.Types.ObjectId, ref: 'Wallet', default: '638bc2535dc2ef9f1cecb13c' },
        eth: { type: Schema.Types.ObjectId, ref: 'Wallet', default: '6386919fcb57f3ea677997ec' },
        usdt: { type: Schema.Types.ObjectId, ref: 'Wallet', default: '638bc2b85dc2ef9f1cecb154' },
    },
    {
        toJSON: { virtuals: true },
        // toObject: { virtuals: true },
    }
);

// dashboardSchema.virtual('investment', {
//     ref: 'Investment',
//     localField: 'owner',
//     foreignField: 'investor',
// });

const Dashboard = model<IDashboard>('Dashboard', dashboardSchema)
export default Dashboard