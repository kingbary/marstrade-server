import express from 'express'
const router = express.Router()

import { loginValidator, signupValidator } from '../middleware/auth.middleware'

import { Auth, IAuth } from '../controller/auth.controller'
import { MongoService } from '../services/db.service'
import { Encryption } from '../services/encryption.service'
import loginLimiter from '../middleware/loginLimiter'
import JWTService from '../services/JWT.service'
const auth: IAuth = new Auth(new MongoService(), new Encryption(), new JWTService())

router.post('/login', loginLimiter, loginValidator, auth.login)
router.post('/signup', signupValidator, auth.signup)
router.post('/logout', auth.logout)
router.get('/refresh', auth.refresh)
// router.post('/verify', auth.verifyUser)
// router.post('/kyc/:userId', auth.addKYC)

export default router