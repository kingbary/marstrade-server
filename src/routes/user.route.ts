import express from "express"
const userRoute = express.Router()

import { MongoService } from "../services/db.service"
import { IUserController, UserController } from "../controller/user.controller"
import verifyJWT from "../middleware/verifyJWT"
const userController: IUserController = new UserController(new MongoService())

userRoute.use(verifyJWT)

userRoute.get('/get-all', userController.getAllUsers)
userRoute.delete('/:userId', userController.deleteUser)
userRoute.put('/:userId', userController.updateAvatar)
// router.post('/kyc/:userId', auth.addKYC)
// router.post('/verify', auth.verifyUser)

export default userRoute