import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import './db';
import produtosRoutes from './routes/produtos';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// usar rotas separadas
app.use('/produtos', produtosRoutes);

app.listen(process.env.PORT || 3000, () => console.log('Servidor rodando na porta 3000'));
