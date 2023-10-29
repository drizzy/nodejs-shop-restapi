import { Router } from 'express';
import token from '../../middleware/tokenAuth';
import roles from '../../middleware/roleAuth';
import ordersProducts from './ordersProducts.controller';

const routes: Router = Router();

routes.get('/', token, roles(['SUPER_ADMIN', 'ADMIN']), ordersProducts.showAll);
routes.get('/:id', token, roles(['SUPER_ADMIN', 'ADMIN']), ordersProducts.show);

export default routes;