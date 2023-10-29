import { Response } from 'express';
import AuthenticatedRequest from '../../interface/AuthenticatedRequest';
import { pool } from '../../config/psql';
import { sendRequest, httpError } from '../../utils/handleStatus';
import { Orders } from './orders.interface';

const show = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const user: any = req.user;

  const id: number = parseInt(req.params.id);

  try {

    const query = `SELECT
                     orders.id,
                     orders.user_id, 
                     json_agg(directions) AS direction,
                     payments.payment_method,
                     orders.total_price,
                     orders.status
                    FROM
                      orders
                    JOIN
                      payments ON orders.id = payments.order_id
                    JOIN
                      directions ON orders.user_id = directions.user_id
                    WHERE
                      orders.id = $1 
                    AND 
                      orders.user_id = $2
                    GROUP BY
                      orders.id,
                      orders.user_id, 
                      payments.payment_method,
                      orders.total_price, 
                      orders.status`
                      
    const response = await pool.query(query, [id, user.id]);

    const order: Array<Orders> = response.rows[0];

    if(!order) return httpError(res, 404, 'Order not found');

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, order);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

const showAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const user = req.user;

  try {

    const query = `SELECT
                     orders.id,
                     orders.user_id, 
                     json_agg(directions) AS direction,
                     payments.payment_method,
                     orders.total_price,
                     orders.status
                    FROM
                      orders
                    JOIN
                      payments ON orders.id = payments.order_id
                    JOIN
                      directions ON orders.user_id = directions.user_id
                    WHERE
                     orders.address_id = directions.id AND orders.user_id = $1
                    GROUP BY
                      orders.id,
                      orders.user_id,
                      payments.payment_method,
                      orders.total_price, 
                      orders.status`

    const response = await pool.query(query, [user.id]);

    const order: Array<Orders> =  response.rows;
    
    if(!order) return httpError(res, 404, 'Order not found.');

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, order);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

const create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const user = req.user;

  const { products, address_id } = req.body;

  try {

    let totalPrice = 0;

    const values = [user.id, address_id, totalPrice, 'PENDING'];

    const { rows: [newOrder] } = await pool.query('INSERT INTO orders (user_id, address_id, total_price, status) VALUES ($1, $2, $3, $4) RETURNING *', values);

    for(const product of products){

      const { id, quantity } = product;

      const { rows: [productData] } = await pool.query('SELECT price, stock FROM products WHERE id = $1 AND user_id = $2 AND is_Active = true', [id, user.id]);

      if(!productData) return httpError(res, 404, `Product with id ${id} not found`);

      if(productData.stock < quantity) return httpError(res, 400, `Product with id ${id} has insufficient stock`);

      const subtotal = productData.price * quantity;
      totalPrice += subtotal;

      await pool.query('INSERT INTO orders_products (order_id, product_id, quantity, subtotal) VALUES($1, $2, $3, $4) ', [newOrder.id, id, quantity ,subtotal]);
      
      await pool.query('UPDATE orders SET total_price = $1 WHERE id = $2 RETURNING *', [totalPrice, newOrder.id]);
     
    }

    sendRequest(res, 201, 'Created', `Order created successfully`);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error. ' + e.message);
  }

}

const update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const user = req.user;

  const id: number = parseInt(req.params.id);
  const { status } = req.body;

  try {

    const order = await pool.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [id, user.id]);

    if(order.rowCount === 0) return httpError(res, 404, 'Order not found.');

    await pool.query('UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3', [status, id, user.id]);
    
    const updatedOrder = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    
    sendRequest(res, 200, 'Updated', `Order updated successfully.`, updatedOrder.rows[0]);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

export default { show, showAll, create, update };