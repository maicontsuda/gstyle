const express = require('express');
const router = express.Router();
const Compra = require('../models/Compra');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.tipo_usuario)) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  next();
};

// GET /api/compras/minhas — Compras do próprio usuário logado
router.get('/minhas', authMiddleware, async (req, res) => {
  try {
    const compras = await Compra.find({ usuario: req.user.id })
      .populate('carro', 'marca modelo ano imagens cor km')
      .sort({ dataCompra: -1 });
    res.json(compras);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar compras.' });
  }
});

// GET /api/compras — Lista todas as compras (admin/dono/funcionario)
router.get('/', authMiddleware, roleMiddleware('admin', 'dono', 'funcionario'), async (req, res) => {
  try {
    const compras = await Compra.find()
      .populate('usuario', 'username email thumbnail')
      .populate('carro', 'marca modelo ano imagens')
      .sort({ dataCompra: -1 });
    res.json(compras);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar compras.' });
  }
});

// GET /api/compras/:id — Detalhe de uma compra
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const compra = await Compra.findById(req.params.id)
      .populate('usuario', 'username email')
      .populate('carro');
    if (!compra) return res.status(404).json({ error: 'Compra não encontrada.' });

    // Só o dono da compra, ou admins/dono/funcionario podem ver
    const isOwner = compra.usuario._id.toString() === req.user.id;
    const isStaff = ['admin', 'dono', 'funcionario'].includes(req.user.tipo_usuario);
    if (!isOwner && !isStaff) return res.status(403).json({ error: 'Acesso negado.' });

    res.json(compra);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar compra.' });
  }
});

// POST /api/compras — Registrar nova compra (admin/dono/funcionario)
router.post('/', authMiddleware, roleMiddleware('admin', 'dono', 'funcionario'), async (req, res) => {
  try {
    const { usuario, carro, valor, entrada, parcelas, valorParcela, contratoImagem, contratoTexto } = req.body;
    const compra = new Compra({
      usuario, carro, valor,
      entrada: entrada || 0,
      parcelas: parcelas || 1,
      valorParcela,
      contratoImagem: contratoImagem || '',
      contratoTexto: contratoTexto || '',
    });
    await compra.save();
    const populated = await compra.populate('carro', 'marca modelo ano');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/compras/:id — Atualizar parcelas pagas (admin/dono/funcionario)
router.patch('/:id', authMiddleware, roleMiddleware('admin', 'dono', 'funcionario'), async (req, res) => {
  try {
    const { parcelasPagas, status, contratoImagem, contratoTexto } = req.body;
    const updates = {};
    if (parcelasPagas !== undefined) updates.parcelasPagas = parcelasPagas;
    if (status) updates.status = status;
    if (contratoImagem !== undefined) updates.contratoImagem = contratoImagem;
    if (contratoTexto !== undefined) updates.contratoTexto = contratoTexto;

    const compra = await Compra.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('carro', 'marca modelo ano');
    if (!compra) return res.status(404).json({ error: 'Compra não encontrada.' });
    res.json(compra);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
