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

// ── Google OAuth ─────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?erro=auth` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, jwtSecret, { expiresIn: '7d' });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  }
);

// ── Usuário logado ────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-__v')
      .populate('favoritosCarros', 'marca modelo ano valor imagens kilometragem km')
      .populate('historicoCarros.carro', 'marca modelo ano valor imagens kilometragem km')
      .populate('favoritosPublicacoes', 'titulo tipo dataPublicacao imagemUrl linkDestino ativo')
      .populate('historicoPublicacoes.publicacao', 'titulo tipo dataPublicacao imagemUrl linkDestino ativo');
      
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    if (user.email === 'maicontsuda@gmail.com' && user.tipo_usuario !== 'admin') {
      user.tipo_usuario = 'admin';
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
});

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

// ── Favoritos e Histórico ──────────────────────────────────────────────────
router.post('/favoritos/carros/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const index = user.favoritosCarros.indexOf(req.params.id);
    if (index > -1) {
      user.favoritosCarros.splice(index, 1);
    } else {
      user.favoritosCarros.push(req.params.id);
    }
    await user.save();
    res.json({ success: true, isFavorite: index === -1 });
  } catch (err) { res.status(500).json({ error: 'Erro ao favoritar carro.' }); }
});

router.post('/favoritos/publicacoes/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const index = user.favoritosPublicacoes.indexOf(req.params.id);
    if (index > -1) {
      user.favoritosPublicacoes.splice(index, 1);
    } else {
      user.favoritosPublicacoes.push(req.params.id);
    }
    await user.save();
    res.json({ success: true, isFavorite: index === -1 });
  } catch (err) { res.status(500).json({ error: 'Erro ao favoritar publicação.' }); }
});

router.post('/historico/carros/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // Remove if already exists to move to top
    user.historicoCarros = user.historicoCarros.filter(h => h.carro.toString() !== req.params.id);
    user.historicoCarros.unshift({ carro: req.params.id, viewedAt: new Date() });
    // Keep only last 20
    if (user.historicoCarros.length > 20) user.historicoCarros.pop();
    await user.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Erro ao registrar histórico.' }); }
});

router.post('/historico/publicacoes/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.historicoPublicacoes = user.historicoPublicacoes.filter(h => h.publicacao.toString() !== req.params.id);
    user.historicoPublicacoes.unshift({ publicacao: req.params.id, viewedAt: new Date() });
    if (user.historicoPublicacoes.length > 20) user.historicoPublicacoes.pop();
    await user.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Erro ao registrar histórico.' }); }
});

// ── Rol de Clientes (Público) ─────────────────────────────────────────────
router.get('/rol-clientes', async (req, res) => {
  try {
    const clientes = await User.find({ 'rolCliente.visivel': true })
      .select('anexos rolCliente username thumbnail createdAt');

    let galeria = [];
    clientes.forEach(cliente => {
      // Foto de entrega (quando cliente marcou como pública)
      if (cliente.rolCliente?.fotoEntrega && cliente.rolCliente?.fotoPublica) {
        galeria.push({
          _id: `${cliente._id}_entrega`,
          tipo: 'foto',
          url: cliente.rolCliente.fotoEntrega,
          titulo: `Entrega — ${cliente.username || 'Cliente'}`,
          descricao: cliente.rolCliente.depoimento || '',
          dataAdicao: cliente.createdAt || new Date(),
          isEntrega: true,
        });
      }
      // Outros anexos (foto/post_social)
      if (cliente.anexos?.length > 0) {
        const fotosEPosts = cliente.anexos.filter(a => a.tipo === 'foto' || a.tipo === 'post_social');
        galeria.push(...fotosEPosts);
      }
    });

    galeria.sort((a, b) => new Date(b.dataAdicao) - new Date(a.dataAdicao));
    res.json(galeria);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar a galeria de clientes.' });
  }
});

// ── Gerenciamento do próprio Rol (cliente) ───────────────────────────────
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

