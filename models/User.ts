import { Schema, model, Types } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // referência para o PT principal (pode ser null se for PT/Admin)
  coach: { type: Types.ObjectId, ref: 'User', default: null },
  
  // array de coaches substitutos
  subs: [{ type: Types.ObjectId, ref: 'User' }],
  
  // role do user
  role: { type: String, enum: ['atleta', 'PT', 'Admin'], required: true },

  measures: {
    height: { type: Number }, // altura em cm
    weight: { type: Number }, // peso em kg
    bodyFat: { type: Number }, // percentagem de gordura corporal
    muscleMass: { type: Number }, // massa muscular em kg
    visceralFat: { type: Number }, // gordura visceral
  },
});

export const User = model('User', UserSchema);
