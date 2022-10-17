import { ErrorRequestHandler } from "express"
import { logEvent } from "./logger"

export const errHandler: ErrorRequestHandler = (error:Error, req, res, next) => {
    const errMsg = `${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`
    logEvent(errMsg, 'errLog.log')

    const status = res.statusCode ? res.statusCode : 500 // return 500 if no status code

    res.status(status).json({ message: error.message })
}