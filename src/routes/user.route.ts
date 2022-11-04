import express from "express"
const userRoute = express.Router()

import { MongoService } from "../services/db.service"
import { IUserController, UserController } from "../controller/user.controller"
const userController: IUserController = new UserController(new MongoService())

userRoute.get('/get-all', userController.getAllUsers)
userRoute.delete('/:userId', userController.deleteUser)
userRoute.put('/:userId', userController.updateAvatar)

export default userRoute