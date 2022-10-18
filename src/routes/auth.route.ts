import express from 'express'
const router = express.Router()

import { Auth, IAuth } from '../controller/auth.controller'
import { MongoService } from '../services/db.service'
import { Encryption } from '../services/encryption.service'

const auth: IAuth = new Auth(new MongoService(), new Encryption())

router.post('/signup', auth.signup)

router.post('/login', auth.login)

export default router