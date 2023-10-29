import { Router } from 'express';
import categories from './categories.controller';
import token from '../../middleware/tokenAuth';
import roles from '../../middleware/roleAuth';
import validate from './categories.validate';

const routes: Router = Router();

routes.post('/', token, roles(['SUPER_ADMIN', 'ADMIN', 'SELLER']), validate,  categories.create);
routes.get('/',  categories.showAll);
routes.get('/:id',  categories.show);
routes.put('/:id', token, roles(['SUPER_ADMIN', 'ADMIN', 'SELLER']), validate, categories.update);
routes.delete('/:id', token, roles(['SUPER_ADMIN', 'ADMIN', 'SELLER']), categories.destroy);

export default routes;