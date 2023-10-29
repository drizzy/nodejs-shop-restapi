import * as paypal from '@paypal/checkout-server-sdk';

const NODE_ENV: string  = `${process.env.NODE_ENV}`;
const CLIENT_ID: string = `${process.env.PAYPAL_CLIENT_ID}`;
const SECRET_ID: string = `${process.env.PAYPAL_SECRET_KEY}`;

let environment: any;

if(NODE_ENV == 'development' || 'dev'){
  environment = new paypal.core.SandboxEnvironment(CLIENT_ID, SECRET_ID);
}else if(NODE_ENV == 'production' || 'prod'){
  environment = new paypal.core.LiveEnvironment(CLIENT_ID, SECRET_ID);
}else{
  console.log('The established mode is not allowed, it must be dev, prod, development, production');
}

const client: paypal.core.PayPalHttpClient = new paypal.core.PayPalHttpClient(environment);

const createOrder: paypal.orders.OrdersCreateRequest = new paypal.orders.OrdersCreateRequest();

const captureOrder = async (orderId: string) => {

  const request: paypal.orders.OrdersCaptureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
  return request;

};

export { client, createOrder, captureOrder };