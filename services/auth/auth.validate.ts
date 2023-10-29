import AuthenticatedRequest from '../../interface/AuthenticatedRequest';
import { Response } from 'express';
import { body, validate } from '../../utils/handleValidate';
import { getUserByUsername } from '../../utils/handleUser';
import { compare } from '../../utils/handleBcrypt';

const loginValidate = [

  body('username').trim().notEmpty().withMessage('Username is required!').custom( async (value, {req} ) => {

    const user = await getUserByUsername(value);
    
    if(!user && value != ''){
      throw new Error('The email or username you entered is not connected to an account. Create a new NodeShop account.');
    }

    req.user = user;

  }),
  body('password').trim().notEmpty().withMessage('Password is required!').custom( async (password, {req} ) => {

    if(!req.user) return;

    const user = req.user;

    const passCheck = await compare(password, user.password);

    if(!passCheck) throw new Error('Sorry, your password is wrong!');

  }),
  
  (req: AuthenticatedRequest, res: Response, next: any) => {
    validate(req, res, next);
  }
  

];

const activateValidate = [

  body('pin').trim().notEmpty().withMessage('Pin is required').isNumeric().withMessage('Only numbers allowed').isLength({min: 6}).withMessage('Pin must be at least 6 characters long'),

  (req: AuthenticatedRequest, res: Response, next: any) => {
    validate(req, res, next);
  }

];

export  { loginValidate, activateValidate };