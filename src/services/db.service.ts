import Dashboard from "../models/dashboard.model";
import Investment from "../models/investment.model";
import { ID, IDashboard, IInvestment, IInvestmentReq, IUser, STATUS } from "../models/types";
import User from "../models/user.model";

export interface IMongoService {
    addReferral(id: string): Promise<void>;
    authenticate(email: string): Promise<[IUser, string]>;
    createInvestment(investmentDetails: IInvestmentReq): Promise<IInvestment>;
    createUser(userDetails: IUser): Promise<IUser | null>;
    deleteUser(userId: ID): Promise<void>;
    findDashboard(userId: string): Promise<IDashboard | null>;
    findUserByEmail(email: string): Promise<IUser | null>;
    findUserById(id: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser[]>;
    getAllDashboards(): Promise<IDashboard[]>;
    getDashboard(userId: string): Promise<IDashboard>;
    verifyDeposit(investmentId: ID): Promise<IInvestment>;
    verifyUser(userId: ID): Promise<IUser>;
    //addWallet
    //confirmWithdrawal
}

export class MongoService implements IMongoService {
    async addReferral(userId: ID) {
        const dashboard = await this.findDashboard(userId)
        if (!dashboard) {
            // throw new Error("Referrer not found")
            return
        }
        dashboard.referrals += 1
        await dashboard.save()
    }

    async authenticate(email: string): Promise<[IUser, string]> {
        const user = await this.findUserByEmail(email)

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
