import { Request, Response } from 'express';
import { pool } from '../../config/psql';
import { httpError } from '../../utils/handleStatus';
import { User } from '../../api/users/users.interface';
import { sendRequest } from '../../utils/handleStatus';
import { 
  generateResetToken, 
  storeResetTokenInDatabase,
  verifyResetToken, 
  sendPassReset, 
  updatePassword, 
  deleteResetToken } from '../../utils/handleResetPassword';

const TOKEN_EXPIRY_DURATION = 36000000;

const PROCESS = process.env;

const check = async (req: Request, res: Response): Promise<void> => {

  const email : string = req.body.email;

  try {

    const response = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    
    const result: Array<User> = response.rows;

    if(result.length === 0) return httpError(res, 404, `User with email ${email} not found.`);

    const resetToken = generateResetToken();

    const resetTokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_DURATION);

    await storeResetTokenInDatabase(email, resetToken, resetTokenExpiry);

    const resetLink = `${PROCESS.BASE_URL}/${PROCESS.API_VERSION}/change-passwd/reset?token=${resetToken}`;
    
    await sendPassReset(email, resetLink);

    sendRequest(res, 200, 'Created', 'Password reset link sent successfully.');

  } catch (e) {
    httpError(res, 500, 'Server internal error.');
  }

}

const reset = async (req: Request, res: Response): Promise<void> => {

  const token: string = req.query.token as string;

  const {  password, repetPassword }: any = req.body;

  try {
    
    if (password !== repetPassword)  return httpError(res, 400, 'Passwords do not match.');
    
    const { email, tokenExpiry } = await verifyResetToken(token);

    if(tokenExpiry < new Date()) return httpError(res, 400, 'Reset token has expired.');

    await updatePassword(email, password);

    await deleteResetToken(email);

    sendRequest(res, 200, 'Updated', 'Password updated successfully');

  } catch (e) {
    httpError(res, 500, 'Error internal server.');
  }

}

export default { check, reset };