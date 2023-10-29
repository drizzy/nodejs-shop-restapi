import { Request, Response } from 'express';
import { validate, body } from '../../utils/handleValidate';

const checkValidate = [

  body('email').trim().notEmpty().withMessage('Email is required!').isEmail().withMessage('Invalid email address'),
  (req: Request, res: Response, next: any) => {
    validate(req, res, next)
  }
]

const resetValidate = [

  body('password').trim().notEmpty().withMessage('Password is required!').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
  body('repetPassword').trim().notEmpty().withMessage('repetPassword is required!').isLength({min: 6 }).withMessage('Password must be at least 6 characters long').custom( async (value) => {

    if (value.password !== value.repetPassword) return new Error('Passwords do not match.');

  }),
  (req: Request, res: Response, next: any) => {
    validate(req, res, next);
  }

]

export { checkValidate, resetValidate };