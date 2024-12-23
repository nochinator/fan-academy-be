import { NextFunction, Request, Response } from "express";
import { CustomError } from "../classes/customError";

const  AppErrorHandler =  (err: CustomError | Error, req: Request, res: Response, _next: NextFunction ) => {
  console.log('APP_HANDLER_ERROR: ', err);
  if (err instanceof CustomError) {
    return res.send({ error: err.code }); // REVIEW: do we need to expand the logic here?
  };
  return res.status(500).send({ errors: [{ message: err.message }] });
};

export default AppErrorHandler;