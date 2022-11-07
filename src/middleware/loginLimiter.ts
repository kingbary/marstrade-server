import rateLimit from "express-rate-limit"
import { logEvent } from "./logger"

const loginLimiter = rateLimit({
    windowMs: 60000, //60secs
    max: 5, // Limit each IP to 5 requests per 'window' per minute
    message: {
        message: 'Too many login attempts from this IP, please try again after 60 seconds'
    },
    handler: (req, res, next, options) => {
        logEvent(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
        res.status(options.statusCode).send(options.message)

    },
    standardHeaders: true, // Return rate limit info in the 'RateLimit-*' headers
    legacyHeaders: false, // Disable the 'X-RateLimit-*' headers
})

export default loginLimiter