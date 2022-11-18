import e from "express"
import asyncHandler from "express-async-handler"
import { ID, IKYCData } from "../models/types"
import { ICloudinary } from "../services/cloudinary.service"
import { IMongoService } from "../services/db.service"


export interface IUserController {
    addKYC: e.RequestHandler,
    deleteUser: e.RequestHandler,
    getAllUsers: e.RequestHandler,
    updateAvatar: e.RequestHandler,
}

export class UserController implements IUserController {
    private readonly persistence
    private readonly objService

    constructor(persistence: IMongoService, objService: ICloudinary) {
        this.persistence = persistence
        this.objService = objService
    }

    /**
     * @param {e.Request}req express request object
     * @param {e.Response}res express response object
     * @METHOD DELETE /v1/user/:userId
     * @desc Deletes a single user.
     */
    addKYC = asyncHandler(async (req, res) => {
        const userId: ID = req.params.userId
        const [front, back] = <Express.Multer.File[]>req.files
        const { country, DOB, IDType } = req.body

        const {
            message,
            imageURL,
            statusCode,
            isSuccess } = await this.objService.uploadImage(front.path, `${IDType}_front`, userId)

        const {
            message: messageBack,
            imageURL: imageURLBack,
            statusCode: statusCodeBack,
            isSuccess: isSuccessBack } = await this.objService.uploadImage(back.path, `${IDType}_back`, userId)

        if (!isSuccess || !imageURL) {
            res.status(statusCode).json({ message })
            return
        }

        if (!isSuccessBack || !imageURLBack) {
            res.status(statusCodeBack).json({ message: messageBack })
            return
        }
        const KYCData: IKYCData = {
            country,
            DOB,
            IDType,
            IDFront: imageURL,
            IDBack: imageURLBack
        }
        const success = await this.persistence.addKYC(userId, KYCData)

        if (!success) {
            res.sendStatus(500)
            return
        }

        res.json({ message: `KYC data uploaded successfully` })
    })

    /**
     * @param {e.Request}req express request object
     * @param {e.Response}res express response object
     * @METHOD DELETE /v1/user/:userId
     * @desc Deletes a single user.
     */
    deleteUser = asyncHandler(async (req, res) => {
        const userId: ID = req.params.userId

        await this.persistence.deleteUser(userId)

        res.json({ message: `User ${userId} deleted successfully` })
    })

    /**
     * @param {e.Request}req request object
     * @param {e.Response}res response object
     * @METHOD GET /v1/user/get-all
     * @desc Retrieves data for all users for ADMIN.
     */
    getAllUsers = asyncHandler(async (req, res) => {
        const users = await this.persistence.getAllUsers()
        res.json(users)
    })

    /**
     * @param {e.Request}req request object
     * @param {e.Response}res response object
     * @METHOD PUT /v1/user/:userId
     * @desc Updates a user profile.
     */
    updateAvatar = asyncHandler(async (req, res) => {
        const { userId } = req.params
        const localPath = <string>req.file?.path

        const {
            message,
            imageURL,
            statusCode,
            isSuccess } = await this.objService.uploadImage(localPath, 'avatar', userId)

        if (!isSuccess || !imageURL) {
            res.status(statusCode).json({ message })
            return
        }

        await this.persistence.updateAvatar(userId, imageURL!)
        res.status(statusCode).json({ message })

    })
}
