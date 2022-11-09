import asyncHandler from "express-async-handler"
import JWTService from "../services/JWT.service"

const jwtService = new JWTService()

const verifyJWT = asyncHandler((req, res, next) => {
    const authHeader = <string>(req.headers.authorization || req.headers.Authorization)

    if (!authHeader) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }

    if (!authHeader.startsWith('Bearer ')) {
        res.status(403).json({ message: 'Forbidden' })
        return
    }

    const token  = authHeader.split(' ')[1]
    const decoded = jwtService.verifyToken(token, process.env.ACCESS_TOKEN_SECRET!)
    // @ts-ignore
    req.user = decoded
    next()
})

export default verifyJWT