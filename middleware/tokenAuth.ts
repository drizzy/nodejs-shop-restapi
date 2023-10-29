import { Response } from 'express';
import AuthenticatedRequest from '../interface/AuthenticatedRequest';
import { tokenVerify } from '../utils/handleToken';
import { httpError } from "../utils/handleStatus";
import { User } from '../api/users/users.interface';

const tokenAuth = async (req: AuthenticatedRequest, res: Response, next: any) =>{

  const token: any = req.headers['x-token'];

  try {

    if(!token) return httpError(res, 403, 'Not token provided');

    const tokenData: User =  await tokenVerify(token);

    if(!tokenData) return httpError(res, 403, 'The token not is valid.');

    if(tokenData.id){
      const user = { id: tokenData.id, name: tokenData.name, lastname: tokenData.lastname, username: tokenData.username, email: tokenData.email, password: tokenData.password, phone: tokenData.phone, role: tokenData.role, activation_pin: tokenData.activation_pin, activated_at: tokenData.activated_at, is_active: tokenData.is_active, is_pin_used: tokenData.is_pin_used, created_at: tokenData.created_at, updated_at: tokenData.updated_at };
      (req as AuthenticatedRequest).user = user;
      next();
    }else{
      httpError(res, 401, 'USER_NOT_PERMISSIONS');
    }
    
  } catch (e) {
    httpError(res, 500, 'Internal Server Error.');
  }

}

export default tokenAuth;