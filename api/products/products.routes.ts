import { Router } from 'express';
import product from './products.controller';
import token from '../../middleware/tokenAuth';
import roles from '../../middleware/roleAuth';
import validate from './products.validate';
import upload from '../../config/multer';

const routes: Router = Router();

routes.post('/', token, roles(['SUPER_ADMIN', 'ADMIN', 'SELLER']), upload.array('image', 10), validate, product.create);
routes.get('/', product.showAll);
routes.get('/:slug/:id', product.showSlug);
routes.get('/:id', product.show);
routes.put('/:id', token, roles(['SUPER_ADMIN', 'ADMIN', 'SELLER']),  upload.array('image', 10), validate, product.update);
routes.delete('/:id', token, roles(['SUPER_ADMIN', 'ADMIN', 'SELLER']), product.destroy);

export default routes;