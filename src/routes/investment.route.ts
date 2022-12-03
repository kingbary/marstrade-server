import express from "express"
const investmentRoute = express.Router()

import { MongoService } from "../services/db.service"
import { IInvestmentController, InvestmentController } from "../controller/investment.controller"
import { imageUpload } from "../middleware/imageUpload.middleware"
import verifyJWT from "../middleware/verifyJWT"
import Cloudinary from "../services/cloudinary.service"

const investmentController: IInvestmentController = new InvestmentController(
    new MongoService(),
    new Cloudinary())

investmentRoute.use(verifyJWT)

investmentRoute.post('/deposit', imageUpload.single('receipt'), investmentController.makeInvestment)
investmentRoute.patch('/verify-deposit', investmentController.verifyDeposit)
// investmentRoute.post('/request-withdrawal', investmentController.withdraw)
// investmentRoute.post('/confirm-withdrawal', investmentController.confirmWithdrawal)
// investmentRoute.post('/transaction-history', investmentController.getTransxHistory)

export default investmentRoute