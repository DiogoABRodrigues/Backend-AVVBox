import { Router } from 'express';
import { Notification } from '../models/Notifications';
import { User } from '../models/User';

const router = Router();

// ======================
// Criar nova medida para um usuário
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
      // "Meus atletas" - aqui assumimos que o User tem um campo athletes[]
      recipients = sender.athletes?.map((a: any) => a.toString()) || [];
    } else if (Array.isArray(target)) {
      // Lista de IDs individuais
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
// Listar todas as medidas de um usuário (histórico)
// ======================
router.get('/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.params.userId }).sort({ date: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar medidas', error: err });
  }
});

// ======================
// Deletar medida específica
// ======================
router.delete('/:id', async (req, res) => {
  try {
    const measure = await Notification.findByIdAndDelete(req.params.id);
    if (!measure) return res.status(404).json({ message: 'Notification não encontrada' });
    res.json({ message: 'Notification deletada' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar Notification', error: err });
  }
});

export default router;
