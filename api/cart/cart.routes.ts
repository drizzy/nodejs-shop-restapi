import { Router } from 'express';
import cart  from './cart.controller';
import token from '../../middleware/tokenAuth';
import role from '../../middleware/roleAuth';
import validate from './cart.validate';

const routes: Router = Router();

routes.post('/', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), validate, cart.add);
routes.get('/', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), cart.show);
routes.delete('/:product_id', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), cart.remove);

export default routes;