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
exports.MongoService = void 0;
const dashboard_model_1 = __importDefault(require("../models/dashboard.model"));
const investment_model_1 = __importDefault(require("../models/investment.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const types_1 = require("../models/types");
const wallet_model_1 = __importDefault(require("../models/wallet.model"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
class MongoService {
    addKYC(userId, KYCData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findUserById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            try {
                user.country = KYCData.country;
                user.DOB = KYCData.DOB;
                user.IDType = KYCData.IDType;
                user.IDFront = KYCData.IDFront;
                user.IDBack = KYCData.IDBack;
                yield user.save();
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
    addReferral(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const dashboard = yield this.findDashboard(userId);
            if (!dashboard) {
                // throw new Error("Referrer not found")
                return;
            }
            dashboard.referrals += 1;
            yield dashboard.save();
            return;
        });
    }
    addReceipttoInv(transId, image) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield transaction_model_1.default.findByIdAndUpdate(transId, {
                receipt: image
            }).exec();
            if (!transaction)
                return { statusCode: 500, message: 'Transaction not found' };
            return { statusCode: 200, message: 'Deposit made' };
        });
    }
    addWallet(walletData) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = new wallet_model_1.default(walletData);
            try {
                yield wallet.save();
                return { statusCode: 200, message: 'Wallet created succssfully' };
            }
            catch (error) {
                return { statusCode: 500, message: 'Wallet not created' };
            }
        });
    }
    authenticate(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = options.email
                ? yield this.findUserByEmail(options.email)
                : options.userId
                    ? yield this.findUserById(options.userId)
                    : null;
            if (!user) {
                throw new Error("Incorrect details");
            }
            const pwd = user.get('password', null, { getters: false });
            return [user, pwd];
        });
    }
    confirmTransaction(transId) {
        return __awaiter(this, void 0, void 0, function* () {
            const trans = yield transaction_model_1.default.findById(transId).exec();
            if (!trans)
                return { statusCode: 400, message: 'Transaction not found' };
            trans.completed = true;
            yield trans.save();
            return { statusCode: 200, message: 'Transaction confirmed' };
        });
    }
    confirmWithdrawal(transId) {
        return __awaiter(this, void 0, void 0, function* () {
            const trans = yield transaction_model_1.default.findById(transId).exec();
            if (!trans)
                return { statusCode: 400, message: 'Request not found' };
            const dash = yield this.findDashboard(trans.investor);
            if (!dash)
                return { statusCode: 500, message: 'Dashboard not found' };
            try {
                trans.completed = true;
                yield trans.save();
                dash.hasInvestment = false;
                dash.investment = undefined;
                // Find index of "Withdrawal" issue and remove it
                const idx = dash.issues.indexOf('Withdrawal');
                if (idx !== -1) {
                    dash.issues = dash.issues.slice(0, idx).concat(dash.issues.slice(idx + 1));
                }
                yield dash.save();
            }
            catch ({ message }) {
                return { statusCode: 500, message: message };
            }
            return { statusCode: 200, message: 'Transaction confirmed' };
        });
    }
    createInvestment(investmentDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const dashB = yield this.findDashboard(investmentDetails.investor);
            if (!dashB) {
                throw new Error('Dashboard not found');
            }
            const trans = new transaction_model_1.default({
                investor: investmentDetails.investor,
                amount: investmentDetails.investmentAmount,
                method: investmentDetails.method,
                receipt: investmentDetails.receipt,
                type: 'DEPOSIT',
            });
            yield trans.save();
            const inv = new investment_model_1.default({
                investor: investmentDetails.investor,
                transaction: trans._id,
                investmentPlan: investmentDetails.investmentPlan,
                investmentPackage: investmentDetails.investmentPackage,
                investmentAmount: investmentDetails.investmentAmount,
            });
            yield inv.save();
            dashB.investment = inv._id;
            dashB.hasInvestment = true;
            yield dashB.save();
            return [inv, trans];
        });
    }
    createUser(userDetails, origin) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = new user_model_1.default(userDetails);
            yield user.save();
            const dashboard = new dashboard_model_1.default({
                owner: user._id,
            });
            dashboard.referralLink = `${origin}/signup/${dashboard._id}`,
                yield dashboard.save();
            return user;
        });
    }
    deleteUser(userId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const inv = yield investment_model_1.default.findOneAndDelete({ investor: userId }).exec();
            const dash = yield dashboard_model_1.default.findOneAndDelete({ owner: userId }).exec();
            const user = yield user_model_1.default.findOneAndDelete({ _id: userId }).exec();
            return {
                message: `User ${(_a = user === null || user === void 0 ? void 0 : user.id) !== null && _a !== void 0 ? _a : ''} deleted successfully`,
                statusCode: 200,
            };
        });
    }
    deleteWallet(walletId) {
        return __awaiter(this, void 0, void 0, function* () {
            const dashB = yield wallet_model_1.default.findByIdAndDelete(walletId).exec();
            return { statusCode: 200, message: 'Deleted successfully' };
        });
    }
    findDashboard(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const dashB = yield dashboard_model_1.default.findOne({ owner: userId }).exec();
            return dashB;
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findOne({ email }).exec();
            return user;
        });
    }
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findById(id).exec();
            return user;
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield user_model_1.default.find().lean();
            // get populated dash data
            return users;
        });
    }
    getAdminMail() {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = yield user_model_1.default.findOne({ role: 'ADMIN' }).select('email').exec();
            return email;
        });
    }
    getAllDashboards() {
        return __awaiter(this, void 0, void 0, function* () {
            const dashboards = yield dashboard_model_1.default.find();
            const populatedDashboards = yield Promise.all(dashboards.map((dashboard) => __awaiter(this, void 0, void 0, function* () {
                yield dashboard.populate('owner btc eth usdt');
                if (dashboard.hasInvestment) {
                    yield dashboard.populate('investment');
                    if (dashboard.investment) {
                        dashboard.investment = dashboard.investment;
                        const trans = yield transaction_model_1.default.findById(dashboard.investment.transaction);
                        dashboard.investment.transaction = trans ? trans : dashboard.investment.transaction;
                    }
                }
                return dashboard;
            })));
            return populatedDashboards;
        });
    }
    getAllWallets() {
        return __awaiter(this, void 0, void 0, function* () {
            const wallets = yield wallet_model_1.default.find().lean();
            return wallets;
        });
    }
    getDashboard(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const dashboard = yield this.findDashboard(userId);
            if (!dashboard) {
                throw new Error("Dashboard not found");
            }
            yield dashboard.populate('owner btc eth usdt');
            if (dashboard.hasInvestment) {
                yield dashboard.populate('investment');
                if (dashboard.investment) {
                    dashboard.investment = dashboard.investment;
                    const trans = yield transaction_model_1.default.findById(dashboard.investment.transaction);
                    dashboard.investment.transaction = trans ? trans : dashboard.investment.transaction;
                }
            }
            return dashboard;
        });
    }
    getTransactionHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = yield transaction_model_1.default.find({ investor: userId }).exec();
            return transactions;
        });
    }
    getWithdrawalData(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield transaction_model_1.default.findOne({
                investor: userId,
                type: 'WITHDRAWAL',
                completed: false
            }).exec();
            return transaction;
        });
    }
    redeemReferral(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const dashboard = yield this.findDashboard(userId);
            if (!dashboard)
                return { statusCode: 400, message: 'Dashboard was not found' };
            try {
                dashboard.withdrawable_fund += dashboard.referralBonus;
                dashboard.referralBonus = 0;
                yield dashboard.save();
            }
            catch ({ message }) {
                return { statusCode: 500, message: message };
            }
            return { statusCode: 200, message: 'Referral bonus redeemed seccessfully' };
        });
    }
    requestwithdraw(transDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const dashboard = yield this.findDashboard(transDetails.investor);
            if (!dashboard)
                return { statusCode: 400, message: 'Dashboard was not found' };
            try {
                const trans = new transaction_model_1.default({
                    investor: transDetails.investor,
                    method: transDetails.method,
                    amount: transDetails.amount,
                    walletAddress: transDetails.walletAddress,
                    receipt: 'TBC',
                    type: 'WITHDRAWAL',
                    completed: false
                });
                yield trans.save();
                dashboard.issues.push('Withdrawal');
                dashboard.withdrawable_fund = 0;
                yield dashboard.save();
            }
            catch ({ message }) {
                return { statusCode: 500, message: message };
            }
            return { statusCode: 200, message: 'Withdrawal requested seccessfully' };
        });
    }
    terminateInvestment(invId) {
        return __awaiter(this, void 0, void 0, function* () {
            const inv = yield investment_model_1.default.findById(invId);
            if (!inv)
                return { statusCode: 400, message: 'Investment was not found' };
            const dashboard = yield this.findDashboard(inv.investor);
            if (!dashboard)
                return { statusCode: 400, message: 'Dashboard was not found' };
            try {
                inv.status = types_1.STATUS.COMPLETED;
                yield inv.save();
                dashboard.withdrawable_fund = inv.investmentAmount + inv.ROI;
                yield dashboard.save();
            }
            catch ({ message }) {
                return { statusCode: 500, message: message };
            }
            return { statusCode: 200, message: 'Investment has been closed' };
        });
    }
    updateAvatar(userId, avatar) {
        return __awaiter(this, void 0, void 0, function* () {
            const dashboard = yield this.findDashboard(userId);
            if (!dashboard)
                return { statusCode: 500, message: 'Dashboard not found' };
            dashboard.avatar = avatar;
            yield dashboard.save();
            return { statusCode: 200, message: 'Avatar updated' };
        });
    }
    updatePassword(userId, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findByIdAndUpdate(userId, { password }, { new: true }).exec();
        });
    }
    updateWallet(userId, walletId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const dash = yield this.findDashboard(userId);
            if (!dash)
                return { statusCode: 500, message: 'Dashboard not found' };
            dash[type] = walletId;
            yield dash.save();
            return { statusCode: 200, message: 'Wallet updated' };
        });
    }
    verifyDeposit(invId) {
        return __awaiter(this, void 0, void 0, function* () {
            const inv = yield investment_model_1.default.findById(invId).exec();
            if (!inv)
                return { statusCode: 400, message: 'Investment not found' };
            inv.status = types_1.STATUS.ACTIVE;
            yield inv.save();
            yield inv.populate('transaction');
            const { statusCode, message } = yield this.confirmTransaction(inv.transaction);
            if (statusCode !== 200)
                return { statusCode, message };
            const { email, firstName } = yield this.findUserById(inv.investor);
            return { inv, email, firstName };
        });
    }
    verifyUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findUserById(userId);
            if (!user)
                throw new Error('User not found');
            try {
                user.verified = true;
                yield user.save();
                return { statusCode: 200, message: 'User verified succssfully' };
            }
            catch (error) {
                return { statusCode: 500, message: 'User not verified' };
            }
        });
    }
}
exports.MongoService = MongoService;
