import express from 'express'
const router = express.Router()

import { MongoService } from '../services/db.service'
import { WalletController, IWalletController } from '../controller/wallet.controller'
import verifyJWT from '../middleware/verifyJWT'
import { imageUpload } from '../middleware/imageUpload.middleware'
import Cloudinary from '../services/cloudinary.service'
const walletController = <IWalletController>new WalletController(
    new MongoService(),
    new Cloudinary()
)

router.use(verifyJWT)

router.get('/', walletController.getAll)
router.post('/add-wallet', imageUpload.single('barcode'), walletController.addWallet)

export default router