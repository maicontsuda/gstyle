const express = require('express');
const router = express.Router();
const Publicacao = require('../models/Publicacao');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.tipo_usuario)) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  next();
};

// GET /api/publicacoes — Público
// Filtra por tipo, datas ativas e retorna randomizados se random=true
router.get('/', async (req, res) => {
  try {
    const { tipo, random, limit } = req.query;
    
    // Filtro para datas ativas:
    // Não pode ter dataInicio no futuro e nem dataFim no passado
    const now = new Date();
    const filter = { 
      ativo: true,
      $and: [
        { $or: [{ dataInicio: null }, { dataInicio: { $lte: now } }] },
        { $or: [{ dataFim: null }, { dataFim: { $gte: now } }] }
      ]
    };
    if (tipo && tipo !== 'todos') filter.tipo = tipo;

    if (random === 'true') {
      const limitNumber = parseInt(limit) || 5;
      const publicacoes = await Publicacao.aggregate([
        { $match: filter },
        { $sample: { size: limitNumber } }
      ]);
      return res.json(publicacoes);
    }

    const publicacoes = await Publicacao.find(filter).sort({ dataPublicacao: -1 }).populate('parceiroVinculado', 'username thumbnail');
    res.json(publicacoes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar publicações.' });
  }
});

// GET /api/publicacoes/admin — (Admin/Parceiro)
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const isStaff = ['admin', 'dono', 'gerente', 'funcionario'].includes(req.user.tipo_usuario);
    const filter = isStaff ? {} : { parceiroVinculado: req.user._id };
    const publicacoes = await Publicacao.find(filter).sort({ dataPublicacao: -1 }).populate('parceiroVinculado', 'username email');
    res.json(publicacoes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar publicações.' });
  }
});

// POST /api/publicacoes — (Admin) Adiciona nova publicação
router.post('/', authMiddleware, roleMiddleware('admin', 'dono', 'gerente', 'funcionario'), async (req, res) => {
  try {
    const { tipo, titulo, imagemUrl, linkDestino, descricao, dataInicio, dataFim, parceiroVinculado } = req.body;
    const pub = new Publicacao({ 
      tipo, titulo, imagemUrl, linkDestino, descricao, 
      dataInicio: dataInicio || null, 
      dataFim: dataFim || null, 
      parceiroVinculado: parceiroVinculado || null 
    });
    await pub.save();
    res.status(201).json(pub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Middleware local para validar se o usuário é adm ou o parceiro vinculado
const canEditOrDelete = async (req, res, next) => {
  const isStaff = ['admin', 'dono', 'gerente', 'funcionario'].includes(req.user.tipo_usuario);
  const pub = await Publicacao.findById(req.params.id);
  if (!pub) return res.status(404).json({ error: 'Publicação não encontrada.' });
  
  const isOwner = pub.parceiroVinculado?.toString() === req.user._id.toString();
  if (!isStaff && !isOwner) return res.status(403).json({ error: 'Acesso negado. Apenas o autor ou administradores podem editar.' });
  
  req.publicacao = pub; // Passa adiante para não buscar de novo
  next();
};

// PATCH /api/publicacoes/:id — (Admin ou Parceiro)
router.patch('/:id', authMiddleware, canEditOrDelete, async (req, res) => {
  try {
    const { tipo, titulo, imagemUrl, linkDestino, descricao, dataInicio, dataFim, parceiroVinculado, ativo } = req.body;
    const pub = req.publicacao;
    if (tipo !== undefined) pub.tipo = tipo;
    if (titulo !== undefined) pub.titulo = titulo;
    if (imagemUrl !== undefined) pub.imagemUrl = imagemUrl;
    if (linkDestino !== undefined) pub.linkDestino = linkDestino;
    if (descricao !== undefined) pub.descricao = descricao;
    if (ativo !== undefined) pub.ativo = ativo;
    
    // Somente staff pode mudar o parceiro vinculado (proteger de falhas de segurança)
    const isStaff = ['admin', 'dono', 'gerente', 'funcionario'].includes(req.user.tipo_usuario);
    if (isStaff) {
        if (dataInicio !== undefined) pub.dataInicio = dataInicio || null;
        if (dataFim !== undefined) pub.dataFim = dataFim || null;
        if (parceiroVinculado !== undefined) pub.parceiroVinculado = parceiroVinculado || null;
    }

    await pub.save();
    res.json(pub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/publicacoes/:id — (Admin ou Parceiro)
router.delete('/:id', authMiddleware, canEditOrDelete, async (req, res) => {
  try {
    await Publicacao.findByIdAndDelete(req.params.id);
    res.json({ message: 'Publicação removida com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover publicação.' });
  }
});

module.exports = router;
