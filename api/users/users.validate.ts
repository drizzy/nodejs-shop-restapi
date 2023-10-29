import { Request, Response } from 'express';
import { body, validate} from '../../utils/handleValidate';
import { checkIfUserExists } from '../../utils/handleUser';

const userValidate =  [
  
  body('name').trim().isString().notEmpty().withMessage('Name is required'),
  body('username').trim().isString().notEmpty().withMessage('Username is required').custom( async (value, { req }) => {
    
    const user: any = req.user;
    
    if (typeof user === 'undefined' || typeof user.username === 'undefined' || value !== user.username) {
      const checkUser = await checkIfUserExists(value, 'username');
      if (checkUser || value === 'admin') {
        throw new Error('Username already exists.');
      }

    }

  }),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address').custom( async (value, { req }) => {
    
    const user: any = req.user;
    
    if (typeof user === 'undefined' || typeof user.email === 'undefined' || value !== user.email ) {
      const checkEmail = await checkIfUserExists(value, 'email');
      if (checkEmail) {
        throw new Error('Email already exists.');
      }
    }

  }),
  body('password').trim().isLength({min: 6 }).withMessage('Password must be at least 6 characters long'),

  (req: Request, res: Response, next: any) => {
    validate(req, res, next)
  }

];

export default userValidate ;