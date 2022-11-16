import express from 'express'
const router = express.Router()

import { loginValidator, signupValidator } from '../middleware/auth.middleware'
import { Auth, IAuth } from '../controller/auth.controller'
import { MongoService } from '../services/db.service'
import { Encryption } from '../services/encryption.service'
import loginLimiter from '../middleware/loginLimiter'
import JWTService from '../services/JWT.service'
import MailService from '../services/mail.service'

const { SMTP_SERVICE, SMTP_AUTH_USER, SMTP_AUTH_PASS } = process.env

const auth: IAuth = new Auth(
    new MongoService(),
    new Encryption(),
    new JWTService(),
    new MailService(SMTP_SERVICE!, SMTP_AUTH_USER!, SMTP_AUTH_PASS!))

router.post('/login', loginLimiter, loginValidator, auth.login)
router.post('/signup', signupValidator, auth.signup)
router.post('/logout', auth.logout)
router.get('/refresh', auth.refresh)
router.post('/reset-password', auth.resetPassword)
router.post('/get-reset-url', auth.sendResetPassURL)

export default router