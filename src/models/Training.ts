import { Schema, model, Types } from "mongoose";

const TrainingSchema = new Schema({
  date: { type: Date, required: true },
  hour: { type: String, required: true },
  duration: { type: Number, default: 60 },
  details: { type: String, default: "" },

  // PT que participa
  PT: { type: Types.ObjectId, ref: "User", required: true },

  // Atleta que participa
  athlete: { type: Types.ObjectId, ref: "User", required: true },

  // Quem criou a proposta (PT ou Atleta)
  proposedBy: {
    type: String,
    enum: ["PT", "Athlete", "Admin"],
    required: true,
  },

  // Status de aceite do PT
  ptStatus: {
    type: String,
    enum: ["proposed", "accepted", "rejected"],
    default: "proposed",
  },

  // Status de aceite do Atleta
  athleteStatus: {
    type: String,
    enum: ["proposed", "accepted", "rejected"],
    default: "proposed",
  },

  // Status geral do treino
  overallStatus: {
    type: String,
    enum: ["pending", "confirmed", "rejected", "cancelled"],
    default: "pending",
  },
});

export const Training = model("Training", TrainingSchema);
