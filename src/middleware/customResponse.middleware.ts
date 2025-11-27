import { NextFunction, Request, Response } from 'express';
import CustomResponse from '../handlers/CustomResponse';

export default function (req: Request, res: Response, next: NextFunction) {
  const success = CustomResponse.success(res);
  const error = CustomResponse.error(res);
  res.success = success;
  res.error = error;
  next();
}
export interface CustomResponse extends Response {
  success: (message: string, data: any, status?: number) => this;
  error: (message: string, data: any, code?: string, status?: number) => this;
}
