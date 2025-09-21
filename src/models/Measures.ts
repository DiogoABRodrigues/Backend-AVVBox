import { Schema, model, Types } from "mongoose";

const MeasuresSchema = new Schema({
  user: { type: Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ["atual", "goal"], required: true },
  height: Number,
  weight: Number,
  bodyFat: Number,
  muscleMass: Number,
  visceralFat: Number,
});

export const Measures = model("Measures", MeasuresSchema);
