"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: {
        type: String,
        get: () => undefined,
        required: true
    },
    verified: { type: Boolean, default: false },
    role: { type: String, default: "USER" },
    country: String,
    DOB: String,
    IDType: String,
    IDFront: String,
    IDBack: String,
}, {
    toJSON: { getters: true },
    toObject: { getters: true },
    timestamps: true
});
const User = (0, mongoose_1.model)('User', userSchema);
exports.default = User;
