import User, { IUser } from "../models/user.model";

export interface IMongoService {
    authenticate(email: string): Promise<[IUser, string]>;
    createUser(arg0: IUser): Promise<IUser | null>;
    getUser(id: string): Promise<IUser | null>;
}

export class MongoService implements IMongoService {
    async getUser(email: string) {
        const user = await User.findOne<IUser>({ email }).exec()
        return user
    }

    async authenticate(email: string): Promise<[IUser, string]> {
        const user = await this.getUser(email)

        if (!user) {
            throw new Error("User not found")
        }
        // @ts-ignore
        const pwd = <string>user.get('password', null, { getters: false })
        return [user, pwd]
    }

    async createUser(userDetails: IUser) {
        const user = new User<IUser>(userDetails)
        await user.save()

        return user
    }
}

// export default MongoService