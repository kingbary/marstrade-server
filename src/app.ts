import path from "path"

import express from "express"
import cors from "cors"
import cookieParser from 'cookie-parser'

import rootRoute from "./routes/root.route"
import authRoute from "./routes/auth.route"
import dashboardRoute from "./routes/dashboard.route"
import investmentRoute from "./routes/investment.route"
import walletRoute from "./routes/wallet.route"
import userRoute from "./routes/user.route"
import { errHandler } from "./middleware/errorHandler"
import corsOptions from "./config/corsOptions"

export const app = express()

// built-in middlewre for receiving and parsing json data.
app.use(express.json())

// built-in middleware for serving static files (CSS).
app.use('/', express.static(path.join(__dirname, '..', 'public')))

// 3rd party middleware for handling cors.
app.use(cors(corsOptions))

// 3rd party middleware for handling cookies.
app.use(cookieParser())

// Route handlers
// app.use('/', rootRoute) // home route
app.use('/v1/auth', authRoute) // home route
app.use('/v1/dashboard', dashboardRoute) // get dashboard
app.use('/v1/investment', investmentRoute) // transactions (make investment, make withrawal, get history)
app.use('/v1/user', userRoute) // account profile ( see users, delete user, update profile, update avatar, change password)
app.use('/v1/wallet', walletRoute) // add wallet, remove wallet

// SERVE REACT BUILD AS A STATIC FILE.
app.use(express.static(path.join(__dirname, '..', 'build')))

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.all('*', (req, res) => { // send 404
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, '..', 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

// error handling middleware
app.use(errHandler)