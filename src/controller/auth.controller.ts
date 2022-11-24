import e from "express"
import asyncHandler from "express-async-handler"
import { validationResult } from 'express-validator'
import { JwtPayload } from "jsonwebtoken"
import { IMongoService } from "../services/db.service"
import { IEncryption } from "../services/encryption.service"
import { IJWTService } from "../services/jwt.interface"
import { IMailService } from "../services/mail.service"


export interface IAuth {
    signup: e.RequestHandler,
    login: e.RequestHandler,
    logout: e.RequestHandler,
    refresh: e.RequestHandler,
    resetPassword: e.RequestHandler,
    sendResetPassURL: e.RequestHandler,
}

export class Auth implements IAuth {
    private readonly persistence
    private readonly cryptService
    private readonly jwtService
    private readonly mailService

    constructor(
        persistence: IMongoService,
        cryptService: IEncryption,
        jwtService: IJWTService,
        mailService: IMailService
    ) {
        this.persistence = persistence
        this.cryptService = cryptService
        this.jwtService = jwtService
        this.mailService = mailService
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
        const userData = {
            firstName,
            lastName,
            email,
            password: hashPass,
            verified: false,
            role: 'USER'
        }
        const newUser = await this.persistence.createUser(userData)

        const mailResponse = await this.mailService.sendWelcomeMail(newUser)
        if (!mailResponse.isSuccess) {
            const deleteResponse = await this.persistence.deleteUser(newUser.id!)
            res.status(mailResponse.statusCode).json({ message: mailResponse.message })
            return
        }

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

        const [user, hash] = await this.persistence.authenticate({ email })

        const isCorrectPassword = await this.cryptService.compare(password, hash)
        if (!isCorrectPassword) {
            res.status(401).json({ message: 'Invalid details' })
            return
        }

        const accessToken = this.jwtService.generateToken({
            "id": user.id!,
            "role": user.role
        }, process.env.ACCESS_TOKEN_SECRET!, 10 * 60)

        const refreshToken = this.jwtService.generateToken({ "id": user.id! }, process.env.REFRESH_TOKEN_SECRET!)

        // Create secure cookie with refresh token
        res.cookie('inv_jwt', refreshToken, {
            httpOnly: true,
            // secure: true, // https
            // sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.json({ accessToken, userId: user.id, role: user.role })
    })

    /**
     * @param {e.Request}req express request object
     * @param {e.Response}res express response object
     * @METHOD POST /v1/auth/logout
     * @desc LOGOUT - clear cookie if it exists.
     * @access Public
     */
    logout = asyncHandler(async (req, res) => {
        const cookies = req.cookies

        if (!cookies.inv_jwt) {
            res.sendStatus(204) // no content
            return
        }

        res.clearCookie('inv_jwt', {
            httpOnly: true,
            // sameSite: 'none',
            // secure: true, //https
        })
        res.json({ message: 'Cookie cleared' })
    })

    /**
     * @param {e.Request}req express request object
     * @param {e.Response}res express response object
     * @METHOD POST /v1/auth/refresh
     * @desc LOGOUT - refresh access token.
     * @access Public
     */
    refresh = asyncHandler(async (req, res) => {
        const cookies = req.cookies

        if (!cookies.inv_jwt) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        const refreshToken = cookies.inv_jwt

        const decoded = <JwtPayload>this.jwtService.verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET!)

        const user = await this.persistence.findUserById(decoded.id)

        if (!user) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        const accessToken = this.jwtService.generateToken({
            "id": user.id!,
            "role": user.role
        }, process.env.ACCESS_TOKEN_SECRET!, 10 * 60)

        res.json({ accessToken, userId: user.id, role: user.role })
    })

    /**
     * @param {e.Request}req express request object
     * @param {e.Response}res express response object
     * @METHOD POST /v1/auth/reset-password
     * @desc RESET PASSWORD.
     * @access Public
     */
    resetPassword = asyncHandler(async (req, res) => {
        const { email, currentPassword, newPassword, rePassword } = req.body
        if (!email || !currentPassword || !newPassword || !rePassword) {
            res.status(400).json({ message: 'Incomplete details' })
            return
        }

        if (newPassword !== rePassword) {
            res.status(400).json({ message: 'Passwords must match' })
            return
        }

        const [user, hash] = await this.persistence.authenticate({ email })

        const isCorrectPassword = (currentPassword === hash) || await this.cryptService.compare(currentPassword, hash)
        if (!isCorrectPassword) {
            res.status(401).json({ message: 'Invalid details' })
            return
        }

        const hashPass = await this.cryptService.encrypt(newPassword)
        await this.persistence.updatePassword(user.id!, hashPass)
        res.json({ message: 'Password changed successfully' })
    })

    /**
     * @param {e.Request}req express request object
     * @param {e.Response}res express response object
     * @METHOD POST /v1/auth/reset-password
     * @desc SEND RESET PASSWORD URL.
     * @access Public
     */
    sendResetPassURL = asyncHandler(async (req, res) => {
        const { email } = req.body
        const [user, hash] = await this.persistence.authenticate({ email })

        const resetPassToken = this.jwtService.generateToken({
            "email": user.email,
            "pass": hash
        }, process.env.RESET_PASSWORD_SECRET!, 15 * 60)


        const origin = req.get('origin')
        const resetURL = `${origin}/reset-password/${resetPassToken}`

        const sendStatus = await this.mailService.sendPasswordResetMail(user.email, resetURL)

        res.json({ message: 'Mail sent successfully' })
    })
}
