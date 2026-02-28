const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.tipo_usuario)) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  next();
};

const User = require('../models/User');

// @route  GET /api/auth/google
// Inicia fluxo OAuth com Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// @route  GET /api/auth/google/callback
// Callback após autenticação Google
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?erro=auth` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, jwtSecret, { expiresIn: '7d' });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  }
);

// @route  GET /api/auth/me
// Retorna o usuário logado (requer token)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    
    // Auto-promover o dono da loja se for a primeira vez
    if (user.email === 'maicontsuda@gmail.com' && user.tipo_usuario !== 'admin') {
      user.tipo_usuario = 'admin';
      await user.save();
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
});

// @route  GET /api/auth/rol-clientes
// Retorna publicamente as fotos de entrega e posts de redes sociais (anônimo) dos clientes que ativaram o rol
router.get('/rol-clientes', async (req, res) => {
  try {
    const clientes = await User.find({ 'rolCliente.visivel': true }).select('anexos');
    
    let galeria = [];
    clientes.forEach(cliente => {
      if (cliente.anexos && cliente.anexos.length > 0) {
        const fotosEPosts = cliente.anexos.filter(a => a.tipo === 'foto' || a.tipo === 'post_social');
        galeria.push(...fotosEPosts);
      }
    });

    // Ordenar do mais recente para o mais antigo
    galeria.sort((a, b) => new Date(b.dataAdicao) - new Date(a.dataAdicao));

    res.json(galeria);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar a galeria de clientes.' });
  }
});

// @route  GET /api/auth/users
// Retorna todos os usuários (Apenas para admin/dono/funcionario)
router.get('/users', authMiddleware, roleMiddleware('admin', 'dono', 'funcionario'), async (req, res) => {
  try {
    const users = await User.find().select('-password -__v').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// @route  PATCH /api/auth/me — Atualiza telefone e endereço do usuário logado
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const { telefone, endereco } = req.body;
    const updates = {};
    if (telefone !== undefined) updates.telefone = telefone;
    if (endereco) {
      if (endereco.prefeitura !== undefined) updates['endereco.prefeitura'] = endereco.prefeitura;
      if (endereco.cidade !== undefined)     updates['endereco.cidade'] = endereco.cidade;
      if (endereco.bairro !== undefined)     updates['endereco.bairro'] = endereco.bairro;
      if (endereco.cep !== undefined)        updates['endereco.cep'] = endereco.cep;
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-__v');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

// @route  PATCH /api/auth/me/rol — Permite ao cliente ativar/desativar sua exibição no Rol
router.patch('/me/rol', authMiddleware, async (req, res) => {
  try {
    const { visivel } = req.body;
    const updates = {};
    if (visivel !== undefined) updates['rolCliente.visivel'] = visivel;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-__v');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar configuração do Rol.' });
  }
});

// @route  PATCH /api/auth/users/:id/anexos — Admin adiciona contratos/fotos/posts no perfil
router.patch('/users/:id/anexos', authMiddleware, roleMiddleware('admin', 'dono', 'funcionario'), async (req, res) => {
  try {
    const { anexos } = req.body;
    
    // Suporta envio legado (1 anexo no body) ou o novo formato (lista 'anexos' no body)
    let novosAnexos = [];
    if (anexos && Array.isArray(anexos)) {
      novosAnexos = anexos.map(a => ({ ...a, dataAdicao: new Date() }));
    } else {
      const { tipo, titulo, url, descricao } = req.body;
      if (!tipo || !titulo || !url) return res.status(400).json({ error: 'Dados insuficientes.' });
      novosAnexos = [{ tipo, titulo, url, descricao, dataAdicao: new Date() }];
    }

    if (novosAnexos.length === 0) return res.status(400).json({ error: 'Nenhum anexo fornecido.' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $push: { anexos: { $each: novosAnexos } } },
      { new: true }
    ).select('-__v');

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar anexos ao cliente.' });
  }
});

// @route  GET /api/auth/logout
router.get('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso.' });
});

module.exports = router;
