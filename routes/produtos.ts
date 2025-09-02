import { Router } from 'express';
import { Produto } from '../models/Produto';

const router = Router();

// LISTAR produtos
router.get('/', async (req, res) => {
  const produtos = await Produto.find();
  res.json(produtos);
});

// CRIAR produto
router.post('/', async (req, res) => {
  const produto = new Produto(req.body);
  await produto.save();
  res.json(produto);
});

// ATUALIZAR produto
router.put('/:id', async (req, res) => {
  const produto = await Produto.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(produto);
});

// DELETAR produto
router.delete('/:id', async (req, res) => {
  await Produto.findByIdAndDelete(req.params.id);
  res.json({ message: 'Produto deletado' });
});

export default router;
