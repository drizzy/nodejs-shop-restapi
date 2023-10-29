import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

const validate =  (req: Request, res: Response, next: any) => {

  try{

    validationResult(req).throw();
    return next();
    
  }catch(e) {
    res.status(400).json({error: e.array()});
  }


}

export  { body, validate};