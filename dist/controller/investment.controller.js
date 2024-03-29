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
exports.InvestmentController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
class InvestmentController {
    constructor(persistence, objService, mailService) {
        this.confirmWithdrawal = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { transId, gasId } = req.body;
            const { statusCode: gasStCode, message: gasMsg } = yield this.persistence.confirmTransaction(gasId);
            if (gasStCode !== 200) {
                res.status(gasStCode).json({ message: gasMsg });
                return;
            }
            const { statusCode, message } = yield this.persistence.confirmWithdrawal(transId);
            res.status(statusCode).json({ message });
        }));
        this.getTransactionHistory = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const transactions = yield this.persistence.getTransactionHistory(userId);
            res.json(transactions);
        }));
        this.getWithdrawalData = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const transaction = yield this.persistence.getWithdrawalData(userId);
            res.json(transaction);
        }));
        this.makeInvestment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { userId, amount, invPackage, plan, method } = req.body;
            const fromAdmin = req.body.fromAdmin && JSON.parse(req.body.fromAdmin);
            const receiptPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
            if (!receiptPath && !fromAdmin) {
                res.status(400).json({ message: "Incomplete details." });
                return;
            }
            const investmentDetails = {
                investor: userId,
                investmentAmount: +amount,
                investmentPackage: invPackage,
                method: method,
                investmentPlan: plan,
                receipt: "pending",
            };
            const [investment, transaction] = yield this.persistence.createInvestment(investmentDetails);
            if (!fromAdmin && receiptPath) {
                const { isSuccess, imageURL } = yield this.objService.uploadImage(receiptPath, transaction.id, "receipts");
                if (!isSuccess || !imageURL) {
                    res
                        .status(500)
                        .json({ message: "Could not uplaod receipt. Try again later." });
                    return;
                }
                const { statusCode, message } = yield this.persistence.addReceipttoInv(transaction.id, imageURL);
                if (statusCode !== 200) {
                    res.status(statusCode).json({ message });
                    return;
                }
            }
            // const adminMail = await this.persistence.getAdminMail();
            // await this.mailService.sendDepositNotifyMail({
            //   email: adminMail,
            //   firstName: "Admin",
            //   amount: `${investmentDetails.investmentAmount}`,
            //   method: method,
            //   invPlan: investmentDetails.investmentPlan,
            //   invPackage: investmentDetails.investmentPackage,
            //   ROI: `${investment.ROI}`,
            // });
            res.json({ message: "Deposit made" });
        }));
        this.gasPayment = (res, userId, amount, method, receiptPath) => __awaiter(this, void 0, void 0, function* () {
            const transaction = yield this.persistence.createTransaction({
                investor: userId,
                investmentAmount: amount,
                method,
                receipt: "pending",
            });
            const { isSuccess, imageURL } = yield this.objService.uploadImage(receiptPath, transaction.id, "receipts");
            if (!isSuccess || !imageURL) {
                res
                    .status(500)
                    .json({ message: "Could not uplaod receipt. Try again later." });
                return;
            }
            const { statusCode, message } = yield this.persistence.addReceipttoInv(transaction.id, imageURL);
            if (statusCode !== 200) {
                res.status(statusCode).json({ message });
                return;
            }
            // const adminMail = await this.persistence.getAdminMail();
            // await this.mailService.sendDepositNotifyMail({
            //   email: adminMail,
            //   firstName: "Admin",
            //   amount: `${amount}`,
            //   method,
            //   invPlan: "N/A",
            //   invPackage: "N/A",
            //   ROI: "N/A",
            // });
            return imageURL;
        });
        this.redeemReferral = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.body.userId;
            const { statusCode, message } = yield this.persistence.redeemReferral(userId);
            res.status(statusCode).json({ message });
        }));
        this.requestwithdraw = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const userId = req.body.userId;
            const method = req.body.method;
            const amount = req.body.amount;
            const address = req.body.address;
            const { gasAmount, gasMethod } = req.body;
            const receiptPath = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
            if (!receiptPath) {
                res.status(400).json({ message: "Incomplete details." });
                return;
            }
            const imageURL = (yield this.gasPayment(res, userId, +gasAmount, gasMethod, receiptPath));
            const transDetails = {
                investor: userId,
                method: method,
                amount: +amount,
                walletAddress: address,
                receipt: imageURL,
            };
            const { statusCode, message } = yield this.persistence.requestwithdraw(transDetails);
            res.status(statusCode).json({ message });
        }));
        this.terminateInvestment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const invId = req.body.invId;
            const { statusCode, message } = yield this.persistence.terminateInvestment(invId);
            res.status(statusCode).json({ message });
        }));
        this.verifyDeposit = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const invId = req.body.invId;
            const response = yield this.persistence.verifyDeposit(invId);
            if ("email" in response) {
                // const trans = <ITransaction>response.inv.transaction;
                // await this.mailService.sendDepositConfirmMail({
                //   email: response.email,
                //   firstName: response.firstName,
                //   amount: `${response.inv.investmentAmount}`,
                //   invPackage: response.inv.investmentPackage,
                //   invPlan: response.inv.investmentPlan,
                //   method: trans.method,
                //   ROI: `${response.inv.ROI}`,
                // });
                res.json({ message: "Deposit verified" });
                return;
            }
            res.status(response.statusCode).json({ message: response.message });
        }));
        this.persistence = persistence;
        this.objService = objService;
        this.mailService = mailService;
    }
}
exports.InvestmentController = InvestmentController;
