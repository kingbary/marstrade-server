import express from "express"
const investmentRoute = express.Router()

import { MongoService } from "../services/db.service"
import { IInvestmentController, InvestmentController } from "../controller/investment.controller"
import { imageUpload } from "../middleware/imageUpload.middleware"
import verifyJWT from "../middleware/verifyJWT"
import Cloudinary from "../services/cloudinary.service"
import MailService from "../services/mail.service"

const { SMTP_SERVICE, SMTP_AUTH_USER, SMTP_AUTH_PASS, SMTP_PORT } = process.env

const investmentController: IInvestmentController = new InvestmentController(
    new MongoService(),
    new Cloudinary(),
    new MailService(SMTP_SERVICE!, SMTP_AUTH_USER!, SMTP_AUTH_PASS!, +SMTP_PORT!))

investmentRoute.use(verifyJWT)

investmentRoute.post('/deposit', imageUpload.single('receipt'), investmentController.makeInvestment)
investmentRoute.patch('/verify-deposit', investmentController.verifyDeposit)
investmentRoute.get('/transaction-history/:userId', investmentController.getTransactionHistory)
investmentRoute.patch('/terminate-investment', investmentController.terminateInvestment)
investmentRoute.patch('/redeem-referral', investmentController.redeemReferral)
investmentRoute.post('/request-withdrawal', imageUpload.single('receipt'), investmentController.requestwithdraw)
investmentRoute.get('/withdrawal/:userId', investmentController.getWithdrawalData)
investmentRoute.patch('/confirm-withdrawal', investmentController.confirmWithdrawal)

export default investmentRoute