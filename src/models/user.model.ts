import { Schema, model } from 'mongoose';
import { IUser } from './types';

const userSchema = new Schema<IUser>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: {
        type: String,
        get: (): undefined => undefined,
        required: true
    },
    verified: { type: Boolean, default: false },
    role: { type: String, default: "USER" },
    country: String,
    DOB: String,
    IDType: String,
    IDFront: String,
    IDBack: String,
}, {
    toJSON: { getters: true },
    toObject: { getters: true },
    timestamps: true
});

const User = model<IUser>('User', userSchema)
export default User