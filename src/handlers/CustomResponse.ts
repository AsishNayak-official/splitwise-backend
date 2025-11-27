import { Response } from 'express';

export default {
  success: (res: Response) => {
    return (message: string, data: any, status?: number) => {
      const response = res.status(status ?? 200).json({
        success: true,
        message: message,
        data: data,
      });
      return response;
    };
  },
  error: (res: Response) => {
    const req = res?.req ?? {};
    const apiRoute = req?.url ?? 'Cannot find request URL';
    return (
      message: string,
      data: any,
      errorCode?: string,
      status?: number,
    ) => {
      const errStatus = status || 500;
      const errMsg = message || 'Something went wrong';
      console.log({
        message: `${errMsg} - Route: ${apiRoute}`,
        method: req?.method ?? 'Cannot find method name',
        code:
          errorCode ?? 'Custom error response has not been made for this error',
        statusCode: errStatus,
      });
      const response = res.status(status ?? 500).json({
        success: false,
        message: message,
        data: data,
        code: errorCode,
      });
      return response;
    };
  },
};
