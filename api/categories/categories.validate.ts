import { Request, Response } from 'express';
import { body, validate } from '../../utils/handleValidate';

const categoryValidate = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  (req: Request, res: Response, next: any) => {
    validate(req, res, next);
  }

];

export default categoryValidate;