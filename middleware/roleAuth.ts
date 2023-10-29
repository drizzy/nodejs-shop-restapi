import { Response } from 'express';
import AuthenticatedRequest from '../interface/AuthenticatedRequest';
import { allowedRoles } from '../utils/allowedRoles';
import { httpError } from '../utils/handleStatus';

const roleAuth = (role: allowedRoles | allowedRoles[]) => async (req: AuthenticatedRequest, res: Response, next: any) => {

  const user =  req.user;

  try{

    if(!user) return httpError(res, 404, 'User not found.');

    const userRole = user.role as allowedRoles;

    const allowedRoles = Array.isArray(role) ? role : [role];

    if (allowedRoles.some(role => userRole.includes(role))) {
      next();
    }else{
      httpError(res, 401, 'User does not have permission.');
    }

  }catch(e){
    httpError(res, 500, 'Internal server error.');
  }

}

export default roleAuth;