router.patch('/me/rol-foto', authMiddleware, async (req, res) => {
  try {
    const { fotoPublica, visivel } = req.body;
    const updates = {};
    if (fotoPublica !== undefined) updates['rolCliente.fotoPublica'] = fotoPublica;
    if (visivel !== undefined)     updates['rolCliente.visivel']     = visivel;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-__v');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Admin: Listar e gerenciar usuários ────────────────────────────────────
router.get('/users', authMiddleware, roleMiddleware('admin', 'dono', 'gerente', 'funcionario'), async (req, res) => {
  try {
    const users = await User.find().select('-password -__v').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// @route  GET /api/auth/users/:id — Admin busca cliente específico
router.get('/users/:id', authMiddleware, roleMiddleware('admin', 'dono', 'gerente', 'funcionario'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
});

// @route  PATCH /api/auth/users/:id/tipo — Admin muda role
router.patch('/users/:id/tipo', authMiddleware, roleMiddleware('admin', 'dono'), async (req, res) => {
  try {
    const { tipo_usuario } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { tipo_usuario }, { new: true }).select('-__v');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route  PATCH /api/auth/users/:id/anexos — Admin adiciona contratos/fotos/posts
router.patch('/users/:id/anexos', authMiddleware, roleMiddleware('admin', 'dono', 'gerente', 'funcionario'), async (req, res) => {
  try {
    const { anexos } = req.body;
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

// @route  DELETE /api/auth/users/:id/anexos/:aid — Admin remove anexo
router.delete('/users/:id/anexos/:aid', authMiddleware, roleMiddleware('admin', 'dono', 'gerente', 'funcionario'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $pull: { anexos: { _id: req.params.aid } } },
      { new: true }
    ).select('-__v');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover anexo.' });
  }
});

// @route  PATCH /api/auth/users/:id/veiculo — Admin salva info do carro
router.patch('/users/:id/veiculo', authMiddleware, roleMiddleware('admin', 'dono', 'gerente', 'funcionario'), async (req, res) => {
  try {
    const updates = {};
    ['marca','modelo','ano','cor','placa','chassi','shakenVencimento','observacoes']
      .forEach(c => { if (req.body[c] !== undefined) updates[`veiculo.${c}`] = req.body[c]; });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-__v');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// @route  PATCH /api/auth/users/:id/financiamento — Admin salva parcelas
router.patch('/users/:id/financiamento', authMiddleware, roleMiddleware('admin', 'dono', 'gerente', 'funcionario'), async (req, res) => {
  try {
    const updates = {};
    ['totalParcelas','parcelasPagas','valorParcela','dataInicio','observacoes']
      .forEach(c => { if (req.body[c] !== undefined) updates[`financiamento.${c}`] = req.body[c]; });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-__v');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// @route  POST /api/auth/users/:id/manutencao — Admin adiciona registro
router.post('/users/:id/manutencao', authMiddleware, roleMiddleware('admin', 'dono', 'gerente', 'funcionario'), async (req, res) => {
  try {
    const { tipo, data, kmAtual, kmProxima, dataProxima, observacoes } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $push: { manutencao: { tipo, data, kmAtual, kmProxima, dataProxima, observacoes, registradoPor: req.user.email } } },
      { new: true }
    ).select('-__v');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// @route  DELETE /api/auth/users/:id/manutencao/:mid — Remove registro de manutenção
router.delete('/users/:id/manutencao/:mid', authMiddleware, roleMiddleware('admin', 'dono', 'gerente', 'funcionario'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $pull: { manutencao: { _id: req.params.mid } } },
      { new: true }
    ).select('-__v');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// @route  POST /api/auth/users/:id/lembrete — Admin adiciona lembrete
router.post('/users/:id/lembrete', authMiddleware, roleMiddleware('admin', 'dono', 'gerente', 'funcionario'), async (req, res) => {
  try {
    const { tipo, mensagem } = req.body;
    if (!mensagem) return res.status(400).json({ error: 'Mensagem obrigatória.' });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $push: { lembretes: { tipo, mensagem, dataEnvio: new Date(), enviado: false } } },
      { new: true }
    ).select('-__v');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// @route  PATCH /api/auth/users/:id/rol-foto — Admin sobe foto de entrega das chaves
router.patch('/users/:id/rol-foto', authMiddleware, roleMiddleware('admin', 'dono', 'gerente', 'funcionario'), async (req, res) => {
  try {
    const { fotoEntrega, depoimento } = req.body;
    const updates = {};
    if (fotoEntrega !== undefined) updates['rolCliente.fotoEntrega'] = fotoEntrega;
    if (depoimento !== undefined)  updates['rolCliente.depoimento']  = depoimento;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-__v');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── Logout ────────────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso.' });
});

module.exports = router;
