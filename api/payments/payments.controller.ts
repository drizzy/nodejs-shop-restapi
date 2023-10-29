import { Request, Response } from 'express';
import { pool } from '../../config/psql';
import { Payments } from './payments.interface';
import { httpError, sendRequest } from '../../utils/handleStatus';

const show = async (req: Request, res: Response) => {

  const id: Number = parseInt(req.params.id) as Number;

  try {

    const query = 'SELECT id, user_id, order_id, payment_method, payment_status, amount, amount_in_cents, created_at, updated_at FROM payments WHERE id = $1 RETURNING *;';
    
    const response = await pool.query(query, [id]);

    const payment: Array<Payments> = response.rows;

    if(payment === undefined || payment.length === 0) return httpError(res, 404, `Payment with ${id} no found`);

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, payment);

  } catch (e) {
    httpError(res, 500, 'Internal server error.')
  }

}

const showAll = async (req: Request, res: Response) => {

  try {

    const query = 'SELECT id, user_id, order_id, payment_method, payment_status, amount, amount_in_cents, created_at, updated_at FROM payments';
    
    const response = await pool.query(query);

    const payment: Array<Payments> = response.rows;

    if(!payment) return httpError(res, 404, `Payments no found`);

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, payment);

  } catch (e) {
    httpError(res, 500, 'Internal server error.')
  }

}

export default {show, showAll };