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
exports.Auth = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
class Auth {
    constructor(persistence, cryptService, jwtService, mailService) {
        /**
         * @param {e.Request}req request object
         * @param {e.Response}res response object
         * @METHOD POST /v1/auth/signup
         * @desc Signs up a user.
         * - It assumes the email and password in the req.body are validated,
         * so no extra validation is done.
         */
        this.signup = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, email, password, referrer } = req.body;
            // confirm data
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json(errors);
                return;
            }
            // Check for duplicate
            const duplicate = yield this.persistence.findUserByEmail(email);
            if (duplicate) {
                res.status(409).json({ message: 'Duplicate mail' });
                return;
            }
            const hashPass = yield this.cryptService.encrypt(password);
            const userData = {
                firstName,
                lastName,
                email,
                password: hashPass,
                verified: false,
                role: 'USER'
            };
            const origin = req.get('origin');
            const newUser = yield this.persistence.createUser(userData, origin);
            const mailResponse = yield this.mailService.sendWelcomeMail(newUser);
            // if (!mailResponse.isSuccess) {
            //     const deleteResponse = await this.persistence.deleteUser(newUser.id!)
            //     res.status(mailResponse.statusCode).json({ message: mailResponse.message })
            //     return
            // }
            if (referrer)
                yield this.persistence.addReferral(req.params.referrer);
            if (newUser) { // created successfully
                res.status(201).json({ message: `Account created succesfully` });
            }
            else {
                res.status(400).json({ message: 'Invalid user data received' });
            }
        }));
        /**
         * @param {e.Request}req express request object
         * @param {e.Response}res express response object
         * @METHOD POST /v1/auth/login
         * @desc authorizes a user and responds with the user document object.
         * - It assumes the email and password in the req.body are validated,
         * so no extra validation is done.
         */
        this.login = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            // confirm data
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json(errors);
                return;
            }
            const [user, hash] = yield this.persistence.authenticate({ email });
            const isCorrectPassword = yield this.cryptService.compare(password, hash);
            if (!isCorrectPassword) {
                res.status(401).json({ message: 'Invalid details' });
                return;
            }
            const accessToken = this.jwtService.generateToken({
                "id": user.id,
                "role": user.role
            }, process.env.ACCESS_TOKEN_SECRET, 10 * 60);
            const refreshToken = this.jwtService.generateToken({ "id": user.id }, process.env.REFRESH_TOKEN_SECRET);
            // Create secure cookie with refresh token
            res.cookie('inv_jwt', refreshToken, {
                httpOnly: true,
                // secure: true, // https
                // sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.json({ accessToken, userId: user.id, role: user.role });
        }));
        /**
         * @param {e.Request}req express request object
         * @param {e.Response}res express response object
         * @METHOD POST /v1/auth/logout
         * @desc LOGOUT - clear cookie if it exists.
         * @access Public
         */
        this.logout = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const cookies = req.cookies;
            if (!cookies.inv_jwt) {
                res.sendStatus(204); // no content
                return;
            }
            res.clearCookie('inv_jwt', {
                httpOnly: true,
                // sameSite: 'none',
                // secure: true, //https
            });
            res.json({ message: 'Cookie cleared' });
        }));
        /**
         * @param {e.Request}req express request object
         * @param {e.Response}res express response object
         * @METHOD POST /v1/auth/refresh
         * @desc LOGOUT - refresh access token.
         * @access Public
         */
        this.refresh = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const cookies = req.cookies;
            if (!cookies.inv_jwt) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const refreshToken = cookies.inv_jwt;
            const decoded = this.jwtService.verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = yield this.persistence.findUserById(decoded.id);
            if (!user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const accessToken = this.jwtService.generateToken({
                "id": user.id,
                "role": user.role
            }, process.env.ACCESS_TOKEN_SECRET, 10 * 60);
            res.json({ accessToken, userId: user.id, role: user.role });
        }));
        /**
         * @param {e.Request}req express request object
         * @param {e.Response}res express response object
         * @METHOD POST /v1/auth/reset-password
         * @desc RESET PASSWORD.
         * @access Public
         */
        this.resetPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, currentPassword, newPassword, rePassword } = req.body;
            if (!email || !currentPassword || !newPassword || !rePassword) {
                res.status(400).json({ message: 'Incomplete details' });
                return;
            }
            if (newPassword !== rePassword) {
                res.status(400).json({ message: 'Passwords must match' });
                return;
            }
            const [user, hash] = yield this.persistence.authenticate({ email });
            const isCorrectPassword = (currentPassword === hash) || (yield this.cryptService.compare(currentPassword, hash));
            if (!isCorrectPassword) {
                res.status(401).json({ message: 'Invalid details' });
                return;
            }
            const hashPass = yield this.cryptService.encrypt(newPassword);
            yield this.persistence.updatePassword(user.id, hashPass);
            res.json({ message: 'Password changed successfully' });
        }));
        /**
         * @param {e.Request}req express request object
         * @param {e.Response}res express response object
         * @METHOD POST /v1/auth/reset-password
         * @desc SEND RESET PASSWORD URL.
         * @access Public
         */
        this.sendResetPassURL = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const [user, hash] = yield this.persistence.authenticate({ email });
            const resetPassToken = this.jwtService.generateToken({
                "email": user.email,
                "pass": hash
            }, process.env.RESET_PASSWORD_SECRET, 15 * 60);
            const origin = req.get('origin');
            const resetURL = `${origin}/reset-password/${resetPassToken}`;
            const sendStatus = yield this.mailService.sendPasswordResetMail(user.email, resetURL);
            res.json({ message: 'Mail sent successfully' });
        }));
        this.persistence = persistence;
        this.cryptService = cryptService;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
}
exports.Auth = Auth;
