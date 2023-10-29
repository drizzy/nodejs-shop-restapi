import { Router } from 'express';
import auth from './auth.controller';
import { loginValidate, activateValidate } from './auth.validate';
import validate from '../../api/users/users.validate';
import token from '../../middleware/tokenAuth';
import role from '../../middleware/roleAuth';

const routes: Router = Router();

routes.post('/register', validate, auth.register);
routes.post('/login', loginValidate, auth.login);
routes.post('/activate-account', token, role(['SUPER_ADMIN', 'ADMIN', 'USER']), activateValidate, auth.activate);

export default routes;