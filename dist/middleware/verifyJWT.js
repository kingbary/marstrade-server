"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const JWT_service_1 = __importDefault(require("../services/JWT.service"));
const jwtService = new JWT_service_1.default();
const verifyJWT = (0, express_async_handler_1.default)((req, res, next) => {
    const authHeader = (req.headers.authorization || req.headers.Authorization);
    if (!authHeader) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (!authHeader.startsWith('Bearer ')) {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwtService.verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
    // @ts-ignore
    req.user = decoded;
    next();
});
exports.default = verifyJWT;
