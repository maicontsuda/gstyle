const mongoose = require('mongoose');

const propostaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Opcional, o usuário pode não estar logado
  },
  valorDesejado: {
    type: Number,
    required: true
  },
  entrada: {
    type: Number,
    default: 0
  },
  parcelas: {
    type: Number,
    required: true
  },
  nomeCompleto: {
    type: String,
    required: true
  },
  telefone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  tipoVisto: {
    type: String,
    enum: ['Permanente', 'Cônjuge de Japonês', 'Residente de Longo Prazo', 'Visto de Trabalho (Engenheiro/Humanas)', 'Dependente (Kajoku Taizai)', 'Estudante', 'Outro'],
    required: true
  },
  tipoEmprego: {
    type: String,
    enum: ['Seishain (Efetivo)', 'Keiyaku (Contrato Empreiteira / Hakken)', 'Keiyaku (Contrato Direto)', 'Arubaito / Part-time', 'Autônomo (Kojin Jigyo)', 'Desempregado', 'Outro'],
    required: true
  },
  status: {
    type: String,
    enum: ['pendente', 'aprovada', 'recusada'],
    default: 'pendente'
  },
  observacoesAdmin: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('PropostaFinanciamento', propostaSchema);
