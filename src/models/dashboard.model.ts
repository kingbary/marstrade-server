import { model, Schema, Types } from "mongoose"

export interface IDashboard {
    owner: Types.ObjectId;
    referralLink: string;
    referrals: number;
    investment?: {
        investmentPlan: string;
        investmentPackage: string;
        investmentAmount: number;
        ROI: number;
    }
}

const dashboardSchema = new Schema<IDashboard>({
    owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    referralLink: { type: String, required: true },
    referrals: Number,
});

dashboardSchema.virtual('investment', {
    ref: 'Investment',
    localField: 'owner',
    foreignField: 'investor',
});

const Dashboard = model<IDashboard>('Dashboard', dashboardSchema)
export default Dashboard