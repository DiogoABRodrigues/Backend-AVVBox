import { Schema, model, Types } from 'mongoose';

// Schema para cada exercício
const ExerciseSchema = new Schema({
  name: { type: String, required: true }, // ex: "Supino"
  weight: { type: Number, required: false, default: 0 }, // ex: 45 (kg)
  reps : { type: Number, required: false, default: 0 },   // ex: 10
  sets : { type: Number, required: false, default: 0 },   // ex: 4
  details : { type: String, required: false, default: "" } // ex: "Detalhes adicionais"
});

// Schema para cada grupo muscular
const MuscleGroupSchema = new Schema({
  exercises: { type: [ExerciseSchema], default: [] }
}, { _id: false });

const WeightsSchema = new Schema({
  athlete: { type: Types.ObjectId, ref: 'User', required: true },
  triceps: { type: MuscleGroupSchema, default: () => ({ exercises: [] }) },
  biceps: { type: MuscleGroupSchema, default: () => ({ exercises: [] }) },
  shoulders: { type: MuscleGroupSchema, default: () => ({ exercises: [] }) },
  back: { type: MuscleGroupSchema, default: () => ({ exercises: [] }) },
  chest: { type: MuscleGroupSchema, default: () => ({ exercises: [] }) },
  legs: { type: MuscleGroupSchema, default: () => ({ exercises: [] }) },
  abs: { type: MuscleGroupSchema, default: () => ({ exercises: [] }) },
  cardio: { type: MuscleGroupSchema, default: () => ({ exercises: [] }) },
  extra: { type: MuscleGroupSchema, default: () => ({ exercises: [] }) }
}, { timestamps: true });

export const Weights = model('Weights', WeightsSchema);
