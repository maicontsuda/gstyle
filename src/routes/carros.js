const express = require('express');
const router = express.Router();
const Carro = require('../models/Carro');
const authMiddleware = require('../middleware/auth');

// @route  GET /api/carros
// Lista carros com filtros opcionais
router.get('/', async (req, res) => {
  try {
    const { marca, modelo, tipo, status, minValor, maxValor, minAno, maxAno, destaque, page = 1, limit = 12 } = req.query;
    const filtro = {};

    if (marca)    filtro.marca   = new RegExp(marca, 'i');
    if (modelo)   filtro.modelo  = new RegExp(modelo, 'i');
    if (tipo)     filtro.tipo    = tipo;
    if (status)   filtro.status  = status;
    if (destaque) filtro.destaque = destaque === 'true';
    if (minValor || maxValor) {
      filtro.valor = {};
      if (minValor) filtro.valor.$gte = Number(minValor);
      if (maxValor) filtro.valor.$lte = Number(maxValor);
    }
    if (minAno || maxAno) {
      filtro.ano = {};
      if (minAno) filtro.ano.$gte = Number(minAno);
      if (maxAno) filtro.ano.$lte = Number(maxAno);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [carros, total] = await Promise.all([
      Carro.find(filtro).sort({ destaque: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Carro.countDocuments(filtro)
    ]);

    res.json({ carros, total, paginas: Math.ceil(total / Number(limit)), paginaAtual: Number(page) });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar veículos.' });
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
