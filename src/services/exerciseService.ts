import { Weights } from "../models/Exercice";
import { Types } from "mongoose";

export const exerciseService = {

  async create(athleteId: string) {
    const weights = new Weights({
      athlete: athleteId,
      triceps: { exercises: [] },
      biceps: { exercises: [] },
      shoulders: { exercises: [] },
      back: { exercises: [] },
      chest: { exercises: [] },
      legs: { exercises: [] },
      abs: { exercises: [] },
      cardio: { exercises: [] },
      extra: { exercises: [] }
    });
    return await weights.save();
  },

  async createExercise(athleteId: string, group: string, name: string, weight: number, reps: number, sets: number, details?: string) {
    const validGroups = ["triceps", "biceps", "shoulders", "back", "chest", "legs", "abs", "cardio", "extra"];
    if (!validGroups.includes(group)) {
      throw new Error("Grupo muscular inválido");
    }

    let weightsDoc = await Weights.findOne({ athlete: athleteId });
    if (!weightsDoc) {
      weightsDoc = new Weights({ athlete: athleteId });
    }

    // Verifica se já existe exercício com o mesmo nome
    const exists = (weightsDoc[group as keyof typeof weightsDoc] as { exercises: { name: string }[] }).exercises.some(
      (ex) => ex.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      throw new Error("Já existe um exercício com esse nome neste grupo muscular");
    }

  if (group === "extra") {
      (weightsDoc[group as keyof typeof weightsDoc] as any).exercises.push({ name, details: details || "" });
    } else {
      (weightsDoc[group as keyof typeof weightsDoc] as any).exercises.push({ name, weight, reps, sets });
    }
    await weightsDoc.save();

    return weightsDoc;
  },

  async updateExercise(Id: string, athleteId: string, group: string, newExerciseName: string, newWeight: number, reps: number, sets: number, details?: string) {
    const weightsDoc = await Weights.findOne({ athlete: new Types.ObjectId(athleteId) });
    if (!weightsDoc) throw new Error("Atleta não encontrado");

    const exercise = (weightsDoc[group as keyof typeof weightsDoc] as any).exercises.id(Id);
    if (!exercise) throw new Error("Exercício não encontrado");

    if (group === "extra") {
      exercise.name = newExerciseName;
      exercise.details = details || exercise.details;
      await weightsDoc.save();
      return weightsDoc;
    }
    
    exercise.weight = newWeight;
    exercise.reps = reps;
    exercise.sets = sets;
    exercise.name = newExerciseName;
    await weightsDoc.save();

    return weightsDoc;
  },

  async deleteExercise(athleteId: string, group: string, exerciseName: string) {
    const weightsDoc = await Weights.findOne({ athlete: athleteId });
    if (!weightsDoc) throw new Error("Atleta não encontrado");

    const groupExercises = (weightsDoc[group as keyof typeof weightsDoc] as any).exercises;
    const index = groupExercises.findIndex(
      (ex: { name: string }) => ex.name.toLowerCase() === exerciseName.toLowerCase()
    );

    if (index === -1) throw new Error("Exercício não encontrado");

    groupExercises.splice(index, 1); // remove o exercício

    await weightsDoc.save();
    return weightsDoc;
  },


  async getByAthlete(athleteId: string) {
    return await Weights.findOne({ athlete: new Types.ObjectId(athleteId) });
  }
}
