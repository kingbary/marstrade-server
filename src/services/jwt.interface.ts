import { JwtPayload } from "jsonwebtoken";

export interface IJWTPayload {
    id?: string;
    role?: string;
    email?: string;
    pass?: string;
}

export interface IJWTService {
    generateToken: (payload: IJWTPayload, JWT_SECRET: string, expiresIn?: number) => string;
    verifyToken: (payload: string, JWT_SECRET: string) => string | JwtPayload;
}