import { Router } from 'express';
import token from '../../middleware/tokenAuth';
import roles from '../../middleware/roleAuth';
import payments from './payments.controller';

const routes: Router = Router();

routes.get('/', token, roles(['SUPER_ADMIN', 'ADMIN']), payments.showAll);
routes.get('/:id', token, roles(['SUPER_ADMIN', 'ADMIN']), payments.show);

export default routes;