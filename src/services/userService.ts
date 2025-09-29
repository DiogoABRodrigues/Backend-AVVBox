import { measuresService } from "./measuresService";
import { settingsService } from "./settingsService";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/User";
import { emailService } from "./emailService";
import { availabilityService } from "./availabilityService";
import { exerciseService } from "./exerciseService";

const saltRounds = 10;

export const userService = {
  async register(data: any) {
    const {
      name,
      email,
      phoneNumber,
      password,
      role,
      coach,
      athletes,
      active,
    } = data;

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
      expoPushToken: null,
    });

    await measuresService.createMeasure({
      user: newUser._id,
      type: "goal",
      weight: 0,
      height: 0,
      bodyFat: 0,
      muscleMass: 0,
      visceralFat: 0,
    });

    await exerciseService.create(newUser._id.toString());
    await availabilityService.create({ PT: newUser._id.toString() });

    await settingsService.create(newUser._id.toString(), {});

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

  async resendVerificationEmail(email: string) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Usuário não encontrado");

    // Enviar email de verificação
    await emailService.sendVerificationEmail(
      email,
      user.verificationToken as string,
    );
  },

  async requestPasswordReset(email: string) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Usuário não encontrado");

    // Gera código de redefinição
    const passwordResetCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    user.passwordResetCode = passwordResetCode;
    await user.save();
    // Enviar email de redefinição de senha
    await emailService.sendPasswordResetEmail(email, passwordResetCode);
  },

  async resetPasswordWithCode(
    email: string,
    resetCode: string,
    newPassword: string,
  ) {
    const user = await User.findOne({ email, passwordResetCode: resetCode });
    if (!user) throw new Error("Código de redefinição inválido");

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    user.passwordResetCode = null;
    await user.save();

    return { message: "Senha redefinida com sucesso!" };
  },

  async login(login: string, password: string) {
    const user = await User.findOne({ email: login });

    if (!user)
      throw new Error(
        "Email introduzido não existe cadastrado no sistema, tente novamente.",
      );

    if (!user.active) throw new Error("Conta desativada. Contacte o suporte.");
    const validPassword = await bcrypt.compare(
      password,
      user.password as string,
    );
    if (!validPassword) throw new Error("Senha incorreta, tente novamente.");
    let coach;
    if (user.coach && user.coach.length > 0) {
      coach = [await User.findById(user.coach[0]).select("-password")];
    }

    if (!coach || coach.length === 0) {
      coach = null;
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      coach: coach,
      role: user.role,
      atheletes: user.atheletes,
      active: user.active,
      verified: user.verified,
    };
  },

  async getAll() {
    return User.find().select("-password");
  },

  async getById(id: string) {
    const user = await User.findById(id)
      .populate("coach", "-password")
      .populate("atheletes", "-password")
      .select("-password");
    if (!user) throw new Error("Usuário não encontrado");
    return user;
  },

  async getByEmail(email: string) {
    const user = await User.findOne({ email }).select("-password");
    if (!user) throw new Error("Usuário não encontrado");
    return user;
  },

  async getMyAthletes(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error("Usuário não encontrado");
    if (user.role !== "PT" && user.role !== "Admin")
      throw new Error("Apenas PTs têm atletas");

    //pts tem um parametro athletes que é um array de ids de atletas
    const athletes = await User.find({ _id: { $in: user.atheletes } }).select(
      "-password",
    );
    return athletes;
  },

  async deactivate(id: string) {
    const user = await User.findByIdAndUpdate(
      id,
      { active: false },
      { new: true },
    ).select("-password");
    if (!user) throw new Error("Usuário não encontrado");
    return user;
  },

  async activate(id: string) {
    const user = await User.findByIdAndUpdate(
      id,
      { active: true },
      { new: true },
    ).select("-password");
    if (!user) throw new Error("Usuário não encontrado");
    return user;
  },

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      role?: string;
      coach?: string;
      atheletes?: string[];
    },
  ) {
    const { name, email, phoneNumber, role, coach, atheletes } = data;
    if (phoneNumber) {
      const existingUser = await User.findOne({
        phoneNumber,
        _id: { $ne: id },
      });
      if (existingUser)
        throw new Error(
          "O número de telemóvel já está a ser usado por outro utilizador",
        );
    }
    // constrói update dinâmico
    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (role) updateData.role = role;
    if (coach) updateData.coach = coach;
    if (atheletes) updateData.atheletes = atheletes;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!user) throw new Error("Usuário não encontrado");

    return user;
  },

  async getStaff() {
    return User.find({
      role: { $in: ["PT", "Admin"] },
      active: true,
      verified: true,
    }).select("-password");
  },

  async saveExpoPushToken(userId: string, expoPushToken: string) {
    const user = await User.findByIdAndUpdate(
      userId,
      { expoPushToken },
      { new: true },
    ).select("-password");
    if (!user) throw new Error("Usuário não encontrado");
    return user;
  },
};
