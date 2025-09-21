import { Settings } from "../models/Settings";
import { Types } from "mongoose";

export const settingsService = {
  async create(userId: string, data: any) {
    const settings = new Settings({
      user: new Types.ObjectId(userId),
      ...data,
    });
    return await settings.save();
  },

  async update(userId: string, data: any) {
    return await Settings.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { $set: data },
      { new: true, upsert: true }, // cria se não existir
    );
  },

  async getByUser(userId: string) {
    return await Settings.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      {}, // não altera nada
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  },
};
