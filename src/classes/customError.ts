import { ICustomError } from "../interfaces/errorInterface";
import { ErrorCode, ErrorCodes } from "../utils/errorCodes";

export class CustomError implements ICustomError {
  public readonly code: string;
  public readonly trace?: Error;

  constructor(code: ErrorCode, trace?: Error) {
    this.code = ErrorCodes[code] || '000 - Unlisted error';
    this.trace = trace;
  }
}