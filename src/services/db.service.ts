import Dashboard from "../models/dashboard.model";
import Investment from "../models/investment.model";
import User from "../models/user.model";
import { ID, IDashboard, IDBResponse, IInvestment, IInvestmentReq, IKYCData, IUser, IWallet, STATUS, WALLET } from "../models/types";
import Wallet from "../models/wallet.model";

interface IAuthOptions {
    email?: string;
    userId?: ID;
}

export interface IMongoService {
    addKYC(userId: ID, KYCData: IKYCData): Promise<boolean>;
    addReferral(id: string): Promise<void>;
    addReceipttoInv(id: ID, image: string): Promise<IDBResponse>;
    addWallet(walletData: IWallet): Promise<IDBResponse>;
    authenticate(options: IAuthOptions): Promise<[IUser, string]>;
    createInvestment(investmentDetails: IInvestmentReq): Promise<IInvestment>;
    createUser(userDetails: IUser): Promise<IUser>;
    deleteUser(userId: ID): Promise<IDBResponse>;
    deleteWallet(walletId: ID): Promise<IDBResponse>;
    findDashboard(userId: string): Promise<IDashboard | null>;
    findUserByEmail(email: string): Promise<IUser | null>;
    findUserById(id: string): Promise<IUser | null>;
    getAllDashboards(): Promise<IDashboard[]>;
    getAllUsers(): Promise<IUser[]>;
    getAllWallets(): Promise<IWallet[]>;
    getDashboard(userId: string): Promise<IDashboard>;
    updateAvatar(userId: ID, avatar: string): Promise<IDBResponse>;
    updatePassword(userId: ID, password: string): Promise<void>;
    updateWallet(userId: ID, walletId: ID, type: string): Promise<IDBResponse>;
    verifyDeposit(investmentId: ID): Promise<IDBResponse>;
    verifyUser(userId: ID): Promise<IDBResponse>;
    //confirmWithdrawal
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

    async addReceipttoInv(id: ID, image: string) {
        const investment = await Investment.findByIdAndUpdate(id, {
            receipt: image
        }).exec()

        if (!investment) return { statusCode: 500, message: 'An error occured. Try again' }
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

    async createInvestment(investmentDetails: IInvestmentReq) {
        const dashB = await this.findDashboard(investmentDetails.investor)
        if (!dashB) {
            throw new Error('Dashboard not found')
        }

        const inv = new Investment(investmentDetails)
        await inv.save()

        dashB.hasInvestment = true
        await dashB.save()

        return inv
    }

    async createUser(userDetails: IUser) {
        const user = new User<IUser>(userDetails)
        await user.save()

        const dashboard = new Dashboard({
            owner: user._id,
        })
        dashboard.referralLink = `${process.env.BASE_URL}/signup/${dashboard._id}`,
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

    async getAllDashboards() {
        const dashboards = await Dashboard.find()
        const populatedDashboards = await Promise.all(dashboards.map(async (dashboard) => {
            await dashboard.populate('owner btc eth usdt')
            if (dashboard.hasInvestment) {
                await dashboard.populate('investment')
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
        }
        return dashboard
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

    async verifyDeposit(investmentId: ID) {
        const inv = await Investment.findById(investmentId).exec()
        if (!inv) return { statusCode: 500, message: 'An error occured. Try again' }

        inv.status = STATUS.ACTIVE
        await inv.save()

        return { statusCode: 200, message: 'Deposit verified' }
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
