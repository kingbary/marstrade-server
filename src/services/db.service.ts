import Dashboard, { IDashboard } from "../models/dashboard.model";
import User, { IUser } from "../models/user.model";

export interface IMongoService {
    authenticate(email: string): Promise<[IUser, string]>;
    createUser(arg0: IUser): Promise<IUser | null>;
    getUserByEmail(id: string): Promise<IUser | null>;
    addReferral(id: string): Promise<void>;
}

export class MongoService implements IMongoService {
    async getUserByEmail(email: string) {
        const user = await User.findOne({ email }).exec()
        return user
    }

    async getUserById(id: string) {
        const user = await User.findById<IUser>(id).exec()
        return user
    }

    async authenticate(email: string): Promise<[IUser, string]> {
        const user = await this.getUserByEmail(email)

        if (!user) {
            throw new Error("Incorrect details")
        }
        const pwd = <string>user.get('password', null, { getters: false })
        return [user, pwd]
    }

    async createUser(userDetails: IUser, referral?: string) {
        const user = new User<IUser>(userDetails)
        await user.save()

        const dashboard = new Dashboard<IDashboard>({
            owner: user._id,
            referralLink: `${process.env.BASE_URL}/signup/${user._id}`,
            referrals: 0
        })
        await dashboard.save()

        return user
    }

    async addReferral(userId: string) {
        const dashboard = await Dashboard.findOne({ owner: userId })
        if (!dashboard) {
            throw new Error("Referrer not found")
        }
        dashboard.referrals += 1
        await dashboard.save()
    }
}
