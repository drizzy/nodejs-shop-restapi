import AuthenticatedRequest from '../../../interface/AuthenticatedRequest';
import { Response } from 'express';
import { pool } from '../../../config/psql';
import { client, createOrder, captureOrder } from '../../../config/paypal';
import { confirmedOrder } from '../../../utils/handleOrder';
import { httpError, sendRequest } from '../../../utils/handleStatus';

const CURRENCY_CODE = 'USD';

const create = async (req: AuthenticatedRequest, res: Response) => {

  const data = req.body;
  
  createOrder.prefer('return=representation');
  createOrder.requestBody({
    intent: 'CAPTURE',
    application_context: {
      brand_name: `${process.env.APP_NAME}`,
      landing_page: 'BILLING',
      user_action: 'CONTINUE'
    },
    purchase_units: [{
      reference_id: "PUHF",
      description: data.description.substring(0, 127),
      soft_descriptor: "NODESHOP",
      amount: {
        currency_code: CURRENCY_CODE,
        value: data.value,
      },
    }]
  });
  
  try {

    const response = await client.execute(createOrder);

    const orderID = response.result.id;

    const resJson = {
      orderID: orderID
    };

    sendRequest(res, 201, 'CREATED', `${JSON.stringify(response.result)}`, resJson);

  } catch (e) {

    console.error(e);

    if (e.name === 'ValidationError') {
      return httpError(res, 500, 'Bad Request: ' + e.message);
    }

    httpError(res, 500, 'An error occurred while creating the order.');

  }

};

const success = async (req: AuthenticatedRequest, res: Response) => {

  const user = req.user;
  
  const orderID: string = req.body.orderID as string;
  const addressID: number = req.body.addressID;
  const productID = req.body.productID;

  try {
    
    const request = await captureOrder(orderID);

    const capture = await client.execute(request);

    const result = capture.result;

    const amount = result.purchase_units[0].payments.captures[0].amount.value;
    if(!amount) return httpError(res, 400, 'Failed to get payment amount.');

    const orderQuery = 'INSERT INTO orders (user_id, address_id, total_price) VALUES ($1, $2, $3) RETURNING *;';
    const order = await pool.query(orderQuery, [user.id, addressID, amount]);
    const order_ID = order.rows[0].id;

    const resJson = {
      result
    };

    const updateOrder = 'UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3;';
    await pool.query(updateOrder, [resJson.result.status, order_ID, user.id]);

    const amount_in_cents = amount * 100;

    const PaymentQuery = 'INSERT INTO payments(user_id, order_id, payment_method, payment_status, amount, amount_in_cents) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;';
    const response =  await pool.query(PaymentQuery, [user.id, order_ID, 'paypal', resJson.result.status, amount, amount_in_cents]);

    if(response.rowCount === 0) return httpError(res, 400, 'Failed to save payment data.');

    const paymentId = response.rows[0].id;
    const paypalPaymentId = resJson.result.id;

    const queryPaypal = 'INSERT INTO paypal_payments(payment_id, paypal_payment_id) VALUES($1, $2) RETURNING *;';
    const responsePaypal = await pool.query(queryPaypal, [paymentId, paypalPaymentId]);
  
    if(responsePaypal.rowCount === 0) return httpError(res, 400, 'Failed to save PayPal payment data.');

    const cartItems = await pool.query('SELECT * FROM cart WHERE user_id = $1', [user.id]);

    let productName: string;
    let productDescription: string;

    console.log('productID:', productID);

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
        await pool.query('DELETE FROM cart WHERE user_id = $1 AND product_id = $2', [user.id, item.product_id]);
      }
  
    }

    confirmedOrder(user.email, `✅ CONFIRMED ${order_ID} ORDER`, productDescription);
    sendRequest(res, 201, 'CAPTURE', `${JSON.stringify(capture.result)}`, resJson);

  } catch (e) {

    console.error(e);

    if (e.name === 'AuthenticationError') {
      return httpError(res, 500, 'Bad Request: ' + e.message);
    }

    httpError(res, 500, 'An error occurred while capturing the payment.');

  }
  
};

export default { create, success };

