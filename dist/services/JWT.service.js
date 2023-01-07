"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JWTService {
    constructor() {
        // maxAge = 3 * 24 * 60 * 60; // 3 days
        this.generateToken = (payload, JWT_SECRET, expiresIn = 1 * 24 * 60 * 60) => {
            return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn });
        };
        this.verifyToken = (payload, JWT_SECRET) => {
            try {
                //decodes token id
                const decoded = jsonwebtoken_1.default.verify(payload, JWT_SECRET);
                return decoded;
            }
            catch (error) {
                throw new Error("Forbidden");
            }
        };
    }
}
exports.default = JWTService;
