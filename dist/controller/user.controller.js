"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
class UserController {
    constructor(persistence, objService) {
        /**
         * @param {e.Request}req express request object
         * @param {e.Response}res express response object
         * @METHOD DELETE /v1/user/:userId
         * @desc Deletes a single user.
         */
        this.addKYC = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.userId;
            const [front, back] = req.files;
            const { country, DOB, IDType } = req.body;
            const { message, imageURL, statusCode, isSuccess } = yield this.objService.uploadImage(front.path, `${IDType}_front`, userId);
            const { message: messageBack, imageURL: imageURLBack, statusCode: statusCodeBack, isSuccess: isSuccessBack } = yield this.objService.uploadImage(back.path, `${IDType}_back`, userId);
            if (!isSuccess || !imageURL) {
                res.status(statusCode).json({ message });
                return;
            }
            if (!isSuccessBack || !imageURLBack) {
                res.status(statusCodeBack).json({ message: messageBack });
                return;
            }
            const KYCData = {
                country,
                DOB,
                IDType,
                IDFront: imageURL,
                IDBack: imageURLBack
            };
            const success = yield this.persistence.addKYC(userId, KYCData);
            if (!success) {
                res.sendStatus(500);
                return;
            }
            res.json({ message: `KYC data uploaded successfully` });
        }));
        /**
         * @param {e.Request}req express request object
         * @param {e.Response}res express response object
         * @METHOD DELETE /v1/user/:userId
         * @desc Deletes a single user.
         */
        this.deleteUser = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.userId;
            const { message, statusCode } = yield this.persistence.deleteUser(userId);
            res.status(statusCode).json({ message });
        }));
        /**
         * @param {e.Request}req request object
         * @param {e.Response}res response object
         * @METHOD GET /v1/user/get-all
         * @desc Retrieves data for all users for ADMIN.
         */
        this.getAllUsers = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const users = yield this.persistence.getAllUsers();
            res.json(users);
        }));
        /**
         * @param {e.Request}req request object
         * @param {e.Response}res response object
         * @METHOD PUT /v1/user/:userId
         * @desc Updates a user profile.
         */
        this.updateAvatar = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { userId } = req.params;
            const localPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
            const { message, imageURL, statusCode, isSuccess } = yield this.objService.uploadImage(localPath, 'avatar', userId);
            if (!isSuccess || !imageURL) {
                res.status(statusCode).json({ message });
                return;
            }
            yield this.persistence.updateAvatar(userId, imageURL);
            res.status(statusCode).json({ message });
        }));
        /**
         * @param {e.Request}req request object
         * @param {e.Response}res response object
         * @METHOD PUT /v1/user/:userId
         * @desc Updates a user profile.
         */
        this.verifyUser = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const { statusCode, message } = yield this.persistence.verifyUser(userId);
            res.status(statusCode).json({ message });
        }));
        this.persistence = persistence;
        this.objService = objService;
    }
}
exports.UserController = UserController;
