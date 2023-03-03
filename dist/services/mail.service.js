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
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailTemplates_1 = require("./mailTemplates");
class MailService {
    constructor(service, authUser, authPassword, SMTP_PORT) {
        this.sendMail = (to, subject, html) => __awaiter(this, void 0, void 0, function* () {
            try {
                const mailRequest = yield this.transporter.sendMail({ from: this.authUser, to, subject, html });
                return mailRequest;
            }
            catch (err) {
                console.log(err);
                throw new Error(`An error occured while sending mail to ${to}.`);
            }
        });
        this.sendWelcomeMail = (user) => __awaiter(this, void 0, void 0, function* () {
            const to = user.email;
            const firstName = user.firstName || "there";
            const verificationMail = `
            <html>
                <body style="font-family: verdana sans-serif;">
                    <h3>Hello ${firstName}</h3>
                    <p>Please confirm your email by clicking the button below.</p>

                    <button style="background: teal; color: white; border: 0px solid teal; 
                        border-radius: 5px; padding: 10px;">
                            <a href="" style="color: inherit;
                            text-decoration: none;">Verify</a>
                        </button>
                    <p>Didn't sign up for our mail, Please email us at ...</p>
                </body>
            </html>`;
            try {
                const sendMail = yield this.sendMail(to, "WELCOME TO Marstrade", verificationMail);
                process.env.NODE_ENV === 'development' && console.log(sendMail);
                return {
                    isSuccess: true,
                    message: "Mail sent succesfully",
                    statusCode: 200,
                };
            }
            catch (err) {
                return {
                    isSuccess: false,
                    message: "Email verification failed",
                    statusCode: 500,
                };
            }
        });
        this.sendPasswordResetMail = (email, url) => __awaiter(this, void 0, void 0, function* () {
            const to = email;
            const passwordResetMail = `
            <html>
                <body style="font-family: verdana sans-serif;">
                    <h3>Hello there</h3>
                    <p>Please confirm your email by clicking the button below.</p>

                    <button style="background: teal; color: white; border: 0px solid teal; 
                        border-radius: 5px; padding: 10px;">
                        <a href=${url} style="color: inherit;
                        text-decoration: none;">Reset password</a>
                    </button>
                    <p>Didn't sign up for our mail, Please email us at ...</p>
                </body>
            </html>`;
            try {
                const sendMail = yield this.sendMail(to, "RESET PASSWORD", passwordResetMail);
                process.env.NODE_ENV === 'development' && console.log(sendMail);
                return {
                    isSuccess: true,
                    message: "Mail sent succesfully",
                    statusCode: 200,
                };
            }
            catch (error) {
                return {
                    isSuccess: false,
                    message: "Email verification failed",
                    statusCode: 500,
                };
            }
        });
        this.sendDepositConfirmMail = (payload) => __awaiter(this, void 0, void 0, function* () {
            const to = payload.email;
            try {
                const depositConfirmMail = mailTemplates_1.depositConfirmedTemplate
                    .replace(/<<USER>>/gi, payload.firstName)
                    .replace(/<<AMOUNT>>/gi, payload.amount)
                    .replace(/<<METHOD>>/gi, payload.method)
                    .replace(/<<PLAN>>/gi, payload.invPlan)
                    .replace(/<<PACKAGE>>/gi, payload.invPackage)
                    .replace(/<<ROI>>/gi, payload.ROI);
                const sendMail = yield this.sendMail(to, "DEPOSIT CONFIRMATION", depositConfirmMail);
                process.env.NODE_ENV === 'development' && console.log(sendMail);
                return {
                    isSuccess: true,
                    message: "Mail sent succesfully",
                    statusCode: 200,
                };
            }
            catch (error) {
                return {
                    isSuccess: false,
                    message: "Email verification failed",
                    statusCode: 500,
                };
            }
        });
        this.sendDepositNotifyMail = (payload) => __awaiter(this, void 0, void 0, function* () {
            const to = payload.email;
            try {
                const depositNotifyMail = mailTemplates_1.depositNotifyTemplate
                    .replace(/<<USER>>/gi, payload.firstName)
                    .replace(/<<AMOUNT>>/gi, payload.amount)
                    .replace(/<<METHOD>>/gi, payload.method)
                    .replace(/<<PLAN>>/gi, payload.invPlan)
                    .replace(/<<PACKAGE>>/gi, payload.invPackage)
                    .replace(/<<ROI>>/gi, payload.ROI);
                const sendMail = yield this.sendMail(to, "NOTIFICATION OF DEPOSIT", depositNotifyMail);
                process.env.NODE_ENV === 'development' && console.log(sendMail);
                return {
                    isSuccess: true,
                    message: "Mail sent succesfully",
                    statusCode: 200,
                };
            }
            catch (error) {
                return {
                    isSuccess: false,
                    message: "Email verification failed",
                    statusCode: 500,
                };
            }
        });
        this.authUser = authUser;
        // Using gmail transport
        this.transporter = nodemailer_1.default.createTransport({
            service: service,
            auth: {
                user: authUser,
                pass: authPassword,
            },
        });
        // Using cpanel transport
        // this.transporter = nodemailer.createTransport({
        //     host: service,
        //     port: SMTP_PORT,
        //     secure: true, // true for 465, false for other ports
        //     auth: {
        //       user: authUser, // generated ethereal user
        //       pass: authPassword, // generated ethereal password
        //     }
        //   })
    }
}
exports.default = MailService;
