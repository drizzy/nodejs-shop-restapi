import { Request, Response } from 'express';
import { pool } from '../../config/psql';
import { Categories } from './categories.interface';
import { httpError, sendRequest } from '../../utils/handleStatus';

const show = async (req: Request, res: Response) =>{

  const id: number = parseInt(req.params.id);

  try {

    const response = await pool.query('SELECT * FROM categories WHERE id = $1;', [id]);

    const categorie: Array<Categories> = response.rows[0];

    if (categorie === undefined || categorie.length === 0) return httpError(res, 404, `Categories with ${id} not found`);

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, categorie);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

const showAll = async (req: Request, res: Response) =>{

  try {

    const response = await pool.query('SELECT * FROM categories');

    const categories: Array<Categories> = response.rows;

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, categories);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }
  
}

const create = async (req: Request, res: Response) =>{
  
  const { name } = req.body;

  try {

    const response = await pool.query('INSERT INTO categories (name, created_at, updated_at) VALUES ($1, $2, $3) RETURNING *;',[name, new Date(), new Date()]);

    const categorie: Categories = response.rows[0];

    sendRequest(res, 200, 'Created', `Result: ${response.rowCount}`, categorie)

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }
  
}

const update = async (req: Request, res: Response): Promise<void> =>{

  const id: number = parseInt(req.params.id);
  const { name } = req.body;

  try {

    const response = await pool.query('UPDATE categories SET name = $1 WHERE id = $2',[name, id]);

    const categories: Categories = response.rows[0];

    sendRequest(res, 200, 'Update', `Rol with id ${id} updated successfully.`, categories);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }
  
}

const destroy = async (req: Request, res: Response) =>{

  const id: number = parseInt(req.params.id);

  try {

    await pool.query('DELETE categories WHERE id = $1', [id]);
    sendRequest(res, 200, 'Delete', `categories with id ${id} removed successfully`);
  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }
  
}

export default { show, showAll, create, update, destroy };