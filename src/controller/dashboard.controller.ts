import e from "express"
import asyncHandler from "express-async-handler"
import { IMongoService } from "../services/db.service"

export interface IDashboardController {
    getDashboard: e.RequestHandler
}

export class DashboardController implements IDashboardController {
    private readonly persistence
    constructor(persistence: IMongoService) {
        this.persistence = persistence
    }
    getDashboard = asyncHandler(async (req, res) => {
        const { userId } = req.params
        const dashboard = await this.persistence.getDashboard(userId)
        res.json(dashboard)
    })
}