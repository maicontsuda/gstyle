const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId:   { type: String, required: true },
    username:   { type: String, required: true, unique: true },
    email:      { type: String, required: true, unique: true },
    thumbnail:  { type: String, default: '' },
    tipo_usuario: {
        type: String,
        enum: ['cliente', 'funcionario', 'gerente', 'dono', 'admin'],
        default: 'cliente',
    },
    telefone: { type: String, default: '' },
    endereco: {
        pais:       { type: String, default: 'Japão' },
        prefeitura: { type: String, default: '' },
        cidade:     { type: String, default: '' },
        bairro:     { type: String, default: '' },
        cep:        { type: String, default: '' },
    },
    // ── Veículo do cliente ───────────────────────────────────────────────
    veiculo: {
        marca:            { type: String, default: '' },
        modelo:           { type: String, default: '' },
        ano:              { type: Number },
        cor:              { type: String, default: '' },
        placa:            { type: String, default: '' },
        chassi:           { type: String, default: '' },
        shakenVencimento: { type: Date },
        observacoes:      { type: String, default: '' },
    },
    // ── Financiamento ────────────────────────────────────────────────────
    financiamento: {
        totalParcelas:  { type: Number, default: 0 },
        parcelasPagas:  { type: Number, default: 0 },
        valorParcela:   { type: Number, default: 0 },
        dataInicio:     { type: Date },
        observacoes:    { type: String, default: '' },
    },
    // ── Histórico de manutenção ──────────────────────────────────────────
    manutencao: [{
        tipo:         { type: String, enum: ['oleo','filtro_oleo','filtro_ar','filtro_combustivel','shaken','revisao','pneu','freio','outro'], default: 'outro' },
        data:         { type: Date, default: Date.now },
        kmAtual:      { type: Number, default: 0 },
        kmProxima:    { type: Number },
        dataProxima:  { type: Date },
        observacoes:  { type: String, default: '' },
        registradoPor:{ type: String, default: '' },
    }],
    // ── Lembretes ────────────────────────────────────────────────────────
    lembretes: [{
        tipo:      { type: String, enum: ['shaken','revisao','parcela','documentos','outro'], default: 'outro' },
        mensagem:  { type: String, required: true },
        dataEnvio: { type: Date, default: Date.now },
        enviado:   { type: Boolean, default: false },
    }],
    // ── Anexos (documentos/fotos gerenciados pelo admin) ─────────────────
    anexos: [{
        tipo:      { type: String, enum: ['documento', 'foto', 'video', 'post_social'] },
        titulo:    String,
        url:       String,
        descricao: String,
        dataAdicao:{ type: Date, default: Date.now }
    }],
    // ── Rol de Clientes ──────────────────────────────────────────────────
    rolCliente: {
        visivel:     { type: Boolean, default: false },
        fotoEntrega: { type: String, default: '' },   // foto da entrega das chaves
        fotoPublica: { type: Boolean, default: false },
        depoimento:  { type: String, default: '' },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);