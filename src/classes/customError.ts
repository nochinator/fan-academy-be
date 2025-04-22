import { ICustomError } from "../interfaces/errorInterface";
import { ErrorCode, ErrorCodes, ErrorStatuses } from "../utils/errorCodes";

export class CustomError implements ICustomError {
  public readonly code: number;
  public readonly message: string;
  public readonly statusCode?: number;

  constructor(errorCode: ErrorCode) {
    this.code = errorCode;
    this.statusCode = ErrorStatuses[errorCode] || 404;
    this.message = ErrorCodes[errorCode] || '000 - Unlisted error';
  }
}