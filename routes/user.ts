    import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';

const router = Router();
const saltRounds = 10;

// ======================
// Criar usuário (registro)
// ======================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, coach, subs } = req.body;

    // verificar se já existe usuário com email
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email já cadastrado' });

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      coach: coach || null,
      subs: subs || []
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar usuário', error: err });
  }
});

// ======================
// Login
// ======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email não encontrado' });

    const validPassword = await bcrypt.compare(password, user.password as string);
    if (!validPassword) return res.status(400).json({ message: 'Senha incorreta' });

    // Aqui você pode gerar um token JWT se quiser
    res.json({ message: 'Login bem-sucedido', user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao fazer login', error: err });
  }
});

// ======================
// Listar todos os usuários
// ======================
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // não retornar senha
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar usuários', error: err });
  }
});

// ======================
// Buscar atleta com coach e substitutos
// ======================
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('coach')       // popula o coach principal
      .populate('subs');       // popula os coaches substitutos

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar usuário', error: err });
  }
});

export default router;
