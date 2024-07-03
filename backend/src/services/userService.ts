import IUser from "../interfaces/userInterface";
import User from "../models/userModel";
import bcrypt from "bcrypt";

const UserService = {
  async signup(userData: IUser): Promise<string> {
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
      if (error instanceof Error){ return error.message;}
    }

    return 'New user created';
  },

  async login({ username, password }: {
    username: string,
    password: string
  }): Promise<string> {
    const user: IUser | null = await User.findOne({ username });
    if (!user) {return 'Incorrect username or password';}

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {return 'Incorrect username or password';}

    // TODO: generate token

    return user.email;
  }
};

export default UserService;