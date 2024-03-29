import e from "express"
import asyncHandler from "express-async-handler"
import { IMongoService } from "../services/db.service"

export interface IDashboardController {
    getAllDashboards: e.RequestHandler
    getDashboard: e.RequestHandler
}

export class DashboardController implements IDashboardController {
    private readonly persistence

    constructor(persistence: IMongoService) {
        this.persistence = persistence
    }
    
    getAllDashboards = asyncHandler(async (req, res) => {
        const dashboards = await this.persistence.getAllDashboards()
        res.json(dashboards)
    })
    
    getDashboard = asyncHandler(async (req, res) => {
        const { userId } = req.params
        const dashboard = await this.persistence.getDashboard(userId)
        res.json(dashboard)
    })
}