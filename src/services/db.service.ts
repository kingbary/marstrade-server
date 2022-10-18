import User, { IUser } from "../models/user.model";

export interface IMongoService {
    createUser(arg0: IUser): Promise<IUser | null>;
    getUser(id: string): Promise<IUser | null>
}

export class MongoService implements IMongoService {
    async getUser(email: string) {
        const user = await User.findOne<IUser>({ email }).lean().exec()
        return user
    }

    async createUser(userDetails: IUser) {
        const user = new User<IUser>(userDetails)
        await user.save()
        
        return user
    }
}

// export default MongoService