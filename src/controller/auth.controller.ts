import e from "express"
import asyncHandler from "express-async-handler"
import { validationResult } from 'express-validator'
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
        const { firstName, lastName, email, password, referrer } = req.body

        // confirm data
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json(errors)
            return
        }

        // Check for duplicate
        const duplicate = await this.persistence.findUserByEmail(email)
        if (duplicate) {
            res.status(409).json({ message: 'Duplicate mail' })
            return
        }
        const hashPass = await this.cryptService.encrypt(password)
        const newUser = await this.persistence.createUser({ firstName, lastName, email, password: hashPass, verified: false })

        if (referrer) await this.persistence.addReferral(req.params.referrer)

        if (newUser) { // created successfully
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

        // confirm data
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json(errors)
            return
        }

        const [user, hash] = await this.persistence.authenticate(email)

        const isCorrectPassword = await this.cryptService.compare(password, hash)
        if (!isCorrectPassword) {
            res.status(401).json({ message: 'Invalid details' })
            return
        }

        res.json(user)
    })
}
