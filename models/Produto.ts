import { Schema, model } from 'mongoose';

const ProdutoSchema = new Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  descricao: { type: String },
  estoque: { type: Number, default: 0 }
});

export const Produto = model('Produto', ProdutoSchema);
