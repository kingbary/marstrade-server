"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const walletSchema = new mongoose_1.Schema({
    type: String,
    address: String,
    barcode: String
});
const Wallet = (0, mongoose_1.model)('Wallet', walletSchema);
exports.default = Wallet;
