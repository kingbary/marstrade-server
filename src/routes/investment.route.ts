import express from "express"
const investmentRoute = express.Router()

import { MongoService } from "../services/db.service"
import { IInvestmentController, InvestmentController } from "../controller/investment.controller"
const investmentController: IInvestmentController = new InvestmentController(new MongoService())

investmentRoute.post('/deposit', investmentController.makeInvestment)
// investmentRoute.post('/deposit', investmentController.withdraw)
// investmentRoute.post('/deposit', investmentController.verifyDeposit)
// investmentRoute.post('/deposit', investmentController.confirmWithdrawal)

export default investmentRoute