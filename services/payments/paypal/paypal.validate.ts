import { Request, Response } from 'express';
import { validate, body } from '../../../utils/handleValidate';

const paypalValidate = [
  
  body('value').trim().notEmpty().withMessage('Value is required!'),

  (req: Request, res: Response, next: any) => {
    validate(req, res, next);
  }

];

export { paypalValidate };