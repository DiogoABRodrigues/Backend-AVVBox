import { Request, Response } from "express";
import { trainingService } from "../services/trainingService";

export class TrainingController {
  async getByPT(req: Request, res: Response) {
    try {
      const { ptId } = req.params;
      const trainings = await trainingService.getByPT(ptId);
      res.json(trainings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { date, hour, duration, PT, athlete, proposedBy } = req.body;
      const training = await trainingService.create({
        date,
        hour,
        duration,
        PT,
        athlete,
        proposedBy,
      });
      res.status(201).json(training);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async accept(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body; // quem está a aceitar
      const training = await trainingService.accept(id, userId);
      res.json(training);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async reject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body; // quem está a rejeitar
      const training = await trainingService.reject(id, userId);
      res.json(training);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body; // quem está a cancelar
      const training = await trainingService.cancel(id, userId);
      res.json(training);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await trainingService.delete(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getUpcoming(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const trainings = await trainingService.getUpcoming(userId);
      res.json(trainings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getUpcomingFifteenDays(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const trainings = await trainingService.getUpcomingFifteenDays(userId);
      res.json(trainings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  //pending
  async getPending(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const trainings = await trainingService.getPending(userId);
      res.json(trainings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
