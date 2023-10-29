import { Request, Response } from 'express';
import { body, validate } from '../../utils/handleValidate';

const productValidate = [
  
  body('name').trim().notEmpty().withMessage('Product name is required').isString(),
  body('description').trim().notEmpty().withMessage('Product description is required').isString(),
  body('stock').trim().notEmpty().withMessage('Product stock is required').isNumeric(),
  body('price').trim().notEmpty().withMessage('Product price is required').isFloat(),
  body('category').trim().notEmpty().withMessage('Product category is required').isArray(),
  body('brand_id').trim().notEmpty().withMessage('Product brand is required'),
  (req: Request, res: Response, next: any) => {
    validate(req, res, next);
  }

];



export default productValidate;