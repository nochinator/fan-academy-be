import { ICustomError } from "../interfaces/errorInterface";
import { ErrorCode, ErrorCodes, ErrorStatuses } from "../utils/errorCodes";

export class CustomError implements ICustomError {
  public readonly code: number;
  public readonly message: string;
  public readonly statusCode?: number;
  public readonly errorMessage?: string;

  constructor(errorCode: ErrorCode, errorMessage?: string) {
    this.code = errorCode;
    this.statusCode = ErrorStatuses[errorCode] || 404;
    this.message = errorMessage ?? ErrorCodes[errorCode] ?? '000 - Unlisted error';
  }
}