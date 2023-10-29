import { Request } from 'express';

export default interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  };
};