import { Router } from 'express';
import users from './users.controller';
import token from '../../middleware/tokenAuth';
import roles from '../../middleware/roleAuth';
import validate from './users.validate';

const routes: Router = Router();

routes.post('/', token, roles(['SUPER_ADMIN', 'ADMIN']), validate, users.create);
routes.get('/', token, roles(['SUPER_ADMIN', 'ADMIN']), users.showAll);
routes.get('/:id', token, roles(['SUPER_ADMIN', 'ADMIN', 'USER']), users.show);
routes.put('/:id', token, roles(['SUPER_ADMIN', 'ADMIN', 'USER']), validate, users.update);
routes.delete('/:id', token, roles(['SUPER_ADMIN', 'ADMIN', 'USER']), users.remove);

export default routes;