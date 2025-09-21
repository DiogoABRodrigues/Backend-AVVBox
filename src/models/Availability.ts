import { Schema, model, Types } from "mongoose";

const TimeRangeSchema = new Schema(
  {
    start: { type: String, required: true }, // formato "HH:mm"
    end: { type: String, required: true },
  },
  { _id: false },
);

// Schema para cada dia
const DaySchema = new Schema(
  {
    working: { type: Boolean, default: true }, // indica se o dia é dia de trabalho
    intervals: { type: [TimeRangeSchema], default: [] }, // mantém os horários
  },
  { _id: false },
);

const AvailabilitySchema = new Schema({
  PT: { type: Types.ObjectId, ref: "User", required: true },
  Monday: {
    type: DaySchema,
    default: () => ({ working: false, intervals: [] }),
  },
  Tuesday: {
    type: DaySchema,
    default: () => ({ working: false, intervals: [] }),
  },
  Wednesday: {
    type: DaySchema,
    default: () => ({ working: false, intervals: [] }),
  },
  Thursday: {
    type: DaySchema,
    default: () => ({ working: false, intervals: [] }),
  },
  Friday: {
    type: DaySchema,
    default: () => ({ working: false, intervals: [] }),
  },
  Saturday: {
    type: DaySchema,
    default: () => ({ working: false, intervals: [] }),
  },
  Sunday: {
    type: DaySchema,
    default: () => ({ working: false, intervals: [] }),
  },
  maxAthletesPerHour: { type: Number, required: true, default: 1 },
});

export const Availability = model("Availability", AvailabilitySchema);
