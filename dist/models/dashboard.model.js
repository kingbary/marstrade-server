"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const dashboardSchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    avatar: { type: String },
    referralLink: { type: String, required: true },
    hasInvestment: { type: Boolean, default: false },
    referrals: { type: Number, default: 0 },
    referralBonus: { type: Number, default: 0 },
    investment: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Investment' },
    withdrawable_fund: { type: Number, default: 0 },
    issues: [{ type: String }],
    btc: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Wallet', default: '638bc2535dc2ef9f1cecb13c' },
    eth: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Wallet', default: '6386919fcb57f3ea677997ec' },
    usdt: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Wallet', default: '638bc2b85dc2ef9f1cecb154' },
}, {
    toJSON: { virtuals: true },
    // toObject: { virtuals: true },
});
// dashboardSchema.virtual('investment', {
//     ref: 'Investment',
//     localField: 'owner',
//     foreignField: 'investor',
// });
const Dashboard = (0, mongoose_1.model)('Dashboard', dashboardSchema);
exports.default = Dashboard;
