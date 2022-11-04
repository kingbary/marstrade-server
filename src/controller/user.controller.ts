import e from "express"
import asyncHandler from "express-async-handler"
import { ID } from "../models/types"
import { IMongoService } from "../services/db.service"


export interface IUserController {
    deleteUser: e.RequestHandler,
    getAllUsers: e.RequestHandler,
    updateAvatar: e.RequestHandler,
}

export class UserController implements IUserController {
    private readonly persistence

    constructor(persistence: IMongoService) {
        this.persistence = persistence
    }

    /**
     * @param {e.Request}req express request object
     * @param {e.Response}res express response object
     * @METHOD DELETE /v1/user/:userId
     * @desc Deletes a single user.
     */
    deleteUser = asyncHandler(async (req, res) => {
        const userId: ID = req.params.userId

        await this.persistence.deleteUser(userId)

        res.json({ message: `User ${userId} deleted successfully` })
    })

    /**
     * @param {e.Request}req request object
     * @param {e.Response}res response object
     * @METHOD GET /v1/user/get-all
     * @desc Retrieves data for all users for ADMIN.
     */
    getAllUsers = asyncHandler(async (req, res) => {
        const users = await this.persistence.getAllUsers()
        res.json(users)
    })

    /**
     * @param {e.Request}req request object
     * @param {e.Response}res response object
     * @METHOD PUT /v1/user/:userId
     * @desc Updates a user profile.
     */
    updateAvatar = asyncHandler(async (req, res) => {
        const { avatar } = req.body
    })
}
