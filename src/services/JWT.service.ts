import jwt from 'jsonwebtoken'
import { IJWTPayload, IJWTService } from './jwt.interface';

class JWTService implements IJWTService {
    // maxAge = 3 * 24 * 60 * 60; // 3 days
    generateToken = (payload: IJWTPayload, JWT_SECRET: string, expiresIn = 1 * 24 * 60 * 60) => {
        return jwt.sign(payload, JWT_SECRET, { expiresIn });
    }

    verifyToken = (payload: string, JWT_SECRET: string) => {
        try {
            //decodes token id
            const decoded = jwt.verify(payload, JWT_SECRET)
            return decoded
        } catch (error) {
            throw new Error("Not authorized, token failed.")
        }
    }
}

export default JWTService