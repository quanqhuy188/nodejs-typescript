import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'
import path from 'path'
import { ExpressHandlebars } from 'express-handlebars'
import { config } from 'dotenv'
import tokenService from './tokenService'
import { TokenType } from '@/constants/enum'

config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASSWORD as string
  }
})

const hbsOptions = {
  viewEngine: new ExpressHandlebars({
    defaultLayout: false
  }),
  viewPath: path.resolve(__dirname, '../templates/'),
  extName: '.hbs'
}

transporter.use('compile', hbs(hbsOptions))

interface SendEmailOptions {
  to: string
  subject: string
  template: string
  context: any
}

class EmailService {
  private async sendEmail(options: SendEmailOptions): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER as string,
      to: options.to,
      subject: options.subject,
      template: options.template,
      context: options.context
    }

    try {
      const info = await transporter.sendMail(mailOptions)
      console.log('Email sent:', info.response)
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  public async sendVerificationEmail(user_id: string, email: string, name: string): Promise<string> {
    const signEmail = await tokenService.handleSignToken(user_id, TokenType.EmailVerifyToken, '2m')

    await this.sendEmail({
      to: email,
      subject: 'Xác nhận email của bạn',
      template: 'sendEmail',
      context: {
        name: name ? name : email,
        verificationLink: `${process.env.VERIFY_EMAIL_URL}/?token=${signEmail}`
      }
    })
    return signEmail
  }
  public async sendForgotPasswordEmail(user_id: string, email: string, name: string): Promise<string> {
    const signFP = await tokenService.handleSignToken(user_id, TokenType.ForgotPasswordToken, '60m')

    await this.sendEmail({
      to: email,
      subject: 'Đặt lại mật khẩu của bạn',
      template: 'sendForgotPassword',
      context: {
        name: name ? name : email,
        verificationLink: `${process.env.VERIFY_FORGOT_PW_URL}/?token=${signFP}`
      }
    })
    return signFP
  }
}

const emailService = new EmailService()
export default emailService
