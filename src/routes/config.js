const express = require('express');
const router = express.Router();
const Config = require('../models/Config');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/config
// @desc    Obter configurações públicas
// @access  Public
router.get('/', async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({ fotoContato: '', telefones: [], diasEspeciais: [] });
    }
    res.json(config);
  } catch (err) {
    console.error('[config GET]', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/config
// @desc    Atualizar configurações (Admin/Gerente/Dono apenas)
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const roles = ['admin', 'dono', 'gerente'];
    if (!req.user || !roles.includes(req.user.tipo_usuario)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const { fotoContato, telefones, enderecoLink, diasEspeciais, diasSemanaFolga } = req.body;

    let config = await Config.findOne();
    if (!config) config = new Config();

    if (fotoContato !== undefined) config.fotoContato = fotoContato;
    if (telefones !== undefined) config.telefones = telefones;
    if (enderecoLink !== undefined) config.enderecoLink = enderecoLink;
    if (diasEspeciais !== undefined) {
      config.diasEspeciais = diasEspeciais.map(d => ({
        data: d.data,
        tipo: d.tipo,
        descricao: d.descricao || '',
      }));
    }

    if (diasSemanaFolga !== undefined) config.diasSemanaFolga = diasSemanaFolga;

    await config.save();
    res.json(config);
  } catch (err) {
    console.error('[config POST]', err);
    res.status(500).json({ error: 'Erro ao salvar: ' + err.message });
  }
});

module.exports = router;
