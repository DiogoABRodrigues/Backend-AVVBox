import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import './db';
import measuresRoutes from './routes/measures';
import usersRoutes from './routes/user';
import notitificationsRoutes from './routes/notifications';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// usar rotas separadas
app.use('/measures', measuresRoutes);
app.use('/users', usersRoutes);
app.use('/notifications', notitificationsRoutes);

app.listen(process.env.PORT || 3000, () => console.log('Servidor rodando na porta 3000'));
