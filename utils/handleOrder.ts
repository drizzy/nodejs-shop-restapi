import { transporter } from '../config/nodemailer';

export const confirmedOrder = async (email: string, subject: string, message?: any) => {

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title> 
  </head>
  <body>
    <p>${message}</p>
  </body>
  </html>
  `
  const mailOptions = {
    from: `${process.env.MAIL_SMTP_FROM}`,
    to: email,
    subject: subject,
    html: html
  }

  await transporter.sendMail(mailOptions);

}