import Dashboard from "../models/dashboard.model";
import Investment from "../models/investment.model";
import User from "../models/user.model";
import { ID, IDashboard, IDBResponse, IInvestment, IInvestmentReq, IKYCData, ITransaction, IUser, IWallet, STATUS, TransDetails, WALLET } from "../models/types";
import Wallet from "../models/wallet.model";
import Transaction from "../models/transaction.model";

interface IAuthOptions {
    email?: string;
    userId?: ID;
}


export const packageConverter: { [key: string]: number } = {
    'AGRICULTURE': 5,
    'FOREX': 2.5,
    'STOCK': 2.5,
    'INHERITANCE': 7.5,
    'ENERGY': 7.5,
    'CRYPTOCURRENCY': 2.5,
    'METAL': 7.5,
    'REAL_ESTATE': 5
}

export interface IMongoService {
    addKYC(userId: ID, KYCData: IKYCData): Promise<boolean>;
    addReferral(id: string): Promise<void>;
    addReceipttoInv(transid: ID, image: string): Promise<IDBResponse>;
    addWallet(walletData: IWallet): Promise<IDBResponse>;
    authenticate(options: IAuthOptions): Promise<[IUser, string]>;
    confirmTransaction(transId: ID): Promise<IDBResponse>;
    confirmWithdrawal(transId: ID): Promise<IDBResponse>;
    createInvestment(investmentDetails: IInvestmentReq): Promise<[IInvestment, ITransaction]>;
    createUser(userDetails: IUser, origin: string): Promise<IUser>;
    deleteUser(userId: ID): Promise<IDBResponse>;
    deleteWallet(walletId: ID): Promise<IDBResponse>;
    findDashboard(userId: string): Promise<IDashboard | null>;
    findUserByEmail(email: string): Promise<IUser | null>;
    findUserById(id: string): Promise<IUser | null>;
    getAdminMail(): Promise<string>;
    getAllDashboards(): Promise<IDashboard[]>;
    getAllUsers(): Promise<IUser[]>;
    getAllWallets(): Promise<IWallet[]>;
    getDashboard(userId: string): Promise<IDashboard>;
    getTransactionHistory(userId: ID): Promise<ITransaction[]>;
    getWithdrawalData(userId: ID): Promise<ITransaction | null>;
    redeemReferral(userId: ID): Promise<IDBResponse>;
    requestwithdraw(transDetails: TransDetails): Promise<IDBResponse>;
    terminateInvestment(invId: ID): Promise<IDBResponse>;
    updateAvatar(userId: ID, avatar: string): Promise<IDBResponse>;
    updatePassword(userId: ID, password: string): Promise<void>;
    updateWallet(userId: ID, walletId: ID, type: string): Promise<IDBResponse>;
    updateProfit(invId: ID, amount: number): Promise<IDBResponse>;
    verifyDeposit(invId: ID): Promise<IDBResponse | { firstName: string, email: string, inv: IInvestment }>;
    verifyUser(userId: ID): Promise<IDBResponse>;
}

export class MongoService implements IMongoService {
    async addKYC(userId: ID, KYCData: IKYCData) {
        const user = await this.findUserById(userId)

        if (!user) {
            throw new Error("User not found")
        }

        try {
            user.country = KYCData.country
            user.DOB = KYCData.DOB
            user.IDType = KYCData.IDType
            user.IDFront = KYCData.IDFront
            user.IDBack = KYCData.IDBack
            await user.save()

            return true
        } catch (error) {
            return false
        }
    }

    async addReferral(userId: ID) {
        const dashboard = await this.findDashboard(userId)
        if (!dashboard) {
            // throw new Error("Referrer not found")
            return
        }
        dashboard.referrals += 1
        await dashboard.save()
        return
    }

    async addReceipttoInv(transId: ID, image: string) {
        const transaction = await Transaction.findByIdAndUpdate(transId, {
            receipt: image
        }).exec()

        if (!transaction) return { statusCode: 500, message: 'Transaction not found' }
        return { statusCode: 200, message: 'Deposit made' }
    }

    async addWallet(walletData: IWallet) {
        const wallet = new Wallet(walletData)
        try {
            await wallet.save()
            return { statusCode: 200, message: 'Wallet created succssfully' }
        } catch (error) {
            return { statusCode: 500, message: 'Wallet not created' }
        }
    }

    async authenticate(options: IAuthOptions): Promise<[IUser, string]> {
        const user = options.email
            ? await this.findUserByEmail(options.email)
            : options.userId
                ? await this.findUserById(options.userId)
                : null

        if (!user) {
            throw new Error("Incorrect details")
        }
        const pwd = <string>user.get('password', null, { getters: false })
        return [user, pwd]
    }

