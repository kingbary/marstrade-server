import express from "express"
const investmentRoute = express.Router()

import { MongoService } from "../services/db.service"
import { IInvestmentController, InvestmentController } from "../controller/investment.controller"
import verifyJWT from "../middleware/verifyJWT"
const investmentController: IInvestmentController = new InvestmentController(new MongoService())

investmentRoute.use(verifyJWT)

investmentRoute.post('/deposit', investmentController.makeInvestment)
// investmentRoute.post('/request-withdrawal', investmentController.withdraw)
// investmentRoute.post('/verify-deposit', investmentController.verifyDeposit)
// investmentRoute.post('/confirm-withdrawal', investmentController.confirmWithdrawal)
// investmentRoute.post('/transaction-history', investmentController.getTransxHistory)

export default investmentRoute