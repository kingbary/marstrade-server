import Dashboard from "../models/dashboard.model";
import Investment from "../models/investment.model";
import { ID, IDashboard, IInvestment, IInvestmentReq, IKYCData, IUser, STATUS } from "../models/types";
import User from "../models/user.model";

interface IAuthOptions {
    email?: string;
    userId?: ID;
}

export interface IMongoService {
    addKYC(userId: ID, KYCData: IKYCData): Promise<boolean>;
    addReferral(id: string): Promise<void>;
    authenticate(options: IAuthOptions): Promise<[IUser, string]>;
    createInvestment(investmentDetails: IInvestmentReq): Promise<IInvestment>;
    createUser(userDetails: IUser): Promise<IUser | null>;
    deleteUser(userId: ID): Promise<void>;
    findDashboard(userId: string): Promise<IDashboard | null>;
    findUserByEmail(email: string): Promise<IUser | null>;
    findUserById(id: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser[]>;
    getAllDashboards(): Promise<IDashboard[]>;
    getDashboard(userId: string): Promise<IDashboard>;
    updateAvatar(userId: ID, avatar: string): Promise<void>;
    updatePassword(userId: ID, password: string): Promise<void>;
    verifyDeposit(investmentId: ID): Promise<IInvestment>;
    verifyUser(userId: ID): Promise<IUser>;
    //addWallet
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
            referralLink: `${process.env.BASE_URL}/signup/${user._id}`,
        })
        await dashboard.save()

        return user
    }

    async deleteUser(userId: ID) {
        const inv = await Investment.findOneAndDelete({ investor: userId })
        const dash = await Dashboard.findOneAndDelete({ owner: userId })
        const user = await User.findOneAndDelete({ _id: userId })
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
            await dashboard.populate('owner')
            if (dashboard.hasInvestment) {
                await dashboard.populate('investment')
            }
            return dashboard
        }))
        return populatedDashboards
    }

    async getDashboard(userId: ID) {
        const dashboard = await this.findDashboard(userId)
        if (!dashboard) {
            throw new Error("Dashboard not found")
        }
        await dashboard.populate('owner')
        if (dashboard.hasInvestment) {
            await dashboard.populate('investment')
        }
        return dashboard
    }

    async updateAvatar(userId: ID, avatar: string) {
        const dashboard = await this.findDashboard(userId)

        if (!dashboard) {
            throw new Error('Dashboard not found')
        }

        dashboard.avatar = avatar
        await dashboard.save()

        return
    }

    async updatePassword(userId: ID, password: string) {
        const user = await User.findByIdAndUpdate(userId, { password }, { new: true }).exec()
    }

    async verifyDeposit(investmentId: ID) {
        const inv = await Investment.findById(investmentId).exec()
        if (!inv) {
            throw new Error('Investment not found')
        }

        inv.status = STATUS.APPROVED
        await inv.save()

        return inv
    }

    async verifyUser(userId: ID) {
        const user = await this.findUserById(userId)

        if (!user) throw new Error('User not found')

        user.verified = true
        await user.save()

        return user
    }
}
