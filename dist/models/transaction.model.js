"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const transactionSchema = new mongoose_1.Schema({
    investor: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    method: { type: String, required: true },
    receipt: { type: String, required: true },
    amount: { type: Number, required: true },
    walletAddress: { type: String },
    type: { type: String, required: true },
    completed: { type: Boolean, default: false },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});
const Transaction = (0, mongoose_1.model)('Transaction', transactionSchema);
exports.default = Transaction;
