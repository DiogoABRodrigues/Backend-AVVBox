import bcrypt from "bcrypt";
import { User } from "../models/User";

const saltRounds = 10;

export const userService = {
  async register(data: any) {
    const { name, email, password, role, coach, subs } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("Email já cadastrado");

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      coach: coach || null,
      subs: subs || []
    });

    await newUser.save();
    return newUser;
  },

  async login(login: string, password: string) {
    const user = await User.findOne({
      $or: [
        { email: login.toLowerCase() },
        { name: login }
      ]
    });

    if (!user) throw new Error("Usuário não encontrado");

    const validPassword = await bcrypt.compare(password, user.password as string);
    if (!validPassword) throw new Error("Senha incorreta");

    return { id: user._id, name: user.name, role: user.role };
  },

  async getAll() {
    return User.find().select("-password");
  },

  async getById(id: string) {
    const user = await User.findById(id)
      .select("-password")
      .populate("coach")
      .populate("subs");

    if (!user) throw new Error("Usuário não encontrado");

    return user;
  }
};
