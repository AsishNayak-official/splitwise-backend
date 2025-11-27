import { Response as ExpressResponse } from 'express';

// configurations
declare global {
  namespace Express {
    interface Response {
      success(
        message: string,
        data: any,
        status?: number,
      ): ExpressResponse<any, Record<string, any>>;
      error(
        message: string,
        data: any,
        code?: string,
        status?: number,
      ): ExpressResponse<any, Record<string, any>>;
    }
  }
}
