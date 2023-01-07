import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { IMailData, IServiceResponse, IUser } from '../models/types'
import { depositConfirmedTemplate, depositNotifyTemplate } from './mailTemplates'

export interface IMailService {
    sendMail: (to: string, subject: string, html: string) => Promise<SMTPTransport.SentMessageInfo>;
    sendWelcomeMail: (user: IUser) => Promise<IServiceResponse>;
    sendPasswordResetMail: (email: string, url: string) => Promise<SMTPTransport.SentMessageInfo>;
    sendDepositConfirmMail: (payload: IMailData) => Promise<SMTPTransport.SentMessageInfo>;
    sendDepositNotifyMail: (payload: IMailData) => Promise<SMTPTransport.SentMessageInfo>;
}

class MailService implements IMailService {
    private authUser
    private transporter

    constructor(service: string, authUser: string, authPassword: string, SMTP_PORT: number) {
        this.authUser = authUser

        // Using gmail transport
        this.transporter = nodemailer.createTransport({
            service: service,
            auth: {
                user: authUser,
                pass: authPassword,
            },
        } as SMTPTransport.Options)
        
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

    sendMail = async (to: string, subject: string, html: string) => {
        try {
            const mailRequest = await this.transporter.sendMail({ from: this.authUser, to, subject, html })
            return mailRequest
        } catch (err) {
            console.log(err)
            throw new Error(`An error occured while sending mail to ${to}.`)
        }
    }

    sendWelcomeMail = async (user: IUser) => {
        const to = user.email
        const firstName = user.firstName || "there"
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
            </html>`
        try {
            const sendMail = await this.sendMail(to, "WELCOME TO Marstrade", verificationMail)
            process.env.NODE_ENV === 'development' && console.log(sendMail)
            return {
                isSuccess: true,
                message: "Mail sent succesfully",
                statusCode: 200,
            }
        } catch (err) {
            return {
                isSuccess: false,
                message: "Email verification failed",
                statusCode: 500,
            }
        }
    }

    sendPasswordResetMail = async (email: string, url: string) => {
        const to = email
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
            </html>`

        try {
            const sendMail = await this.sendMail(to, "RESET PASSWORD", passwordResetMail)
            return sendMail
        } catch (error) {
            throw new Error("Mail not sent")
        }
    }

    sendDepositConfirmMail = async (payload: IMailData) => {
        const to = payload.email
        try {
            const depositConfirmMail = depositConfirmedTemplate
                .replace(/<<USER>>/gi, payload.firstName)
                .replace(/<<AMOUNT>>/gi, payload.amount)
                .replace(/<<METHOD>>/gi, payload.method)
                .replace(/<<PLAN>>/gi, payload.invPlan)
                .replace(/<<PACKAGE>>/gi, payload.invPackage)
                .replace(/<<ROI>>/gi, payload.ROI)
            const sendMail = await this.sendMail(to, "DEPOSIT CONFIRMATION", depositConfirmMail)
            return sendMail
        } catch (error) {
            throw new Error("Mail not sent")
        }
    }

    sendDepositNotifyMail = async (payload: IMailData) => {
        const to = payload.email
        try {
            const depositNotifyMail = depositNotifyTemplate
                .replace(/<<USER>>/gi, payload.firstName)
                .replace(/<<AMOUNT>>/gi, payload.amount)
                .replace(/<<METHOD>>/gi, payload.method)
                .replace(/<<PLAN>>/gi, payload.invPlan)
                .replace(/<<PACKAGE>>/gi, payload.invPackage)
                .replace(/<<ROI>>/gi, payload.ROI)
            const sendMail = await this.sendMail(to, "NOTIFICATION OF DEPOSIT", depositNotifyMail)
            return sendMail
        } catch (error) {
            throw new Error("Mail not sent")
        }
    }
}

export default MailService