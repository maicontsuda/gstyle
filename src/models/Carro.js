const mongoose = require('mongoose');

const carroSchema = new mongoose.Schema({
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    ano: { type: Number, required: true },
    km: { type: Number, required: true },
    cor: { type: String, required: true },
    valor: { type: Number, required: true },
    status: { type: String, enum: ['zero_km', 'semi_novo'], required: true },
    imagens: { type: [String], required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Carro', carroSchema);