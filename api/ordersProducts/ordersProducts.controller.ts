import { Request, Response } from 'express';
import { pool } from '../../config/psql';
import { httpError, sendRequest } from '../../utils/handleStatus';
import { Orders } from '../orders/orders.interface';

const show = async(req: Request, res: Response) => {

  const id: Number = parseInt(req.params.id) as Number;

  try {

    const query = 'SELECT * FROM orders_products WHERE id = $1'

    const response = await pool.query(query, [id]);

    const order: Array<Orders> =  response.rows;

    if(order === undefined || order.length === 0) return httpError(res, 404,`Order with ${id} not found.`);

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, order);
  } catch (e) {
    httpError(res, 500, 'Internal server error.')
  }

}

const showAll = async(req: Request, res: Response) => {

  try {

    const query = 'SELECT * FROM orders_products'

    const response = await pool.query(query);

    const orders: Array<Orders> =  response.rows;

    if(!orders) return httpError(res, 404,`Order not found.`);

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, orders);
  } catch (e) {
    httpError(res, 500, 'Internal server error.' + e)
  }
  
}

export default { show, showAll };