import { model, Schema } from "mongoose"
import { IDashboard } from "./types";

const dashboardSchema = new Schema<IDashboard>(
    {
        owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        referralLink: { type: String, required: true },
        hasInvestment: { type: Boolean, default: false },
        referrals: { type: Number, default: 0 },
        btcWallet: {type: Schema.Types.ObjectId, ref: 'Wallet', default: '638691e6cb57f3ea677997ef'},
        ethWallet: {type: Schema.Types.ObjectId, ref: 'Wallet', default: '6386919fcb57f3ea677997ec'},
        usdtWallet: {type: Schema.Types.ObjectId, ref: 'Wallet', default: '6386920ccb57f3ea677997f1'},
    },
    {
        toJSON: { virtuals: true },
        // toObject: { virtuals: true },
    }
);

dashboardSchema.virtual('investment', {
    ref: 'Investment',
    localField: 'owner',
    foreignField: 'investor',
});

const Dashboard = model<IDashboard>('Dashboard', dashboardSchema)
export default Dashboard