    async confirmTransaction(transId: ID) {
        const trans = await Transaction.findById(transId).exec()
        if (!trans) return { statusCode: 400, message: 'Transaction not found' }
        trans.completed = true
        await trans.save()

        return { statusCode: 200, message: 'Transaction confirmed' }
    }

    async confirmWithdrawal(transId: ID) {
        const trans = await Transaction.findById(transId).exec()
        if (!trans) return { statusCode: 400, message: 'Request not found' }

        const dash = await this.findDashboard(trans.investor)
        if (!dash) return { statusCode: 500, message: 'Dashboard not found' }

        try {
            trans.completed = true
            await trans.save()

            dash.hasInvestment = false
            dash.investment = undefined
            // Find index of "Withdrawal" issue and remove it
            const idx = dash.issues.indexOf('Withdrawal')
            if (idx !== -1) {
                dash.issues = dash.issues.slice(0, idx).concat(dash.issues.slice(idx + 1))
            }
            await dash.save()
        } catch ({ message }) {
            return { statusCode: 500, message: <string>message }
        }

        return { statusCode: 200, message: 'Transaction confirmed' }
    }

    async createInvestment(investmentDetails: IInvestmentReq): Promise<[IInvestment, ITransaction]> {
        const dashB = await this.findDashboard(investmentDetails.investor)
        if (!dashB) {
            throw new Error('Dashboard not found')
        }

        const trans = new Transaction({
            investor: investmentDetails.investor,
            amount: investmentDetails.investmentAmount,
            method: investmentDetails.method,
            receipt: investmentDetails.receipt,
            type: 'DEPOSIT',
        })
        await trans.save()

        const inv = new Investment({
            investor: investmentDetails.investor,
            transaction: trans._id,
            investmentPlan: investmentDetails.investmentPlan,
            investmentPackage: investmentDetails.investmentPackage,
            investmentAmount: investmentDetails.investmentAmount,
        })
        await inv.save()

        dashB.investment = inv._id
        dashB.hasInvestment = true
        await dashB.save()
        inv.ROI = packageConverter[investmentDetails.investmentPackage]

        return [inv, trans]
    }

    async createUser(userDetails: IUser, origin: string) {
        const user = new User<IUser>(userDetails)
        await user.save()

        const dashboard = new Dashboard({
            owner: user._id,
        })
        dashboard.referralLink = `${origin}/signup/${dashboard._id}`,
            await dashboard.save()

        return user
    }

    async deleteUser(userId: ID) {
        const inv = await Investment.findOneAndDelete({ investor: userId }).exec()
        const dash = await Dashboard.findOneAndDelete({ owner: userId }).exec()
        const user = await User.findOneAndDelete({ _id: userId }).exec()

        return {
            message: `User ${user?.id ?? ''} deleted successfully`,
            statusCode: 200,
        }
    }

    async deleteWallet(walletId: ID) {
        const dashB = await Wallet.findByIdAndDelete(walletId).exec()
        return { statusCode: 200, message: 'Deleted successfully' }
    }

    async findDashboard(userId: ID) {
        const dashB = await Dashboard.findOne({ owner: userId }).exec()
        return dashB
    }

    async findUserByEmail(email: string) {
        const user = await User.findOne({ email }).exec()
        return user
    }

    async findUserById(id: ID) {
        const user = await User.findById(id).exec()
        return user
    }

    async getAllUsers() {
        const users = await User.find().lean()
        // get populated dash data
        return users
    }

    async getAdminMail() {
        const { email } = <IUser>await User.findOne({ role: 'ADMIN' }).select('email').exec()
        return email
    }

    async getAllDashboards() {
        const dashboards = await Dashboard.find()
        const populatedDashboards = await Promise.all(dashboards.map(async (dashboard) => {
            await dashboard.populate('owner btc eth usdt')
            if (dashboard.hasInvestment) {
                await dashboard.populate('investment')
                if (dashboard.investment) {
                    dashboard.investment = dashboard.investment as IInvestment
                    const trans = await Transaction.findById(dashboard.investment.transaction)
                    dashboard.investment!.transaction = trans ? trans : dashboard.investment.transaction
                }
            }
            return dashboard
        }))
        return populatedDashboards
    }

    async getAllWallets() {
        const wallets = await Wallet.find().lean()
        return wallets
    }

