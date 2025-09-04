import { Router } from 'express';
import { Notification } from '../models/Notifications';
import { User } from '../models/User';

const router = Router();

// ======================
// Criar nova notificação (para all, my ou lista de IDs)
// ======================
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, body, target } = req.body;

    // Verifica se o remetente existe
    const sender = await User.findById(userId);
    if (!sender) return res.status(404).json({ message: 'Usuário remetente não encontrado' });

    let recipients: string[] = [];

    if (target === 'all') {
      // Todos os usuários
      const users = await User.find({});
      recipients = users.map(u => u._id.toString());
    } else if (target === 'my') {
      // "Meus atletas" - se tiveres esse campo no User
      // recipients = sender.athletes?.map((a: any) => a.toString()) || [];
      recipients = ["68b7163c7b0970f449d99b2e"]; // Placeholder, ajustar conforme o modelo de User
    } else if (Array.isArray(target)) {
      recipients = target;
    } else {
      return res.status(400).json({ message: 'Target inválido' });
    }

    // Cria a notificação para cada destinatário
    const notifications = await Notification.insertMany(
      recipients.map(r => ({
        user: r,
        title,
        body,
        target,
      }))
    );


    res.status(201).json({
      message: 'Notificações criadas',
      notifications,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar notificações', error: err });
  }
});

// ======================
// Listar todas as notificações (admin)
// ======================
router.get('/', async (_req, res) => {
  try {
    const notifications = await Notification.find().sort({ date: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar notificações', error: err });
  }
});

// ======================
// Listar notificações de um user específico
// ======================
router.get('/:targetId', async (req, res) => {
  try {
    const { targetId } = req.params;

    const notifications = await Notification.find({
      $or: [
        { target: { $in: [targetId] } }       // notificações enviadas em lista de IDs
      ]
    }).sort({ date: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar notificações do user', error: err });
  }
});

// ======================
// Deletar notificação específica
// ======================
router.delete('/:notificationId/:userId', async (req, res) => {
  try {
    const { notificationId, userId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ message: 'Notification não encontrada' });

    // Remove o userId do array target
    notification.target.pull(userId);
    await notification.save();

    res.json({ message: 'Notificação removida do usuário', notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar notificação', error: err });
  }
});

// ======================
// Marcar notificação como lida para um usuário
// ======================
router.post('/:notificationId/:userId/read', async (req, res) => {
  try {
    const { notificationId, userId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ message: 'Notification não encontrada' });

    // Adiciona o userId ao array readBy se ainda não estiver
      const mongoose = require('mongoose');
      notification.readBy.push(new mongoose.Types.ObjectId(userId));
      await notification.save();

    res.json({ message: 'Notificação marcada como lida', notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao marcar notificação como lida', error: err });
  }
});
export default router;
