import { Application } from 'express';
import users from '../api/users/users.routes';
import address from '../api/address/address.routes';
import categories from '../api/categories/categories.routes';
import brands from '../api/brands/brands.routes';
import products from '../api/products/products.routes';
import cart from '../api/cart/cart.routes';
import orders from '../api/orders/orders.routes';
import ordersProducts from '../api/ordersProducts/ordersProducts.routes';
import payments from '../api/payments/payments.routes';
import paypal from '../services/payments/paypal/paypal.routes';
import stripe from '../services/payments/stripe/stripe.routes';
import auth from '../services/auth/auth.routes';
import passwd from '../services/passwd/reset.routes';

export default (app: Application): void => {
  
  const version: string = `${process.env.API_VERSION }` as string;
  const api: string = '/api';
  
  app.use(`${api}/${version}/auth`, auth);
  app.use(`${api}/${version}/change-passwd`, passwd);
  app.use(`${api}/${version}/users`, users);
  app.use(`${api}/${version}/address`, address);
  app.use(`${api}/${version}/categories`, categories);
  app.use(`${api}/${version}/brands`, brands);
  app.use(`${api}/${version}/products`, products);
  app.use(`${api}/${version}/cart`, cart);
  app.use(`${api}/${version}/orders`, orders);
  app.use(`${api}/${version}/orders-products`, ordersProducts);
  app.use(`${api}/${version}/payments`, payments);
  app.use(`${api}/${version}/pay/paypal`, paypal);
  app.use(`${api}/${version}/pay/stripe`, stripe);

}