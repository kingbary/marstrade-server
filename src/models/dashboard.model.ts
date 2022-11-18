import { model, Schema } from "mongoose"
import { IDashboard } from "./types";

const dashboardSchema = new Schema<IDashboard>(
    {
        owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        referralLink: { type: String, required: true },
        hasInvestment: { type: Boolean, default: false },
        referrals: { type: Number, default: 0 },
        avatar: String,
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