import { Response } from 'express';
import AuthenticatedRequest from '../../interface/AuthenticatedRequest';
import { pool } from '../../config/psql';
import { Address } from './address.interface';
import { httpError, sendRequest } from '../../utils/handleStatus';

const show = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const id: number = parseInt(req.params.id);
  const user: any = req.user;

  try {

    const response = await pool.query('SELECT * FROM address WHERE user_id = $1 AND id = $2', [user.id, id]);

    const address: Array<Address> = response.rows[0];

    if(address === undefined || address.length === 0) return httpError(res, 404, `There is no address with this id ${id}`);

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, address);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

const showAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const user: any = req.user;

  try {

    const response = await pool.query('SELECT * FROM address WHERE user_id = $1', [user.id]);

    const address: Array<Address> = response.rows;

    if(address.length === 0) return httpError(res, 404, 'No address registered.');

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, address);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }
  
}

const create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const user: any = req.user;

  const { fullname, phone, country, address, city, state, postal_code } = req.body;

  try {

    const query = 'INSERT INTO address (user_id, fullname, phone, country, address, city, state, postal_code, created_at, update_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;';
    const value = [user.id, fullname, phone, country, address, city, state, postal_code, new Date(), new Date()];

    const response = await pool.query(query, value);

    const addressResult: Address = response.rows[0];

    sendRequest(res, 200, 'Created', `Result: ${response.rowCount}`, addressResult);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }
  
}

const update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const user: any = req.user;
  const id: number = parseInt(req.params.id);

  const { fullname, phone, country, address, city, state, postal_code } = req.body;

  try {
        
    const query = 'UPDATE address SET fullname = $1, phone = $2, country = $3, address = $4, city = $5, state = $6, postal_code = $7, update_at = $8 WHERE id = $9 AND user_id = $10 RETURNING *;';
    
    const values = [fullname, phone, country, address, city, state, postal_code, new Date(), id, user.id];
    
    const response = await pool.query(query, values);

    if (response.rowCount === 0) return httpError(res, 404, 'The address to update was not found.');
    
    const addressResult: Address = response.rows[0];
    
    sendRequest(res, 200, 'Updated', `Address with id ${id} updated successfully.`, addressResult);
    
  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }
  
}

const destroy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const user: any = req.user;
  
  const id: number = parseInt(req.params.id);

  try {

    const response = await pool.query('DELETE FROM address WHERE id = $1 AND user_id = $2', [id, user.id]);
    
    if(response.rowCount === 0) return httpError(res, 404, 'The address to delete was not found.');
    
    sendRequest(res, 200, 'Removed', `Address whith id ${id} removed successfully`);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }
  
}

export default { show, showAll, create, update, destroy };