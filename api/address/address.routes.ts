import { Router } from 'express';
import address from './address.controller';
import token from '../../middleware/tokenAuth';
import role from '../../middleware/roleAuth';
import validate from './address.validate';

const routes: Router = Router();

routes.post('/', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), validate, address.create);
routes.get('/', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), address.showAll);
routes.get('/:id', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), address.show);
routes.put('/:id', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), validate, address.update);
routes.delete('/:id', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), address.destroy);

export default routes;