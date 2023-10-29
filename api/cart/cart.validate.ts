import { Request, Response } from 'express';
import { body, validate } from '../../utils/handleValidate';

const cartValidate = [

  body('product_id').trim().notEmpty().withMessage('Product id is required!').isNumeric(),
  body('quantity').trim().notEmpty().withMessage('Quantity is required!').isNumeric(),

  (req: Request, res: Response, next: any) => {
    validate(req, res, next);
  }

];

export default cartValidate;