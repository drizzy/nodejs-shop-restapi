import AuthenticatedRequest from '../../interface/AuthenticatedRequest';
import { Response } from 'express';
import { pool } from '../../config/psql';
import { User } from '../../api/users/users.interface';
import { encrypt } from '../../utils/handleBcrypt';
import { activationPin, sendActivationPin } from '../../utils/handlePin';
import { tokenSign } from '../../utils/handleToken';
import { httpError, sendRequest } from '../../utils/handleStatus';
import { CustomError } from '../../utils/CustomError';

const register = async (req: AuthenticatedRequest, res: Response) => {

  const { name, lastname, username, email, phone, password } = req.body;

  try {

    const passHash = await encrypt(password);

    const pin = activationPin();

    const usersCountQuery = 'SELECT COUNT(*) FROM users';

    const usersCountResponse = await pool.query(usersCountQuery);

    const usersCount = parseInt(usersCountResponse.rows[0].count);

    let role = [];

    if(usersCount === 0){
      role = ['SUPER_ADMIN', 'ADMIN'];
    }else{
      role = ['USER'];
    }

    const query = `INSERT INTO users (name, lastname, username, email, phone, password, role, activation_pin, created_at, update_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;`;

    const values = [name, lastname, username, email, phone, passHash, role, pin, new Date(), new Date()];

    const response = await pool.query(query, values);
    
    const user: Array<User> = response.rows;

    await sendActivationPin(email, name,  pin);

    const userWithout = { ...user[0] };
    delete userWithout.is_active;
    delete userWithout.activated_at;
    delete userWithout.activation_pin;
    delete userWithout.is_pin_used;
    delete userWithout.password;

    sendRequest(res, 201, 'Success', `User was registered successfully! Please check your email`, userWithout);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

const login = async (req: AuthenticatedRequest, res: Response) => {

  const user: any = req.user;

  try {

    const token = await tokenSign(user);

    if (!user.is_active) {

      const error = new CustomError('Pending Account. Please verify your email!', token);
      throw error;
    }

    const userWithout = { ...user };
    
    delete userWithout.password;
      
    sendRequest(res, 202, 'Success', token, userWithout);

  } catch (e) {
    res.status( 500).json({error: e.message, token: e.token});
  }

}

const activate = async (req: AuthenticatedRequest, res: Response) => {

  const user = req.user;
  const pin = req.body.pin;

  try {

    const query = 'UPDATE users SET activated_at = $1, is_active = true, is_pin_used = true WHERE id = $2 AND activation_pin = $3 AND NOT is_pin_used';

    const response = await pool.query(query, [new Date(), user.id, pin]);

    if(response.rowCount === 0) return httpError(res, 400, 'Invalid activation pin.');

    sendRequest(res, 200, 'Success', 'Account activated successfully.');

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }
  
}

export default { register, login, activate };