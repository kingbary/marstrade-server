"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errHandler = void 0;
const logger_1 = require("./logger");
const errHandler = (error, req, res, next) => {
    if (error.message === 'Forbidden') {
        return res.status(403).json({ message: "Forbidden" });
    }
    if (process.env.NODE_ENV === 'development')
        console.log(res.statusCode, error);
    const errMsg = `${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`;
    (0, logger_1.logEvent)(errMsg, 'errLog.log');
    const status = (res.statusCode !== 200) ? res.statusCode : 500; // return 500 if no status code
    if (error.name === 'MongooseServerSelectionError') {
        return res.status(status).json({ message: "Server Error" });
    }
    res.status(status).json({ message: error.message });
};
exports.errHandler = errHandler;
