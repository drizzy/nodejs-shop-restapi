import AuthenticatedRequest from '../../../interface/AuthenticatedRequest';
import { Response } from 'express';
import { pool } from '../../../config/psql';
import { stripe } from '../../../config/stripe';
import { confirmedOrder } from '../../../utils/handleOrder';
import { httpError, sendRequest } from '../../../utils/handleStatus';

const CURRENCY_CODE = 'USD';

const checkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const user = req.user;

  const { id, amount, description }: any = req.body;
  const addressID: number = req.body.addressID;
  const productID = req.body.productID;

  try {
    
    const payment = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: CURRENCY_CODE,
      description: description,
      payment_method: id,
      confirm: true
    });
    
    if(!payment.amount) return httpError(res, 400, 'Failed to get payment amount.');
    const amount_with_cents = payment.amount / 100;

    const orderQuery = 'INSERT INTO orders (user_id, address_id, total_price) VALUES ($1, $2, $3) RETURNING *;';
    const order = await pool.query(orderQuery, [user.id, addressID, amount_with_cents]);
    const order_ID = order.rows[0].id;

    const updateOrder = 'UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3;';
    await pool.query(updateOrder, [payment.status, order_ID, user.id]);

    const paymentQuery = 'INSERT INTO payments (user_id, order_id, payment_method, payment_status, amount, amount_in_cents) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;';
    const response = await pool.query(paymentQuery, [user.id, order_ID, 'stripe', payment.status, amount_with_cents, payment.amount]);

    if(response.rowCount === 0 ) return httpError(res, 400, 'Failed to save payment data.');

    const paymentId = response.rows[0].id;
    const stripePaymentId = payment.id;

    const qureyStripe = 'INSERT INTO stripe_payments (payment_id, stripe_payment_id) VALUES ($1, $2) RETURNING *;';
    const responseStripe = await pool.query(qureyStripe, [paymentId, stripePaymentId]);

    if(responseStripe.rowCount === 0 ) return httpError(res, 400, 'Failed to save stripe payment data.');

    const cartItems = await pool.query('SELECT * FROM cart WHERE user_id = $1', [user.id]);

    let productName: string;
    let productDescription: string;

    for(const item of cartItems.rows){
      
      const product = await pool.query('SELECT name, stock, description FROM products WHERE id = $1', [item.product_id]);
      productName = product.rows[0].name;
      productDescription = product.rows[0].description;
    
      const orders_products = 'INSERT INTO orders_products (order_id, product_id, quantity, subtotal) VALUES ($1, $2, $3, $4) RETURNING *;';
      await pool.query(orders_products, [order_ID, productID, item.quantity, amount]);

      const quantityInCart = item.quantity;
      const quantityInStock = product.rows[0].stock;

      if (quantityInStock < quantityInCart) {
        return httpError(res, 400, 'Not enough stock available for one or more products.');
      }

      const newQuantity = quantityInStock - quantityInCart;
      await pool.query('UPDATE products SET stock = $1 WHERE id = $2', [newQuantity, item.product_id]);

      if (item.product_id === productID) {
        console.log('Todo Ok hasta aqui!')
        await pool.query('DELETE FROM cart WHERE user_id = $1 AND product_id = $2', [user.id, item.product_id]);
      }
    }

    confirmedOrder(user.email, `✅ CONFIRMED ${order_ID} ORDER`, productDescription);
    sendRequest(res, 201, 'Created', 'Successful payment');
      
  } catch (e) {

    console.log(e);

    if (e.name === 'AuthenticationError') {
      return httpError(res, 500, 'Bad Request: ' + e.message);
    }

    httpError(res, 500, 'An error occurred while capturing the payment.');

  }

}

export default { checkout };