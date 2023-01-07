"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const db_service_1 = require("../services/db.service");
const wallet_controller_1 = require("../controller/wallet.controller");
const verifyJWT_1 = __importDefault(require("../middleware/verifyJWT"));
const imageUpload_middleware_1 = require("../middleware/imageUpload.middleware");
const cloudinary_service_1 = __importDefault(require("../services/cloudinary.service"));
const walletController = new wallet_controller_1.WalletController(new db_service_1.MongoService(), new cloudinary_service_1.default());
router.use(verifyJWT_1.default);
router.get('/', walletController.getAll);
router.delete('/', walletController.deleteWallet);
router.post('/', imageUpload_middleware_1.imageUpload.single('barcode'), walletController.addWallet);
router.patch('/', walletController.updateForUser);
exports.default = router;
