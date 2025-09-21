import { Schema, model, Types } from "mongoose";

const SettingsSchema = new Schema({
  user: { type: Types.ObjectId, ref: "User", required: true },
  fifteenMin: { type: Boolean, default: false },
  thirtyMin: { type: Boolean, default: false },
  sixtyMin: { type: Boolean, default: false },
  onetwentyMin: { type: Boolean, default: false },
});

export const Settings = model("Settings", SettingsSchema);
