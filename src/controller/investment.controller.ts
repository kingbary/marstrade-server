import e from "express"
import asyncHandler from "express-async-handler"
import { ID, IInvestment, IInvestmentReq, invPackageType, PLANS } from "../models/types"
import { ICloudinary } from "../services/cloudinary.service";
import { IMongoService } from "../services/db.service"

export interface IInvestmentController {
    makeInvestment: e.RequestHandler;
    verifyDeposit: e.RequestHandler;
}

export class InvestmentController implements IInvestmentController {
    private readonly persistence
    private readonly objService

    constructor(persistence: IMongoService, objService: ICloudinary) {
        this.persistence = persistence
        this.objService = objService
    }

    makeInvestment = asyncHandler(async (req, res) => {
        const { userId, amount, invPackage, plan } = req.body
        const filepath = req.file?.path

        if (!filepath) {
            res.status(400).json({ message: "Incomplete details." })
            return
        }

        const investmentDetails: IInvestmentReq = {
            investor: <ID>userId,
            investmentAmount: +amount,
            investmentPackage: invPackage,
            investmentPlan: <PLANS>plan,
            receipt: 'pending'
        }
        const investment = await this.persistence.createInvestment(investmentDetails)

        const {
            isSuccess,
            imageURL } = await this.objService.uploadImage(filepath, investment.id!, 'receipts')

        if (!isSuccess || !imageURL) {
            res.status(400).json({ message: "Could not uplaod receipt. Try again later." })
            return
        }
        const { statusCode, message } = await this.persistence.addReceipttoInv(investment.id!, imageURL)
        res.status(statusCode).json(message)
    })

    verifyDeposit = asyncHandler(async (req, res) => {
        const transId: ID = req.body.transId
        const { statusCode, message } = await this.persistence.verifyDeposit(transId)
        res.status(statusCode).json(message)
    })
}