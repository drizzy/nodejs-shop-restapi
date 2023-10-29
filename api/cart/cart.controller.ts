import { Response } from 'express';
import AuthenticatedRequest from '../../interface/AuthenticatedRequest';
import { Cart } from './cart.interface';
import { Products } from '../products/products.interface';
import { pool } from '../../config/psql';
import { sendRequest, httpError } from '../../utils/handleStatus';

const show = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const user = req.user;

  try {
    
    const query = `SELECT 
                    products.id,
                    products.name,
                    products.description,
                    TRIM(to_char(products.price, '9999999999.00')) AS price,
                    cart.quantity,
                    cart.product_id,
                    TRIM(to_char(products.price * cart.quantity, '9999999999.00')) AS total_price,
                    COALESCE(orders.id, 0) AS order_id,
                    array_agg(products_image.secure_url) AS product_images
                  FROM 
                    cart 
                    JOIN products ON cart.product_id = products.id
                    JOIN products_image ON products.id = products_image.product_id
                    LEFT JOIN orders ON orders.user_id = cart.user_id AND orders.status = 'PENDING'
                  WHERE 
                    cart.user_id = $1
                  GROUP BY 
                    products.id,
                    products.name,
                    products.description, 
                    products.price,
                    cart.quantity,
                    cart.product_id,
                    orders.id`;

    const response = await pool.query(query, [user.id]);

    const cart: Array<Cart> = response.rows;

    if(response.rowCount === 0) return httpError(res, 200, 'Cart is empty.');

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, cart);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

const add = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
   
  const user: any = req.user;

  const { product_id, quantity } = req.body;

  try {
     
    const response = await pool.query('SELECT * FROM products WHERE id = $1', [product_id]);

    const product: Products = response.rows[0];

    if(!product) return httpError(res, 404, 'Product not found.');

    if(product.stock < quantity) return httpError(res, 400, 'Insufficient stock.'); 

    const cart = await pool.query('SELECT * FROM cart WHERE user_id = $1 AND product_id = $2', [user.id, product_id]);

    if(cart.rows.length > 0){

      const newQuantity = cart.rows[0].quantity + quantity;

      await pool.query('UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3', [newQuantity, user.id, product_id]);
      
      sendRequest(res, 200, 'Updated', `Product quantity updated in cart`);

    }else{

      await pool.query('INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)', [user.id, product_id, quantity]);

      sendRequest(res, 200, 'Add', `Product added to cart`);

    }
    
  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

const remove = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  
  const user: any = req.user;

  const { product_id } = req.params;

  try {

    const cart = await pool.query('SELECT * FROM cart WHERE user_id = $1 AND product_id = $2', [user.id, product_id]);

    if(cart.rowCount === 0) return httpError(res, 404, 'Product not found.');

    if(cart.rows.length > 0){

      const newQuantity = cart.rows[0].quantity - 1;
       
      if(newQuantity <= 0){

        await pool.query('DELETE FROM cart WHERE user_id = $1 AND product_id = $2', [user.id, product_id]);

      }else{
        
        await pool.query('UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3',[newQuantity, user.id, product_id]);

      }
      
      sendRequest(res, 200, 'Removed', 'Product removed from cart');
      
    }else{
      
     return httpError(res, 404, 'Product not found.');
      
    }

  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

export default { show, add, remove };