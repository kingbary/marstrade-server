import e from "express"
import asyncHandler from "express-async-handler"
import { ID, IInvestmentReq, PLANS } from "../models/types"
import { ICloudinary } from "../services/cloudinary.service";
import { IMongoService } from "../services/db.service"
import { IMailService } from "../services/mail.service";

export interface IInvestmentController {
    makeInvestment: e.RequestHandler;
    verifyDeposit: e.RequestHandler;
}

export class InvestmentController implements IInvestmentController {
    private readonly persistence
    private readonly objService
    private readonly mailService

    constructor(persistence: IMongoService, objService: ICloudinary, mailService: IMailService) {
        this.persistence = persistence
        this.objService = objService
        this.mailService = mailService
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

        if (statusCode === 200) {
            const adminMail = await this.persistence.getAdminMail()
            await this.mailService.sendDepositNotifyMail(adminMail)
        }

        res.status(statusCode).json(message)
    })

    verifyDeposit = asyncHandler(async (req, res) => {
        const transId: ID = req.body.transId
        const { statusCode, message } = await this.persistence.verifyDeposit(transId)

        if (statusCode === 200) {
            await this.mailService.sendDepositConfirmMail(message)
            res.status(statusCode).json('Deposit verified')
            return
        }

        res.status(statusCode).json(message)
    })
}