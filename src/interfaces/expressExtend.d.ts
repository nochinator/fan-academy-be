import IUser from "./userInterface";

declare global {
  namespace Express {
    export interface User extends IUser {}
  }
}
