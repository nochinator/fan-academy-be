export interface ICustomError {
  code: number
  message: string;
  trace?: Error
}