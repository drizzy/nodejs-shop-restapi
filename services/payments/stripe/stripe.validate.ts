import { Request, Response } from 'express';
import { body, validate } from '../../../utils/handleValidate';

const stripeValidate = [

  body('id').trim().notEmpty().withMessage('ID is required!'),
  body('amount').trim().notEmpty().withMessage('Amount is required!'),
  body('description').trim().notEmpty().withMessage('Description is required!'),
  body('addressID').trim().notEmpty().withMessage('AddressID is required!'),
  body('productID').trim().notEmpty().withMessage('ProductID is required!'),
  (req: Request, res: Response, next: any) => {
    validate(req, res, next);
  }

];

export default stripeValidate;