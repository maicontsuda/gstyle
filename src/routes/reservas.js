const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');
const authMiddleware = require('../middleware/auth');

// @route  GET /api/reservas  (usuário logado)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const reservas = await Reserva.find({ usuario: req.user.id })
      .populate('carro', 'marca modelo ano imagens valor')
      .sort({ createdAt: -1 });
    res.json(reservas);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar reservas.' });
  }
});

// @route  POST /api/reservas  — agendamento de test drive
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { carro, data, mensagem } = req.body;
    if (!carro || !data) return res.status(400).json({ error: 'Carro e data são obrigatórios.' });

    const reserva = new Reserva({
      usuario: req.user.id,
      carro,
      data: new Date(data),
      mensagem
    });
    await reserva.save();
    await reserva.populate('carro', 'marca modelo ano imagens valor');
    res.status(201).json(reserva);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route  DELETE /api/reservas/:id — cancelar reserva
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const reserva = await Reserva.findOne({ _id: req.params.id, usuario: req.user.id });
    if (!reserva) return res.status(404).json({ error: 'Reserva não encontrada.' });
    reserva.status = 'cancelada';
    await reserva.save();
    res.json({ message: 'Reserva cancelada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cancelar reserva.' });
  }
});

module.exports = router;
