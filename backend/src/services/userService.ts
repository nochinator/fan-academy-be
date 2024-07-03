import IUser from "../interfaces/userInterface";
import User from "../models/userModel";
import bcrypt from "bcrypt";

const UserService = {
  async signup(userData: IUser) {
    const { username, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const newUser = new User({
        username,
        email,
        password: hashedPassword
      });
      await newUser.save();
    }
    catch(error) {
      console.log(error);
      return error;
    }

    return 'New user created';
  }
};

export default UserService;