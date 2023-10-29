import { Router } from 'express';
import order from './orders.controller';
import token from '../../middleware/tokenAuth';
import role from '../../middleware/roleAuth';
import validate from './orders.validate';

const routes: Router = Router();

routes.post('/', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), validate, order.create);
routes.get('/', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), order.showAll);
routes.get('/:id', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), order.show);


export default routes;