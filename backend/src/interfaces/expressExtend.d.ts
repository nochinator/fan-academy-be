import IUser from "./userInterface";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}