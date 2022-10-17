import path from 'path'

import express, { Request, Response } from 'express'

const router = express.Router()

router.get('^/$|index(.html)?', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '..', '..', 'views', 'index.html'))
})

export default router