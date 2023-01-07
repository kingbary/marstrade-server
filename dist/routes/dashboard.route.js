"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const db_service_1 = require("../services/db.service");
const dashboard_controller_1 = require("../controller/dashboard.controller");
const verifyJWT_1 = __importDefault(require("../middleware/verifyJWT"));
const dashboardController = new dashboard_controller_1.DashboardController(new db_service_1.MongoService());
router.use(verifyJWT_1.default);
router.get('/', dashboardController.getAllDashboards);
router.get('/:userId', dashboardController.getDashboard);
exports.default = router;
