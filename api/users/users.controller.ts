import { Request, Response } from 'express';
import AuthenticatedRequest from '../../interface/AuthenticatedRequest';
import { pool } from '../../config/psql';
import { User } from './users.interface';
import { allowedRolesArr } from '../../utils/allowedRoles';
import { encrypt } from '../../utils/handleBcrypt';
import { activationPin, sendActivationPin } from '../../utils/handlePin';
import { httpError, sendRequest } from '../../utils/handleStatus';

const show = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const user: any =  req.user;

  const id: number = parseInt(req.params.id);

  try {

    const query = `SELECT 
                    users.id, 
                    users.name, 
                    users.lastname, 
                    users.username, 
                    users.email, 
                    users.phone, 
                    users.password, 
                    role, 
                    users.activation_pin, 
                    users.activated_at, 
                    users.is_active, 
                    users.created_at, 
                    users.update_at, 
                    users.is_pin_used 
                  FROM 
                    users 
                  WHERE id = $1 AND id = $2`;

    const response = await pool.query(query, [id, user.id]);

    const userResponse: Array<User> = response.rows;

    if(userResponse.length === 0) return httpError(res, 404, `User with id ${id} not found.`);

    sendRequest(res, 200,  'Success', `Result: ${response.rowCount}`, userResponse[0]);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

const showAll = async (req: Request, res: Response): Promise<void> =>{

  try {

    const query  = `SELECT id, name, lastname, username, email, phone, password, role, activation_pin, activated_at, is_active, is_pin_used, created_at, update_at FROM users;`

    const response = await pool.query(query);

    const users: Array<User> = response.rows;

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, users);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

const create = async (req: Request, res: Response): Promise<void> => {

  const { name, lastname, username, email, phone, password, role } = req.body;

  try {

    const passHash = await encrypt(password);
  
    const pin = activationPin();

    if (!role.every((r: any) => allowedRolesArr.includes(r))) return httpError(res, 400, 'Invalid role.');
      
    const query = 'INSERT INTO users (name, lastname, username, email, phone, password, role, activation_pin, created_at, update_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;';
      
    const response = await pool.query(query, [name, lastname, username, email, phone, passHash, role, pin, new Date(), new Date()]);

    const user: User = response.rows[0];

    await sendActivationPin(email, name, pin);
  
    sendRequest(res, 201, 'Created', `User with id ${user[0].id} created successfully.`, user);  

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }
  
};

const update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const user = req.user;

  const id: number = parseInt(req.params.id);

  const { name = user.name, lastname = user.lastname, username = user.username, email = user.email, phone = user.phone, password = user.password, role = user.role } = req.body;
  
  try {

    if (!role.every((r: any) => allowedRolesArr.includes(r))) return httpError(res, 400, 'Invalid role.');
    
    const passHash = await encrypt(password || '');

    const query = `UPDATE users SET name = $1, lastname = $2, username = $3, email = $4, phone = $5, ${passHash ? 'password = $6,' : ''} ${role ? 'role = $7,' : ''} update_at = $8 WHERE id = $9 AND id = $10 RETURNING *;`;
    
    const values = [name, lastname, username, email, phone, passHash || null, role || null, new Date(), id, user.id];

    const response = await pool.query(query, values);

    if (response.rowCount === 0) return httpError(res, 404, 'The user to update was not found.');

    const updatedUser: User = response.rows[0];

    sendRequest(res, 200, 'Updated', `User with id ${id} updated successfully.`, updatedUser);

  } catch (e) {
    console.log(e);
    httpError(res, 500, 'Internal Server Error.');
  }
  
}

const remove = async (req: AuthenticatedRequest, res: Response): Promise<void> =>{

  const user = req.user;

  const { id } = req.params;

  try {

    const response = await pool.query('UPDATE users SET is_active = false WHERE id = $1 AND id = $2 AND is_active = true', [id, user.id]);

    if(response.rowCount === 0) return httpError(res, 404, `User with id ${id} not found`);

    sendRequest(res, 200, 'Removed', `User with id ${id} removed successfully`);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

export default { show, showAll, create,  update, remove };