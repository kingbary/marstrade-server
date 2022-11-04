import express from 'express'
const router = express.Router()

import { loginValidator, signupValidator } from '../middleware/auth.middleware'

import { Auth, IAuth } from '../controller/auth.controller'
import { MongoService } from '../services/db.service'
import { Encryption } from '../services/encryption.service'
const auth: IAuth = new Auth(new MongoService(), new Encryption())

router.post('/signup', signupValidator, auth.signup)
router.post('/login', loginValidator, auth.login)
// router.post('/verify', auth.verifyUser)

export default router