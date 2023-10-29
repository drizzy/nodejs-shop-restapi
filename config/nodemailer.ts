import { createTransport, TransportOptions } from 'nodemailer';

export const transporter = createTransport({
  service: `${process.env.MAIL_SMTP_SERVICE}`,
  host: `${process.env.MAIL_SMTP_HOST}`,
  port: `${process.env.MAIL_SMTP_PORT}`,
  secure: `${process.env.MAIL_SMTP_SECURE}`,
  auth: {
    user: `${process.env.MAIL_SMTP_USER}`,
    pass: `${process.env.MAIL_SMTP_PASS}`,
  },
  tls: {
    rejectUnauthorized: false
  }
} as TransportOptions);

transporter.verify()
  .then(() => {
    console.log('Server is ready to take our message.');
  })
  .catch((e) => {
    console.error('Error occurred while verifying the transporter: ', e);
  });