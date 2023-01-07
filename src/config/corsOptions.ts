import { CorsOptions } from "cors"

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    `https://bitsolutionfx-wbpdf.ondigitalocean.app`, // production URL
    `https://dashboard.marstrade.org`, // production URL
    `https://www.${process.env.BASE_URL}`, // production URL
    `https://${process.env.BASE_URL}`, // production URL
]

const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        if ((origin && allowedOrigins.indexOf(origin) !== -1) || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

export default corsOptions