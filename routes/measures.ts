import { Router } from 'express';
import { Measures } from '../models/Measures';
import { User } from '../models/User';

const router = Router();

// ======================
// Criar nova medida para um usuário
// ======================
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { height, weight, bodyFat, muscleMass, visceralFat } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    const measure = new Measures({
      user: userId,
      height,
      weight,
      bodyFat,
      muscleMass,
      visceralFat
    });

    await measure.save();
    res.status(201).json({ message: 'Medida criada', measure });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar medida', error: err });
  }
});

// ======================
// Listar todas as medidas de um usuário (histórico)
// ======================
router.get('/:userId', async (req, res) => {
  try {
    const measures = await Measures.find({ user: req.params.userId }).sort({ date: -1 });
    res.json(measures);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar medidas', error: err });
  }
});

// ======================
// Atualizar medida específica
// ======================
router.put('/:id', async (req, res) => {
  try {
    const measure = await Measures.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!measure) return res.status(404).json({ message: 'Medida não encontrada' });
    res.json({ message: 'Medida atualizada', measure });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar medida', error: err });
  }
});

// ======================
// Deletar medida específica
// ======================
router.delete('/:id', async (req, res) => {
  try {
    const measure = await Measures.findByIdAndDelete(req.params.id);
    if (!measure) return res.status(404).json({ message: 'Medida não encontrada' });
    res.json({ message: 'Medida deletada' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar medida', error: err });
  }
});

export default router;
