"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const types_1 = require("./types");
const investmentSchema = new mongoose_1.Schema({
    investor: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    transaction: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Transaction' },
    investmentPlan: { type: String, required: true },
    investmentAmount: { type: Number, required: true },
    investmentPackage: { type: String, required: true },
    status: { type: String, default: types_1.STATUS.PENDING },
    isActive: { type: Boolean, default: true },
    ROI: { type: Number, default: 0 }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});
// investmentSchema.virtual('ROI')
//     .get(function () {
//         const timems = this.createdAt ? Date.now() - new Date(this.createdAt).getTime() : 0
//         const daysPassed = Math.round(timems / (1000 * 60 * 60 * 24))
//         const interest = this.investmentAmount * daysPassed * packageConverter[this.investmentPackage] * 0.01
//         return interest
//     })
const Investment = (0, mongoose_1.model)('Investment', investmentSchema);
exports.default = Investment;
