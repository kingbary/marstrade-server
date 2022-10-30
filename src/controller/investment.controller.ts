import e from "express"
import asyncHandler from "express-async-handler"
import { ID, IInvestment, IInvestmentReq, invPackageType, PLANS } from "../models/types"
import { IMongoService } from "../services/db.service"

export interface IInvestmentController {
    makeInvestment: e.RequestHandler;
}

export class InvestmentController implements IInvestmentController {
    private readonly persistence

    constructor(persistence: IMongoService) {
        this.persistence = persistence
    }

    private getInterest(pckg: invPackageType) {
        const interestRate: { [key: string]: number } = {
            AGRICULTURE: 1.2,
            FOREX: 1.2,
            STOCK: 1.2,
            INHERITANCE: 1.2,
            ENERGY: 1.2,
            CRYPTOCURRENCY: 1.2,
            METAL: 1.2
        }
        return interestRate[pckg];
    }

    makeInvestment = asyncHandler(async (req, res) => {
        const { userId, amount, invPackage, plan } = req.body
        const investmentDetails: IInvestmentReq = {
            investor: <ID>userId,
            investmentAmount: +amount,
            investmentPackage: this.getInterest(invPackage as invPackageType),
            investmentPlan: <PLANS>plan,
        }
        const investment = await this.persistence.createInvestment(investmentDetails)
        res.json(investment)
    })
}