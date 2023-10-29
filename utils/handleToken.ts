import jwt from 'jsonwebtoken';
import { User } from '../api/users/users.interface'

const SECRET: string = process.env.JWT_SECRET;
const EXPIRE: string = process.env.JWT_EXPIRE;

const tokenSign = async (user: User): Promise<string> => {

 try {
    const token = jwt.sign({
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      },
        SECRET,
      {
        expiresIn: EXPIRE
      }
    );

    return token;

  } catch (e) {
    return null;
  }
  
}

const tokenVerify = async (token: string): Promise<User> => {
  try {
    const decodedToken =  jwt.verify(token, SECRET) as User;
    return decodedToken;
  } catch (e) {
    return null;
  }
}

const tokenDecode = async (token: string): Promise<User | null> => {
  return jwt.decode(token) as User;
}

export { tokenSign, tokenVerify, tokenDecode };