import { Response, Request, NextFunction } from 'express';
import { envConfiguration } from '../configs/env.config';

export default function (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const apiRoute = req?.url ?? 'Cannot find request URL';
  const errStatus = err.statusCode || 500;
  const errMsg = err.message || 'Something went wrong';
  const errorCode = err.code;
  console.log({
    message: `${errMsg} - Route: ${apiRoute}`,
    method: req?.method ?? 'Cannot find method name',
    code: errorCode ?? 'Custom error response has not been made for this error',
    statusCode: errStatus,
  });
  res.status(errStatus).json({
    success: false,
    data: null,
    code: errorCode,
    message: errMsg,
    stack: envConfiguration.ENVIRONMENT === 'development' ? err.stack : {},
  });
}
