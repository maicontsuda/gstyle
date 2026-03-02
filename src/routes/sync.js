/**
 * routes/sync.js
 * Rota interna para importação de carros via script local.
 * Protegida por SYNC_SECRET_KEY no .env
 */
const express = require('express');
const router = express.Router();
const Carro = require('../models/Carro');
const ZeroKmCar = require('../models/ZeroKmCar');

const SYNC_KEY = process.env.SYNC_SECRET_KEY || 'gstyle-sync-2024';

function checkKey(req, res, next) {
  const key = req.headers['x-sync-key'];
  if (key !== SYNC_KEY) return res.status(403).json({ error: 'Chave inválida.' });
  next();
}

// POST /api/sync/carro  → Adiciona ou atualiza no estoque (Carro/seminovo)
router.post('/carro', checkKey, async (req, res) => {
  try {
    const { marca, modelo, ano, status } = req.body;

    // Evitar duplicata
    const existente = await Carro.findOne({
      marca: new RegExp(`^${marca}$`, 'i'),
      modelo: new RegExp(`^${modelo}$`, 'i'),
      ano: Number(ano),
      status
    });

    if (existente) {
      const atualizado = await Carro.findByIdAndUpdate(existente._id, req.body, { new: true });
      return res.json({ acao: 'atualizado', carro: atualizado });
    }

    const novo = new Carro(req.body);
    await novo.save();
    res.status(201).json({ acao: 'adicionado', carro: novo });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/sync/zerokm  → Adiciona ou atualiza no catálogo 0KM
router.post('/zerokm', checkKey, async (req, res) => {
  try {
    const { brand, model, year } = req.body;

    const existente = await ZeroKmCar.findOne({
      brand: new RegExp(`^${brand}$`, 'i'),
      model: new RegExp(`^${model}$`, 'i'),
      year: Number(year)
    });

    if (existente) {
      const atualizado = await ZeroKmCar.findByIdAndUpdate(existente._id, req.body, { new: true });
      return res.json({ acao: 'atualizado', carro: atualizado });
    }

    const novo = new ZeroKmCar(req.body);
    await novo.save();
    res.status(201).json({ acao: 'adicionado', carro: novo });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
