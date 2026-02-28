const mongoose = require('mongoose');

const compraSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    carro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Carro',
        required: true,
    },
    dataCompra: {
        type: Date,
        default: Date.now,
    },
    valor: {
        type: Number,
        required: true,
    },
    entrada: {
        type: Number,
        default: 0,
    },
    parcelas: {
        type: Number,
        default: 1,
    },
    parcelasPagas: {
        type: Number,
        default: 0,
    },
    valorParcela: {
        type: Number,
        required: true,
    },
    // URL da imagem do contrato assinado (enviada pelo admin)
    contratoImagem: {
        type: String,
        default: '',
    },
    contratoTexto: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['em_dia', 'em_atraso', 'quitado'],
        default: 'em_dia',
    },
}, { timestamps: true });

// Virtual: quantas parcelas restam
compraSchema.virtual('parcelasRestantes').get(function() {
    return Math.max(0, this.parcelas - this.parcelasPagas);
});

compraSchema.set('toJSON', { virtuals: true });
compraSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Compra', compraSchema);
