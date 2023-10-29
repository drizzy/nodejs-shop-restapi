import { Router } from 'express';
import pass from './reset.controller';
import { checkValidate, resetValidate } from './reset.validate';

const routes: Router = Router();

routes.post('/check', checkValidate, pass.check);
routes.put('/reset', resetValidate, pass.reset);

export default routes;