import { Router } from 'express';
import brabds from './brands.controller';
import token from '../../middleware/tokenAuth';
import roles from '../../middleware/roleAuth';
import validate from './brands.validate';
const routes: Router = Router();

routes.post('/', token, roles(['SUPER_ADMIN', 'ADMIN', 'SELLER']), validate, brabds.create);
routes.get('/', brabds.showAll);
routes.get('/:id',  brabds.show);
routes.put('/:id', token, roles(['SUPER_ADMIN', 'ADMIN', 'SELLER']), validate, brabds.update);
routes.delete('/:id', token, roles(['SUPER_ADMIN', 'ADMIN', 'SELLER']), brabds.destroy);

export default routes;