    async getDashboard(userId: ID) {
        const dashboard = await this.findDashboard(userId)
        if (!dashboard) {
            throw new Error("Dashboard not found")
        }
        await dashboard.populate('owner btc eth usdt')
        if (dashboard.hasInvestment) {
            await dashboard.populate('investment')
            if (dashboard.investment) {
                dashboard.investment = dashboard.investment as IInvestment
                const trans = await Transaction.findById(dashboard.investment.transaction)
                dashboard.investment.transaction = trans ? trans : dashboard.investment.transaction
            }
        }
        return dashboard
    }

    async getTransactionHistory(userId: ID) {
        const transactions = await Transaction.find({ investor: userId }).exec()
        return transactions
    }

    async getWithdrawalData(userId: ID) {
        const transaction = await Transaction.findOne({
            investor: userId,
            type: 'WITHDRAWAL',
            completed: false
        }).exec()
        return transaction
    }

    async redeemReferral(userId: ID) {
        const dashboard = await this.findDashboard(userId)
        if (!dashboard) return { statusCode: 400, message: 'Dashboard was not found' }

        try {
            dashboard.withdrawable_fund += dashboard.referralBonus
            dashboard.referralBonus = 0
            await dashboard.save()
        } catch ({ message }) {
            return { statusCode: 500, message: <string>message }
        }

        return { statusCode: 200, message: 'Referral bonus redeemed seccessfully' }
    }

    async requestwithdraw(transDetails: TransDetails) {
        const dashboard = await this.findDashboard(transDetails.investor)
        if (!dashboard) return { statusCode: 400, message: 'Dashboard was not found' }

        try {
            const trans = new Transaction({
                investor: transDetails.investor,
                method: transDetails.method,
                amount: transDetails.amount,
                walletAddress: transDetails.walletAddress,
                receipt: 'TBC',
                type: 'WITHDRAWAL',
                completed: false
            })
            await trans.save()

            dashboard.issues.push('Withdrawal')
            dashboard.withdrawable_fund = 0
            await dashboard.save()
        } catch ({ message }) {
            return { statusCode: 500, message: <string>message }
        }

        return { statusCode: 200, message: 'Withdrawal requested seccessfully' }
    }

    async terminateInvestment(invId: ID) {
        const inv = await Investment.findById(invId)
        if (!inv) return { statusCode: 400, message: 'Investment was not found' }

        const dashboard = await this.findDashboard(inv.investor as ID)
        if (!dashboard) return { statusCode: 400, message: 'Dashboard was not found' }

        try {
            inv.status = STATUS.COMPLETED
            await inv.save()

            dashboard.withdrawable_fund = inv.investmentAmount + inv.ROI
            await dashboard.save()
        } catch ({ message }) {
            return { statusCode: 500, message: <string>message }
        }

        return { statusCode: 200, message: 'Investment has been closed' }
    }

    async updateAvatar(userId: ID, avatar: string) {
        const dashboard = await this.findDashboard(userId)

        if (!dashboard) return { statusCode: 500, message: 'Dashboard not found' }

        dashboard.avatar = avatar
        await dashboard.save()
        return { statusCode: 200, message: 'Avatar updated' }
    }

    async updatePassword(userId: ID, password: string) {
        const user = await User.findByIdAndUpdate(userId, { password }, { new: true }).exec()
    }

    async updateWallet(userId: ID, walletId: ID, type: WALLET) {
        const dash = await this.findDashboard(userId)
        if (!dash) return { statusCode: 500, message: 'Dashboard not found' }

        dash[type] = walletId
        await dash.save()
        return { statusCode: 200, message: 'Wallet updated' }
    }

    async updateProfit(invId: ID, amount: number) {
        const inv = await Investment.findByIdAndUpdate(invId, { ROI: amount }).exec()
        if (!inv) return { statusCode: 500, message: 'Investment not found' }

        return { statusCode: 200, message: 'Profit updated' }
    }

    async verifyDeposit(invId: ID) {
        const inv = await Investment.findById(invId).exec()
        if (!inv) return { statusCode: 400, message: 'Investment not found' }
        inv.status = STATUS.ACTIVE
        await inv.save()
        await inv.populate('transaction')
        inv.ROI = packageConverter[inv.investmentPackage]

        const { statusCode, message } = await this.confirmTransaction(<ID>inv.transaction)
        if (statusCode !== 200) return { statusCode, message }

        const { email, firstName } = <IUser>await this.findUserById(<ID>inv.investor)

        return { inv, email, firstName }
    }

    async verifyUser(userId: ID) {
        const user = await this.findUserById(userId)

        if (!user) throw new Error('User not found')

        try {
            user.verified = true
            await user.save()

            return { statusCode: 200, message: 'User verified succssfully' }
        } catch (error) {
            return { statusCode: 500, message: 'User not verified' }
        }
    }
}
