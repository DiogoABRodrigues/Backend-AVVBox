import { Weights } from "../models/Exercice";
import { Types } from "mongoose";

export const exerciseService = {

  async create(data: any) {
    const weights = new Weights({
      athlete: new Types.ObjectId(data.athlete),
      triceps: { exercises: [] },
      biceps: { exercises: [] },
      shoulders: { exercises: [] },
      back: { exercises: [] },
      chest: { exercises: [] },
      legs: { exercises: [] },
      abs: { exercises: [] },
      cardio: { exercises: [] },
    });
    return await weights.save();
  },

  async createExercise(athleteId: string, group: string, name: string, weight: number, reps: number, sets: number) {
    const validGroups = ["triceps", "biceps", "shoulders", "back", "chest", "legs", "abs", "cardio"];
    if (!validGroups.includes(group)) {
      throw new Error("Grupo muscular inválido");
    }

    let weightsDoc = await Weights.findOne({ athlete: new Types.ObjectId(athleteId) }) as unknown as {
      [key: string]: { exercises: { name: string; weight: number; reps: number; sets: number }[] };
    } & { save: () => Promise<void> };
    if (!weightsDoc) {
      // cria doc inicial se ainda não existir
      weightsDoc = new Weights({ athlete: athleteId }) as unknown as {
        [key: string]: { exercises: { name: string; weight: number; reps: number; sets: number }[] };
      } & { save: () => Promise<void> };
    }

    // Verifica se já existe exercício com o mesmo nome
    const exists = weightsDoc[group].exercises.some(
      (ex) => ex.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      throw new Error("Já existe um exercício com esse nome neste grupo muscular");
    }

    weightsDoc[group].exercises.push({ name, weight, reps, sets });
    await weightsDoc.save();

    return weightsDoc;
  },

  async updateExercise(athleteId: string, group: string, exerciseName: string, newWeight: number, reps: number, sets: number) {
    const weightsDoc = await Weights.findOne({ athlete: new Types.ObjectId(athleteId) });
    if (!weightsDoc) throw new Error("Atleta não encontrado");

    const exercise = (weightsDoc[group as keyof typeof weightsDoc] as { exercises: { name: string; weight: number; reps: number; sets: number }[] }).exercises.find(
      (ex) => ex.name.toLowerCase() === exerciseName.toLowerCase()
    );
    if (!exercise) throw new Error("Exercício não encontrado");

    exercise.weight = newWeight;
    exercise.reps = reps;
    exercise.sets = sets;
    await weightsDoc.save();

    return weightsDoc;
  },

  async deleteExercise(athleteId: string, group: string, exerciseName: string) {
    const weightsDoc = await Weights.findOne({ athlete: new Types.ObjectId(athleteId) });
    if (!weightsDoc) throw new Error("Atleta não encontrado");

    const before = (weightsDoc[group as keyof typeof weightsDoc] as { exercises: { name: string; weight: number }[] }).exercises.length;
    (weightsDoc[group as keyof typeof weightsDoc] as { exercises: { name: string; weight: number }[] }).exercises = 
      (weightsDoc[group as keyof typeof weightsDoc] as { exercises: { name: string; weight: number }[] }).exercises.filter(
        (ex) => ex.name.toLowerCase() !== exerciseName.toLowerCase()
      );

    if ((weightsDoc[group as keyof typeof weightsDoc] as { exercises: { name: string; weight: number }[] }).exercises.length === before) {
      throw new Error("Exercício não encontrado");
    }

    await weightsDoc.save();
    return weightsDoc;
  },

  async getByAthlete(athleteId: string) {
    return await Weights.findOne({ athlete: new Types.ObjectId(athleteId) }).populate("athlete", "name email");
  }
}
