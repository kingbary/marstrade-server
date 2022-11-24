import express from "express"
const userRoute = express.Router()

import { MongoService } from "../services/db.service"
import { IUserController, UserController } from "../controller/user.controller"
import verifyJWT from "../middleware/verifyJWT"
import Cloudinary from "../services/cloudinary.service"
import { imageUpload } from "../middleware/imageUpload.middleware"
const userController: IUserController = new UserController(new MongoService(), new Cloudinary())

userRoute.use(verifyJWT)

userRoute.get('/get-all', userController.getAllUsers)
userRoute.delete('/:userId', userController.deleteUser)
userRoute.put('/:userId', imageUpload.single('avatar'), userController.updateAvatar)
userRoute.post('/kyc/:userId', imageUpload.array('ID', 2), userController.addKYC)
userRoute.patch('/verify/:userId', userController.verifyUser)

export default userRoute