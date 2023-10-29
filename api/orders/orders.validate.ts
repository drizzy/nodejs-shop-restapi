import { Request, Response } from 'express';
import { body, validate } from '../../utils/handleValidate';

const ordersValidate = [
  
  body('products').isArray({min: 1}).withMessage('At least one product is required').custom( (value) => {

    for(const product of value){
      if(!product.id || !product.quantity){
        throw new Error('Invalid product');
      }
    }
    return true;

  }),
  body('address_id').trim().notEmpty().withMessage('Address is required').isNumeric(),
  (req: Request, res: Response, next: any) => {
    validate(req, res, next);
  }

];

export default ordersValidate;