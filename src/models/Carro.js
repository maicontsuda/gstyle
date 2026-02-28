const mongoose = require('mongoose');

const carroSchema = new mongoose.Schema({
    marca:          { type: String, required: true },
    modelo:         { type: String, required: true },
    ano:            { type: Number, required: true },
    km:             { type: Number, required: true },
    cor:            { type: String, required: true },
    valor:          { type: Number, required: true },
    status:         { type: String, enum: ['zero_km', 'semi_novo'], required: true },
    tipo:           { type: String, enum: ['sedan', 'suv', 'hatch', 'pickup', 'esportivo', 'van', 'kei', 'minivan', 'outro'], default: 'sedan' },
    descricao:      { type: String, default: '' },
    concessionaria: { type: String, default: 'G-Style Motors' },
    destaque:       { type: Boolean, default: false },
    imagens:        { type: [String], default: [] },
    combustivel:    { type: String, enum: ['gasolina', 'etanol', 'flex', 'diesel', 'eletrico', 'hibrido'], default: 'hibrido' },
    cambio:         { type: String, enum: ['manual', 'automatico', 'cvt'], default: 'automatico' },
    potencia:       { type: String, default: '' },
    // Campos extras para Estoque (Seminovos)
    garantia:       { type: String, default: '' },       // Ex: "6 meses de garantia de motor"
    defeitos:       { type: String, default: '' },       // Ex: "Risco leve no para-choque traseiro"
    modificacoes:   { type: String, default: '' },       // Ex: "Rodas de liga leve aftermarket"
    informacoes_adicionais: { type: String, default: '' }, // Campo livre adicional
    createdAt:      { type: Date, default: Date.now },
    updatedAt:      { type: Date, default: Date.now }
});

carroSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Carro', carroSchema);