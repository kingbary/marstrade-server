import e from "express"
import asyncHandler from "express-async-handler"
import bcrypt from "bcrypt"
import { IMongoService } from "../services/db.service"


export interface IAuth {
    signup: e.RequestHandler,
    login: e.RequestHandler,
}

export class Auth implements IAuth {
    private readonly persistence

    constructor(persistence: IMongoService) {
        this.persistence = persistence
    }

    signup = asyncHandler(async (req, res) => { })
    
    login = asyncHandler(async (req, res) => {
        const { email, password } = req.body
        const user = await this.persistence.getUser(email)

        if (!user) {
            res.status(400).json({ message: 'User not found' })
            return
        }
        
        const match = await bcrypt.compare(password, user.password)
        
        if (!match) {
            res.status(401).json({ message: 'Invalid details' })
            return
        }

        // retuen the user details JSON
    })
}
