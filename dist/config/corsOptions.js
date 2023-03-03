"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    `https://dashboard.marstrade.org`,
    `https://www.${process.env.BASE_URL}`,
    `https://${process.env.BASE_URL}`, // production URL
];
const corsOptions = {
    origin: function (origin, callback) {
        if ((origin && allowedOrigins.indexOf(origin) !== -1) || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
exports.default = corsOptions;
