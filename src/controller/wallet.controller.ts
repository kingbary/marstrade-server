import e from "express"
import asyncHandler from "express-async-handler"
import { ICloudinary } from "../services/cloudinary.service"
import { IMongoService } from "../services/db.service"

export interface IWalletController {
    addWallet: e.RequestHandler
    deleteWallet: e.RequestHandler
    getAll: e.RequestHandler
    updateForUser: e.RequestHandler
}

export class WalletController implements IWalletController {
    private readonly persistence
    private readonly objService

    constructor(persistence: IMongoService, objService: ICloudinary) {
        this.persistence = persistence
        this.objService = objService
    }

    addWallet = asyncHandler(async (req, res) => {
        const localPath = <string>req.file?.path
        const { type, address } = req.body

        const {
            message,
            imageURL,
            statusCode,
            isSuccess } = await this.objService.uploadImage(localPath, address, 'wallets')

        if (!isSuccess || !imageURL) {
            res.status(statusCode).json({ message })
            return
        }

        const {
            statusCode: dbStatusCode,
            message: dbMessage } = await this.persistence.addWallet({ type, address, barcode: imageURL })

        res.status(dbStatusCode).json({ message: dbMessage })
    })

    deleteWallet = asyncHandler(async (req, res) => {
        const { walletId } = req.body
        const { message, statusCode } = await this.persistence.deleteWallet(walletId)
        res.status(statusCode).json({ message })
    })

    getAll = asyncHandler(async (req, res) => {
        const wallets = await this.persistence.getAllWallets()
        res.json(wallets)
    })

    updateForUser = asyncHandler(async (req, res) => {
        const { userId, walletId, type } = req.body
        const { message, statusCode } = await this.persistence.updateWallet(userId, walletId, type)
        console.log(message, statusCode)
        res.status(statusCode).json({ message })
    })
}