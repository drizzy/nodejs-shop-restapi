import { Router } from 'express';
import stripe from './stripe.controller';
import token from '../../../middleware/tokenAuth';
import role from '../../../middleware/roleAuth';
import validate from './stripe.validate';

const routes: Router = Router();

routes.post('/checkout', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), validate, stripe.checkout);

export default routes;