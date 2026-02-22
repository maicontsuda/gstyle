const mongoose = require('mongoose');

const servicoSchema = new mongoose.Schema({
    nome:      { type: String, required: true },
    descricao: { type: String, default: '' },
    preco:     { type: Number, default: 0 },
    icone:     { type: String, default: 'wrench' },
    ativo:     { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Servico', servicoSchema);
