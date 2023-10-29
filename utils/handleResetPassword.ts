import { v4 as uuidv4 } from 'uuid';
import { ResetToken, TokenInfo } from '../interface/ResetToken';
import { pool } from '../config/psql';
import { transporter } from '../config/nodemailer';
import { encrypt } from './handleBcrypt';

export const generateResetToken = (): string => {

 const token = uuidv4();

 return token;

}

export const storeResetTokenInDatabase = async (email: string, token: string, expire: Date): Promise<void> => {

  const resetTokenData: ResetToken = {
    email,
    token,
    expire,
  };

  const query = `UPDATE users SET reset_token = $1, reset_token_expire = $2 WHERE email = $3`;

  try {

    await pool.query(query, [resetTokenData.token, resetTokenData.expire, resetTokenData.email]);

  } catch (e) {

    throw new Error('Error storing reset token in the database: ' + e.message);
    
  }

}

export const verifyResetToken = async (token: string): Promise<TokenInfo> => {

  const query = 'SELECT email, reset_token_expire FROM users WHERE reset_token = $1';
  
  try {

    const { rows } = await pool.query(query, [token]);

    if (rows.length === 0)  throw new Error('Token not found or expired');
        
    const { email, reset_token_expire: tokenExpiry } = rows[0];
    
    if (tokenExpiry === null || tokenExpiry === undefined || tokenExpiry < new Date()) throw new Error('Token has expired');

    return { email, tokenExpiry };

  } catch (e) {
    return { email: '', tokenExpiry: null };
  }

}

export const sendPassReset = async (email: string, url: string) => {

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Password reset</title> 
  </head>
  <body>
    <a href="${url}">Restablecer la contraseña</a>
  </body>
  </html>
  `
  const mailOptions = {
      from: `${process.env.MAIL_SMTP_FROM}`,
      to: email,
      subject: `Password reset.`,
      html: html
  }

  await transporter.sendMail(mailOptions);
}

export const updatePassword = async  (email: string, newPassword: string): Promise<void> => {

  try {

    const hashedPassword = await encrypt(newPassword);
    
    const query = `UPDATE users SET password = $1 WHERE email = $2`;

    await pool.query(query, [hashedPassword, email]);

    return;

  } catch (e) {

    throw new Error('Error updating password: ' + e.message);

  }

}

export const deleteResetToken = async (email: string): Promise<void> => {

  try {

    const query = `UPDATE users SET reset_token = NULL, reset_token_expire = NULL WHERE email = $1`;

    await pool.query(query, [email]);

  } catch (e) {

    throw new Error('Error deleting reset token: ' + e.message);

  }

}