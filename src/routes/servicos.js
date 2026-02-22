const express = require('express');
const router = express.Router();
const Servico = require('../models/Servico');
const authMiddleware = require('../middleware/auth');

// @route  GET /api/servicos
router.get('/', async (req, res) => {
  try {
    const servicos = await Servico.find({ ativo: true }).sort({ createdAt: -1 });
    res.json(servicos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar serviços.' });
  }
});

// @route  POST /api/servicos  (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const servico = new Servico(req.body);
    await servico.save();
    res.status(201).json(servico);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route  DELETE /api/servicos/:id  (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Servico.findByIdAndUpdate(req.params.id, { ativo: false });
    res.json({ message: 'Serviço desativado.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao desativar serviço.' });
  }
});

module.exports = router;
