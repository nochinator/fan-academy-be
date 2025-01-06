import { ICustomError } from "../interfaces/errorInterface";
import { ErrorCode, ErrorCodes } from "../utils/errorCodes";

export class CustomError implements ICustomError {
  public readonly code: number;
  public readonly message: string;
  public readonly trace?: Error;

  constructor(errorCode: ErrorCode, trace?: Error) {
    this.code = errorCode;
    this.message = ErrorCodes[errorCode] || '000 - Unlisted error';
    this.trace = trace; // TODO: seems unnecesary
  }
}