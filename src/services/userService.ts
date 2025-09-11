import { measuresService } from "./measuresService";
import { settingsService } from "./settingsService";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/User";
import { emailService } from "./emailService";

const saltRounds = 10;

export const userService = {
async register(data: any) {
    const { name, email, phoneNumber, password, role, coach, athletes, active } = data;

    // Verifica se já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("Email já cadastrado");

    // Hash da password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Token de verificação
    const verificationToken = uuidv4();

    // Cria utilizador não verificado
    const newUser = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      coach: coach || null,
      athletes: athletes || null,
      active: active !== undefined ? active : true,
      verified: false,
      verificationToken,
    });

    // Enviar email de verificação
    await emailService.sendVerificationEmail(email, verificationToken);

    return newUser;
  },

  async verifyAccount(token: string) {
    let user = await User.findOne({ verificationToken: token });
    if (!user) throw new Error("Token inválido");

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    return { message: "Conta verificada com sucesso!" };
  },

  async login(login: string, password: string) {
    const user = await User.findOne({
      $or: [
        { email: login },
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

  async update(id: string, data: { 
    name?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    coach?: string;
    atheletes?: string[];
  }) {
    const { name, email, phoneNumber, role, coach, atheletes } = data;

    // constrói update dinâmico
    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (role) updateData.role = role;
    if (coach) updateData.coach = coach;
    if (atheletes) updateData.atheletes = atheletes;

    const user = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select("-password");

    if (!user) throw new Error("Usuário não encontrado");

    return user;
  }
};
