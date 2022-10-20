import { Schema, model } from 'mongoose';

export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatar?: string;
}

const userSchema = new Schema<IUser>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: {
        type: String,
        get: (): undefined => undefined,
        required: true
    },
    avatar: String
}, {
    toJSON: {
        getters: true,
    },
    toObject: {
        getters: true,
    },
    timestamps: true
});

const User = model<IUser>('User', userSchema)
export default User