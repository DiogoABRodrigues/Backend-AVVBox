import bcrypt from "bcrypt";
import { User } from "../models/User";
import { measuresService } from "./measuresService";

const saltRounds = 10;

export const userService = {
  async register(data: any) {
    const { name, phoneNumber, password, role, coach, atheletes, active } = data;

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) throw new Error("Número de telefone já cadastrado");

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      phoneNumber,
      password: hashedPassword,
      role,
      coach: coach || null,
      atheletes: atheletes || null,
      active: active !== undefined ? active : true
    });

    await newUser.save();

    await measuresService.createMeasure({
      user: newUser._id,
      type: 'goal',
      weight: 0,
      height: 0,
      bodyFat: 0,
      muscleMass: 0,
      visceralFat: 0,
    });
    return newUser;
  },

  async login(login: string, password: string) {
    const user = await User.findOne({
      $or: [
        { phoneNumber: login },
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
      .populate('coach', '-password')
      .populate('atheletes', '-password')
      .select("-password");
    if (!user) throw new Error("Usuário não encontrado");
    return user;
  },

  async getMyAthletes(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error("Usuário não encontrado");
    if (user.role !== 'PT') throw new Error("Apenas PTs têm atletas");

    //pts tem um parametro athletes que é um array de ids de atletas
    const athletes = await User.find({ _id: { $in: user.atheletes } }).select("-password");
    return athletes;  
  },

  async deactivate(id: string) {
    const user = await User.findByIdAndUpdate(id, { active: false }, { new: true }).select("-password");
    if (!user) throw new Error("Usuário não encontrado");
    return user;
  },

  async activate(id: string) {
    const user = await User.findByIdAndUpdate(id, { active: true }, { new: true }).select("-password");
    if (!user) throw new Error("Usuário não encontrado");
    return user;
  },

  async updateBasicInfo(id: string, data: { name?: string; phoneNumber?: string }) {
    const { name, phoneNumber } = data;

    const user = await User.findByIdAndUpdate(
      id,
      { ...(name && { name }), ...(phoneNumber && { phoneNumber }) }, // só mete se existir
      { new: true }
    ).select("-password");

    if (!user) throw new Error("Usuário não encontrado");

    return user;
  }

};
