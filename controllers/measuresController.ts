import { Request, Response } from "express";
import { measuresService } from "../services/measuresService";

export const measuresController = {
  async create(req: Request, res: Response) {
    try {
      const measure = await measuresService.createMeasure(req.body);
      res.status(201).json(measure);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao criar medida" });
    }
  },

  async getAtualByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const measures = await measuresService.getAtualByUser(userId);
      res.json(measures);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao buscar medidas" });
    }
  },

  async getByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const measures = await measuresService.getAllMeasuresByUser(userId);
      res.json(measures);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao buscar medidas" });
    }
  },

  async getLastByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const measures = await measuresService.getLastByUser(userId);
      res.json(measures);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao buscar medidas" });
    }
  },

  async getGoalByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const goalMeasure = await measuresService.getGoalMeasuresByUser(userId);
      res.json(goalMeasure);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao buscar medida de objetivo" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await measuresService.updateMeasure(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Medida não encontrada" });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao atualizar medida" });
    }
  },
};
