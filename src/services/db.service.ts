import User, { IUser } from "../models/user.model";

export interface IMongoService {
    getUser: (id: string) => Promise<IUser | null>
}

export class MongoService implements IMongoService {
    async getUser(email: string) {
        const user = await User.findOne<IUser>({ email })
        return user
    }
}

// export default MongoService