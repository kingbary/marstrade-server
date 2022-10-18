import e from "express"
import asyncHandler from "express-async-handler"
import { IMongoService } from "../services/db.service"
import { IEncryption } from "../services/encryption.service"


export interface IAuth {
    signup: e.RequestHandler,
    login: e.RequestHandler,
}

export class Auth implements IAuth {
    private readonly persistence
    private readonly cryptService

    constructor(persistence: IMongoService, cryptService: IEncryption) {
        this.persistence = persistence
        this.cryptService = cryptService
    }

    /**
     * @param {e.Request}req request object
     * @param {e.Response}res response object
     * @METHOD POST /v1/auth/signup
     * @desc Signs up a user.
     * - It assumes the email and password in the req.body are validated,
     * so no extra validation is done.
     */
    signup = asyncHandler(async (req, res) => {
        const { firstName, lastName, email, password, rePassword } = req.body
        const duplicate = await this.persistence.getUser(email)

        // confirm data
        if (!email || !firstName || !lastName || !password || password === rePassword) {
            res.status(400).json({ message: 'All fields are required' })
            return
        }

        // Check for duplicate
        if (duplicate) {
            res.status(409).json({ message: 'Duplicate mail' })
            return
        }
        const hashPass = await this.cryptService.encrypt(password)
        const newUser = await this.persistence.createUser({ firstName, lastName, email, password: hashPass })

        if (!newUser) { // created successfully
            res.status(201).json({ message: `Account created succesfully` })
        } else {
            res.status(400).json({ message: 'Invalid user data received' })
        }
    })

    /**
     * @param {e.Request}req express request object
     * @param {e.Response}res express response object
     * @METHOD POST /v1/auth/login
     * @desc authorizes a user and responds with the user document object.
     * - It assumes the email and password in the req.body are validated,
     * so no extra validation is done.
     */
    login = asyncHandler(async (req, res) => {
        const { email, password } = req.body
        const user = await this.persistence.getUser(email)

        if (!user) {
            res.status(400).json({ message: 'User not found' })
            return
        }

        // ensure correct password
        const match = await this.cryptService.compare(password, user.password)

        if (!match) {
            res.status(401).json({ message: 'Invalid details' })
        } else {
            res.json(user)
        }
    })
}
