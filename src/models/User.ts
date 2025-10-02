import { Schema, model, Types } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  phoneNumber: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  // referência para o PT principal (pode ser null se for PT/Admin)
  coach: [{ type: Types.ObjectId, ref: "User", default: null }, { size: 1 }],

  // role do user
  role: { type: String, enum: ["atleta", "PT", "Admin"], required: true, index: true },

  // lista ids de atletas (apenas para PTs)
  atheletes: [{ type: Types.ObjectId, ref: "User", default: [] }],

  active: { type: Boolean, default: true },

  verified: { type: Boolean, default: false },

  verificationToken: { type: String, default: null },

  passwordResetCode: { type: String, default: null },

  expoPushToken: { type: String, default: null },
});

export const User = model("User", UserSchema);
