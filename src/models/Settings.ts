import { Schema, model, Types } from "mongoose";

const SettingsSchema = new Schema({
  user: { type: Types.ObjectId, ref: "User", required: true },
  fifteenMin: { type: Boolean, default: false },
  thirtyMin: { type: Boolean, default: false },
  sixtyMin: { type: Boolean, default: false },
  onetwentyMin: { type: Boolean, default: false },
  trainingPending: { type: Boolean, default: true },
  trainingApproved: { type: Boolean, default: true },
  trainingRejected: { type: Boolean, default: true },
  trainingCanceled: { type: Boolean, default: true },
  trainingUpdated: { type: Boolean, default: false },
});

export const Settings = model("Settings", SettingsSchema);
