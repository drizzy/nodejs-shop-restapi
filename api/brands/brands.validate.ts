import { Request, Response } from 'express';
import { body, validate } from '../../utils/handleValidate';
import { pool } from '../../config/psql';

const brandsValidate = [

  body('name').trim().notEmpty().withMessage('name is required!').custom( async (value) => {

    const { rows } = await pool.query('SELECT COUNT(*) FROM brands WHERE name = $1', [value]);

    if(rows[0].count > 0){
      throw new Error('The brand already exists!');
    }

  }),

  (req: Request, res: Response, next: any) => {
    validate(req, res, next);
  }

];

export default brandsValidate;