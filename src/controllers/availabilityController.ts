import { Request, Response } from "express";
import { availabilityService } from "../services/availabilityService";

export class AvailabilityController {
  // Criar um novo availability
  async create(req: Request, res: Response) {
    try {
      const avail = await availabilityService.create(req.body);
      res.status(201).json(avail);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Atualizar um availability existente pelo _id
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const avail = await availabilityService.update(id, req.body);
      if (!avail) {
        return res.status(404).json({ message: "Availability not found" });
      }
      res.json(avail);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Buscar availability pelo PT
  async getByPT(req: Request, res: Response) {
    try {
      const { ptId } = req.params;
      const avail = await availabilityService.getByPT(ptId);
      if (!avail) {
        return res.status(404).json({ message: "Availability not found" });
      }
      res.json(avail);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
