import { Response } from 'express';

const sendRequest = (res: Response, code: number, status: string, message: string | number, data?: any) => {
  const responseMessage = code === 202 && typeof message === 'string' ? 'token' : 'message';
  res.status(code).json( {status, [responseMessage]: message, data});
}

const httpError = (res: Response, code: number, message: string) => {
  res.status(code).json({error: message});
}

export { sendRequest, httpError };