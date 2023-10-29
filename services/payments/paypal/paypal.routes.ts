import { Router } from 'express';
import paypal from './paypal.controller';
import token from '../../../middleware/tokenAuth';
import role from '../../../middleware/roleAuth';

const routes: Router = Router();

routes.post('/create', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), paypal.create);
routes.post('/success', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), paypal.success);

export default routes;