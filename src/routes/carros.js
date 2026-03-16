const express = require('express');
const router = express.Router();
const Carro = require('../models/Carro');
const authMiddleware = require('../middleware/auth');

// @route  GET /api/carros
// Lista carros com filtros opcionais (Apenas visíveis publicamente ou não vendidos)
router.get('/', async (req, res) => {
  try {
    const { marca, modelo, tipo, status, minValor, maxValor, minAno, maxAno, destaque, page = 1, limit = 12 } = req.query;
    
    // Filtro base: não vendido OU vendido mas com vinculoPúblico true
    // Para carros antigos na base, a prop isVendido pode não existir, então verificamos $ne: true (não é igual a true)
    const filtro = {
      $or: [
        { isVendido: { $ne: true } },
        { isVendido: true, vinculoPublico: true }
      ]
    };

    if (marca)    filtro.marca   = new RegExp(marca, 'i');
    if (modelo)   filtro.modelo  = new RegExp(modelo, 'i');
    if (tipo)     filtro.tipo    = tipo;
    if (status)   filtro.status  = status;
    if (destaque) filtro.destaque = destaque === 'true';
    if (minValor || maxValor) {
      if (!filtro.valor) filtro.valor = {};
      if (minValor) filtro.valor.$gte = Number(minValor);
      if (maxValor) filtro.valor.$lte = Number(maxValor);
    }
    if (minAno || maxAno) {
      if (!filtro.ano) filtro.ano = {};
      if (minAno) filtro.ano.$gte = Number(minAno);
      if (maxAno) filtro.ano.$lte = Number(maxAno);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const carros = await Carro.find(filtro)
      .populate('comprador', 'username thumbnail')
      .sort({ destaque: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Carro.countDocuments(filtro);

    res.json({ carros, total, paginas: Math.ceil(total / Number(limit)), paginaAtual: Number(page) });
  } catch (err) {
    console.error('Erro em /api/carros:', err);
    res.status(500).json({ error: 'Erro ao buscar veículos.' });
  }
});

// @route  GET /api/carros/admin
// Lista todos os carros para o painel admin (ignora visibilidade)
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Separa as queries para evitar array destruct em caso de erro na Promise
    const carros = await Carro.find({})
      .populate('comprador', 'username emal thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Carro.countDocuments({});

    res.json({ carros, total, paginas: Math.ceil(total / Number(limit)), paginaAtual: Number(page) });
  } catch (err) {
    console.error('Erro em /api/carros/admin:', err);
    res.status(500).json({ error: 'Erro ao buscar veículos admin.' });
  }
});

// @route  GET /api/carros/:id
router.get('/:id', async (req, res) => {
  try {
    const carro = await Carro.findById(req.params.id);
    if (!carro) return res.status(404).json({ error: 'Veículo não encontrado.' });
    res.json(carro);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar veículo.' });
  }
});

// @route  POST /api/carros  (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const carro = new Carro(req.body);
    await carro.save();
    res.status(201).json(carro);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route PATCH /api/carros/vinculo/:id
// Permite que cliente ou admin alterem a visibilidade do vínculo de um carro
router.patch('/vinculo/:id', authMiddleware, async (req, res) => {
  try {
    const { vinculoPublico } = req.body;
    const carro = await Carro.findById(req.params.id);
    
    if (!carro) return res.status(404).json({ error: 'Veículo não encontrado.' });
    
    // Verifica permissões: apenas o dono da compra (se for um client) ou admin/gerente/dono
    const isOwner = carro.comprador && carro.comprador.toString() === req.user.id;
    const isAdmin = ['admin', 'dono', 'gerente'].includes(req.user.tipo_usuario);
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Acesso negado para alterar a privacidade deste veículo.' });
    }

    carro.vinculoPublico = Boolean(vinculoPublico);
    await carro.save();
    res.json(carro);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar vínculo do veículo.' });
  }
});

// @route  PUT /api/carros/:id  (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const carro = await Carro.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!carro) return res.status(404).json({ error: 'Veículo não encontrado.' });
    res.json(carro);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route  DELETE /api/carros/:id  (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const carro = await Carro.findByIdAndDelete(req.params.id);
    if (!carro) return res.status(404).json({ error: 'Veículo não encontrado.' });
    res.json({ message: 'Veículo removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover veículo.' });
  }
});

module.exports = router;
