import { NextFunction, Request, Response } from "express";

export async function isAuthenticated(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.isAuthenticated()) {
    next();
  } else {
    next('Authentication failed');
  }
}