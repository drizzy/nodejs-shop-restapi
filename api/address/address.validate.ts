import { Request, Response } from 'express';
import { body, validate } from '../../utils/handleValidate';

const addressValidate = [
  body('fullname').trim().notEmpty().withMessage('Fullname is required!').custom((value, { req }) => {
    if (typeof value !== 'string') {
      throw new Error('The field must be a string');
    }
    return true;
  }),
  body('phone').trim().notEmpty().withMessage('Phone is required!').isString(),
  body('country').trim().notEmpty().withMessage('Country is required!').isString(),
  body('address').trim().notEmpty().withMessage(' or street is required!').isString(),
  body('city').trim().notEmpty().withMessage('City is required!').isString(),
  body('state').trim().notEmpty().withMessage('State is required!').isString(),
  body('postal_code').trim().notEmpty().withMessage('Postal code is required!').isString(),

  (req: Request, res: Response, next: any) => {
    validate(req, res, next);
  }

];

export default addressValidate;