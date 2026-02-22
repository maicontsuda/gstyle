const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
    usuario:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    carro:     { type: mongoose.Schema.Types.ObjectId, ref: 'Carro', required: true },
    data:      { type: Date, required: true },
    mensagem:  { type: String, default: '' },
    status:    { type: String, enum: ['pendente', 'confirmada', 'cancelada'], default: 'pendente' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reserva', reservaSchema);
