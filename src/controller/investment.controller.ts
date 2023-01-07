import e from "express"
import asyncHandler from "express-async-handler"
import { ID, IInvestmentReq, ITransaction, PLANS } from "../models/types"
import { ICloudinary } from "../services/cloudinary.service";
import { IMongoService } from "../services/db.service"
import { IMailService } from "../services/mail.service";

export interface IInvestmentController {
    confirmWithdrawal: e.RequestHandler;
    getTransactionHistory: e.RequestHandler;
    getWithdrawalData: e.RequestHandler;
    makeInvestment: e.RequestHandler;
    redeemReferral: e.RequestHandler;
    requestwithdraw: e.RequestHandler;
    terminateInvestment: e.RequestHandler;
    updateProfit: e.RequestHandler;
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

    confirmWithdrawal = asyncHandler(async (req, res) => {
        const { transId } = req.body
        const { statusCode, message } = await this.persistence.confirmWithdrawal(transId)
        res.status(statusCode).json({ message })
    })

    getTransactionHistory = asyncHandler(async (req, res) => {
        const { userId } = req.params
        const transactions = await this.persistence.getTransactionHistory(userId)
        res.json(transactions)
    })

    getWithdrawalData = asyncHandler(async (req, res) => {
        const { userId } = req.params
        const transaction = await this.persistence.getWithdrawalData(userId)
        res.json(transaction)
    })

    makeInvestment = asyncHandler(async (req, res) => {
        const { userId, amount, invPackage, plan, method } = req.body
        const receiptPath = req.file?.path

        if (!receiptPath) {
            res.status(400).json({ message: "Incomplete details." })
            return
        }

        const investmentDetails: IInvestmentReq = {
            investor: <ID>userId,
            investmentAmount: +amount,
            investmentPackage: invPackage,
            method: method,
            investmentPlan: <PLANS>plan,
            receipt: 'pending'
        }
        const [investment, transaction] = await this.persistence.createInvestment(investmentDetails)

        const {
            isSuccess,
            imageURL } = await this.objService.uploadImage(receiptPath, transaction.id!, 'receipts')

        if (!isSuccess || !imageURL) {
            res.status(400).json({ message: "Could not uplaod receipt. Try again later." })
            return
        }
        const { statusCode, message } = await this.persistence.addReceipttoInv(transaction.id!, imageURL)

        if (statusCode === 200) {
            const adminMail = await this.persistence.getAdminMail()
            await this.mailService.sendDepositNotifyMail({
                email: adminMail,
                firstName: 'Admin',
                amount: `${investmentDetails.investmentAmount}`,
                method: method,
                invPlan: investmentDetails.investmentPlan,
                invPackage: investmentDetails.investmentPackage,
                ROI: `${investment.ROI}`,
            })
        }

        res.status(statusCode).json({ message })
    })

    redeemReferral = asyncHandler(async (req, res) => {
        const userId: ID = req.body.userId
        const { statusCode, message } = await this.persistence.redeemReferral(userId)

        res.status(statusCode).json({ message })
    })

    requestwithdraw = asyncHandler(async (req, res) => {
        const userId = req.body.userId
        const method = req.body.method
        const amount = req.body.amount
        const address = req.body.address

        const transDetails = {
            investor: <ID>userId,
            method: <string>method,
            amount: +amount,
            walletAddress: <string>address,
        }
        const { statusCode, message } = await this.persistence.requestwithdraw(transDetails)

        res.status(statusCode).json({ message })
    })

    terminateInvestment = asyncHandler(async (req, res) => {
        const invId: ID = req.body.invId
        const { statusCode, message } = await this.persistence.terminateInvestment(invId)

        res.status(statusCode).json({ message })
    })

    verifyDeposit = asyncHandler(async (req, res) => {
        const invId: ID = req.body.invId
        const response = await this.persistence.verifyDeposit(invId)

        if ('email' in response) {
            const trans = <ITransaction>response.inv.transaction
            await this.mailService.sendDepositConfirmMail({
                email: response.email,
                firstName: response.firstName,
                amount: `${response.inv.investmentAmount}`,
                invPackage: response.inv.investmentPackage,
                invPlan: response.inv.investmentPlan,
                method: trans.method,
                ROI: `${response.inv.ROI}`,
            })
            res.json({ message: 'Deposit verified' })
            return
        }

        res.status(response.statusCode).json({ message: response.message })
    })

    updateProfit = asyncHandler(async (req, res) => {
        const invId: ID = req.body.invId
        const amount: number = req.body.amount
        const { statusCode, message } = await this.persistence.updateProfit(invId, amount)

        res.status(statusCode).json({ message })
    })
}