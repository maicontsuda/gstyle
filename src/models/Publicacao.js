const mongoose = require('mongoose');

const publicacaoSchema = new mongoose.Schema({
    tipo: {
        type: String,
        enum: ['evento', 'parceiro', 'social'],
        required: true
    },
    titulo: {
        type: String,
        required: true
    },
    imagemUrl: {
        type: String,
        default: ''
    },
    linkDestino: {
        type: String,
        default: ''
    },
    descricao: {
        type: String,
        default: ''
    },
    ativo: {
        type: Boolean,
        default: true
    },
    dataPublicacao: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Publicacao', publicacaoSchema);
