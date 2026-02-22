const express = require('express');
const router = express.Router();

// @route  POST /api/financiamento/simular
// Simula parcelas de financiamento
router.post('/simular', (req, res) => {
  const { valorVeiculo, entrada = 0, prazo = 48, taxaMensal = 1.49 } = req.body;

  if (!valorVeiculo || valorVeiculo <= 0) {
    return res.status(400).json({ error: 'Valor do veículo inválido.' });
  }

  const valorFinanciado = valorVeiculo - entrada;
  if (valorFinanciado <= 0) {
    return res.status(400).json({ error: 'Entrada não pode ser maior ou igual ao valor do veículo.' });
  }

  const taxa = taxaMensal / 100;
  // Price (SAC francês)
  const parcela = valorFinanciado * (taxa * Math.pow(1 + taxa, prazo)) / (Math.pow(1 + taxa, prazo) - 1);
  const totalPago = parcela * prazo + entrada;
  const totalJuros = totalPago - valorVeiculo;

  res.json({
    valorVeiculo,
    entrada,
    valorFinanciado: parseFloat(valorFinanciado.toFixed(2)),
    prazo,
    taxaMensal,
    parcela: parseFloat(parcela.toFixed(2)),
    totalPago: parseFloat(totalPago.toFixed(2)),
    totalJuros: parseFloat(totalJuros.toFixed(2))
  });
});

module.exports = router;
