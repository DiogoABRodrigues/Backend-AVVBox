
import { Schema, model, Types } from 'mongoose';

const MeasuresSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  height: Number,
  weight: Number,
  bodyFat: Number,
  muscleMass: Number,
  visceralFat: Number
});

export const Measures = model('Produto', MeasuresSchema);
