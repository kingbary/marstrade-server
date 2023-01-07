"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
class WalletController {
    constructor(persistence, objService) {
        this.addWallet = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const localPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
            const { type, address } = req.body;
            const { message, imageURL, statusCode, isSuccess } = yield this.objService.uploadImage(localPath, address, 'wallets');
            if (!isSuccess || !imageURL) {
                res.status(statusCode).json({ message });
                return;
            }
            const { statusCode: dbStatusCode, message: dbMessage } = yield this.persistence.addWallet({ type, address, barcode: imageURL });
            res.status(dbStatusCode).json({ message: dbMessage });
        }));
        this.deleteWallet = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { walletId } = req.body;
            const { message, statusCode } = yield this.persistence.deleteWallet(walletId);
            res.status(statusCode).json({ message });
        }));
        this.getAll = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const wallets = yield this.persistence.getAllWallets();
            res.json(wallets);
        }));
        this.updateForUser = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId, walletId, type } = req.body;
            const { message, statusCode } = yield this.persistence.updateWallet(userId, walletId, type);
            res.status(statusCode).json({ message });
        }));
        this.persistence = persistence;
        this.objService = objService;
    }
}
exports.WalletController = WalletController;
