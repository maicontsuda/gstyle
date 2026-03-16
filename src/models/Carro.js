const mongoose = require('mongoose');

const carroSchema = new mongoose.Schema({
    marca:          { type: String, required: true },
    modelo:         { type: String, required: true },
    ano:            { type: Number, required: true },
    km:             { type: Number, default: null },   // opcional: zero KM não tem KM
    mesModelo:      { type: String, default: '' },     // mês de fabricação
    diaModelo:      { type: String, default: '' },     // dia de fabricação
    shakenVencimento: { type: String, default: '' },   // vencimento do shaken (YYYY-MM)
    cor:            { type: String, required: true },
    valor:          { type: Number, required: true },
    status:         { type: String, enum: ['zero_km', 'semi_novo'], required: true },
    tipo:           { type: String, enum: ['sedan', 'suv', 'hatch', 'pickup', 'esportivo', 'van', 'kei', 'minivan', 'outro'], default: 'sedan' },
    descricao:      { type: String, default: '' },
    observacoes:    { type: String, default: '' },     // observações visíveis ao cliente
    concessionaria: { type: String, default: 'G-Style Motors' },
    destaque:       { type: Boolean, default: false },
    imagens:        { type: [String], default: [] },
    equipamentos:   { type: [String], default: [] },
    combustivel:    { type: String, enum: ['gasolina', 'etanol', 'flex', 'diesel', 'eletrico', 'hibrido'], default: 'hibrido' },
    cambio:         { type: String, enum: ['manual', 'automatico', 'cvt'], default: 'automatico' },
    potencia:       { type: String, default: '' },
    cilindradas:    { type: Number, default: null },   // ex: 2500
    // Campos Extras goo-net / Specs
    portas:         { type: Number, default: 5 },
    lotacao:        { type: Number, default: 5 },      // passageiros
    tracao:         { type: String, default: '' },     // ex: 2WD, 4WD
    // Campos extras para Estoque (Seminovos)
    historicoReparo:{ type: Boolean, default: false }, //修復歴 (true = tem histórico)
    donoUnico:      { type: Boolean, default: false }, //ワンオーナー
    garantia:       { type: String, default: '' },
    defeitos:       { type: String, default: '' },
    modificacoes:   { type: String, default: '' },
    informacoes_adicionais: { type: String, default: '' },
    isVendido:      { type: Boolean, default: false },
    comprador:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    vinculoPublico: { type: Boolean, default: false },
    // Redes Sociais / Multimídia
    linkVideo:      { type: String, default: '' },     // YouTube, Facebook, etc.
    linkInstagram:  { type: String, default: '' },     // Post/Reels no Instagram
    createdAt:      { type: Date, default: Date.now },
    updatedAt:      { type: Date, default: Date.now }
});

carroSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Carro', carroSchema);