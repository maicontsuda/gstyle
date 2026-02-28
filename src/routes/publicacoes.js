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
// Filtra por tipo (evento, parceiro, social) ou retorna todos ativos
router.get('/', async (req, res) => {
  try {
    const { tipo } = req.query;
    const filter = { ativo: true };
    if (tipo) filter.tipo = tipo;

    const publicacoes = await Publicacao.find(filter).sort({ dataPublicacao: -1 });
    res.json(publicacoes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar publicações.' });
  }
});

// GET /api/publicacoes/admin — (Admin) Retorna inclusive as inativas
router.get('/admin', authMiddleware, roleMiddleware('admin', 'dono', 'funcionario'), async (req, res) => {
  try {
    const publicacoes = await Publicacao.find().sort({ dataPublicacao: -1 });
    res.json(publicacoes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar publicações.' });
  }
});

// POST /api/publicacoes — (Admin) Adiciona nova publicação
router.post('/', authMiddleware, roleMiddleware('admin', 'dono', 'funcionario'), async (req, res) => {
  try {
    const { tipo, titulo, imagemUrl, linkDestino, descricao } = req.body;
    const pub = new Publicacao({ tipo, titulo, imagemUrl, linkDestino, descricao });
    await pub.save();
    res.status(201).json(pub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/publicacoes/:id — (Admin) Atualiza publicação (ex: inativar)
router.patch('/:id', authMiddleware, roleMiddleware('admin', 'dono', 'funcionario'), async (req, res) => {
  try {
    const pub = await Publicacao.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pub) return res.status(404).json({ error: 'Publicação não encontrada.' });
    res.json(pub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/publicacoes/:id — (Admin) Deleta publicação
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'dono', 'funcionario'), async (req, res) => {
  try {
    const pub = await Publicacao.findByIdAndDelete(req.params.id);
    if (!pub) return res.status(404).json({ error: 'Publicação não encontrada.' });
    res.json({ message: 'Publicação removida com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover publicação.' });
  }
});

module.exports = router;
