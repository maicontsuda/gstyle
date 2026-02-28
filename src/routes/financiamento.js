const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const PropostaFinanciamento = require('../models/PropostaFinanciamento');

const roleMiddleware = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.tipo_usuario)) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  next();
};

// @route  POST /api/financiamento/simular
// Simula parcelas de financiamento (Realidade Japão)
router.post('/simular', (req, res) => {
  const { valorVeiculo, entrada = 0, prazo = 72, taxaAnual = 4.9 } = req.body;

  if (!valorVeiculo || valorVeiculo <= 0) {
    return res.status(400).json({ error: 'Valor do veículo inválido.' });
  }

  const valorFinanciado = valorVeiculo - entrada;
  if (valorFinanciado <= 0) {
    return res.status(400).json({ error: 'Entrada não pode ser maior ou igual ao valor do veículo.' });
  }

  // No JP as taxas são divulgadas ao ano (APR). Ex: 4.9% a.a.
  // Transformando taxa anual para taxa mensal efetiva simples (APR / 12)
  const taxaMensalDecimal = (taxaAnual / 100) / 12;

  // Calculo de Parcela Price
  // PMT = PV * i * (1+i)^n / ((1+i)^n - 1)
  const parcelaRaw = valorFinanciado * (taxaMensalDecimal * Math.pow(1 + taxaMensalDecimal, prazo)) / (Math.pow(1 + taxaMensalDecimal, prazo) - 1);
  const parcelaCalculada = Math.round(parcelaRaw); // Iene não tem centavos arredondado

  const totalPago = parcelaCalculada * prazo + entrada;
  const totalJuros = totalPago - valorVeiculo;

  res.json({
    valorVeiculo,
    entrada,
    valorFinanciado,
    prazo,
    taxaAnual,
    taxaMensalUtilizada: (taxaMensalDecimal * 100).toFixed(3),
    parcelaMensal: parcelaCalculada,
    totalPago,
    totalJuros
  });
});

// @route  POST /api/financiamento/proposta
// Salva uma nova proposta do cliente
router.post('/proposta', async (req, res) => {
  try {
    const { 
      valorDesejado, entrada, parcelas, nomeCompleto, telefone, 
      email, tipoVisto, tipoEmprego 
    } = req.body;

    const novaProposta = new PropostaFinanciamento({
      valorDesejado,
      entrada,
      parcelas,
      nomeCompleto,
      telefone,
      email,
      tipoVisto,
      tipoEmprego,
      // Se houver bearer token, atrelar ao ID, se não vai sem logar
      usuario: req.user ? req.user.id : null 
    });

    await novaProposta.save();
    res.status(201).json({ message: 'Proposta de Financiamento enviada com sucesso!' });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao enviar proposta. Verifique todos os campos obrigatórios.' });
  }
});

// @route  GET /api/financiamento/propostas
// Puxa as propostas (Apenas Admin)
router.get('/propostas', authMiddleware, roleMiddleware('admin', 'dono', 'funcionario'), async (req, res) => {
  try {
    const propostas = await PropostaFinanciamento.find().sort({ createdAt: -1 });
    res.json(propostas);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar propostas.' });
  }
});

// @route  PATCH /api/financiamento/propostas/:id
// Atualizar o status da proposta
router.patch('/propostas/:id', authMiddleware, roleMiddleware('admin', 'dono', 'funcionario'), async (req, res) => {
  try {
    const { status, observacoesAdmin } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (observacoesAdmin !== undefined) updates.observacoesAdmin = observacoesAdmin;

    const proposta = await PropostaFinanciamento.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!proposta) return res.status(404).json({ error: 'Proposta não encontrada.' });
    res.json(proposta);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar proposta.' });
  }
});

module.exports = router;
