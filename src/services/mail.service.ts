import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { IUser } from '../models/types'

export interface IMailService {
    sendMail: (to: string, subject: string, html: string) => Promise<SMTPTransport.SentMessageInfo | {
        error: string;
    }>;
    sendWelcomeMail: (user: IUser) => Promise<SMTPTransport.SentMessageInfo | {
        error: string;
    }>;
    sendPasswordResetMail: (email: string, url: string) => Promise<SMTPTransport.SentMessageInfo | {
        error: string;
    }>;
}

class MailService implements IMailService {
    private service
    private authUser
    private authPassword
    private transporter

    constructor(service: string, authUser: string, authPassword: string) {
        this.service = service
        this.authUser = authUser
        this.authPassword = authPassword

        this.transporter = nodemailer.createTransport({
            service: this.service,
            auth: {
                user: this.authUser,
                pass: this.authPassword,
            },
        } as SMTPTransport.Options)
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
            const sendMail = await this.sendMail(to, "WELCOME TO MARSTRADE", verificationMail)
            return sendMail
        } catch (err) {
            throw new Error("Email verification failed")
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
}

export default MailService