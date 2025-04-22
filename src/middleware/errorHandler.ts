import { NextFunction, Request, Response } from "express";
import { CustomError } from "../classes/customError";

const  AppErrorHandler =  (err: CustomError | Error, req: Request, res: Response, _next: NextFunction ) => {
  console.log('APP_HANDLER_ERROR: ', err);

  if (err instanceof CustomError) {
    return res.status(err.statusCode || 400).json({
      code: err.code,
      message: err.message
    });
  };
  return res.status(500).json({
    code: 500,
    message: 'Internal server error'
  });
};

export default AppErrorHandler;