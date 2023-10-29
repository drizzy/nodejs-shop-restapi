import { Request, Response } from 'express';
import { pool } from '../../config/psql';
import { Brands } from './brands.interface';
import { httpError, sendRequest } from '../../utils/handleStatus';

const show = async (req: Request, res: Response): Promise<void> => {

  const id: number = parseInt(req.params.id);

  try {

    const response = await pool.query('SELECT * FROM brands WHERE id = $1', [id]);

    if(response.rowCount === 0) return httpError(res, 500, 'This brand does not exist');

    const brand: Array<Brands> = response.rows[0];

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, brand);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

const showAll = async (req: Request, res: Response): Promise<void> => {

  try {

    const response = await pool.query('SELECT * FROM brands');
    
    const brands: Array<Brands> = response.rows;

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, brands)

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

const create = async (req: Request, res: Response): Promise<void> => {

  const { name } = req.body;

  try {

    const response = await pool.query('INSERT INTO brands (name, created_at, updated_at) VALUES ($1, $2, $3) RETURNING *;', [name, new Date(), new Date()]);

    const brand: Array<Brands> = response.rows[0];

    sendRequest(res, 201, 'Created', `Result: ${response.rowCount}`, brand);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

const update = async (req: Request, res: Response): Promise<void> => {

  const id: number = parseInt(req.params.id);

  const { name } = req.body;

  try {

    const response = await pool.query('UPDATE brands SET name = $1 WHERE id = $2', [name, id]);

    const brand: Array<Brands> = response.rows[0];

    sendRequest(res, 200, 'Updated', `Brand with id ${id} updated successfully.`, brand);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

const destroy = async (req: Request, res: Response): Promise<void> => {
  
  const id: number =  parseInt(req.params.id);

  try {

   const response = await pool.query('DELETE * FROM brands WHERE id = $1', [id]);

   const brand: Array<Brands> = response.rows;

   sendRequest(res, 200, 'Removed', `Brand with id ${id} removed successfully.`, brand);
    
  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

export default { show, showAll, create, update, destroy };