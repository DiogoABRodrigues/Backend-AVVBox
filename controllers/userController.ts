import { Request, Response } from "express";
import { userService } from "../services/userService";

export const userController = {
  async register(req: Request, res: Response) {
    try {
      const user = await userService.register(req.body);
      res.status(201).json({ message: "Usuário criado com sucesso", user });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erro ao criar usuário", error: err });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { login, password } = req.body;
      const user = await userService.login(login, password);
      res.json({ message: "Login bem-sucedido", user });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erro ao fazer login", error: err });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const users = await userService.getAll();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao listar usuários", error: err });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const user = await userService.getById(req.params.id);
      res.json(user);
    } catch (err: any) {
      res.status(404).json({ message: err.message || "Usuário não encontrado", error: err });
    }
  }
};
