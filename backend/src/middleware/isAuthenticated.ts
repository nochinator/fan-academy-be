import { NextFunction, Request, Response } from "express";
import { CustomError } from "../classes/customError";

export async function isAuthenticated(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.isAuthenticated()) {
    next();
  } else {
    next(new CustomError(10));
  }
}