const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    thumbnail: {
        type: String,
        default: '',
    },
    tipo_usuario: {
        type: String,
        enum: ['cliente', 'funcionario', 'dono', 'admin'],
        default: 'cliente',
    },
    // Dados opcionais — visíveis apenas para o próprio usuário, admin, dono e funcionário
    telefone: {
        type: String,
        default: '',
    },
    endereco: {
        pais:        { type: String, default: 'Japão' },
        prefeitura:  { type: String, default: '' },
        cidade:      { type: String, default: '' },
        bairro:      { type: String, default: '' },
        cep:         { type: String, default: '' },
    },
    // Campos geridos pelo Admin (Histórico do Cliente)
    anexos: [{
        tipo: { type: String, enum: ['documento', 'foto', 'video', 'post_social'] },
        titulo: String,
        url: String, // Link da imagem, vídeo ou URL do post do Instagram/Facebook
        descricao: String,
        dataAdicao: { type: Date, default: Date.now }
    }],
    // Controle do Rol de Clientes (Galeria Pública)
    rolCliente: {
        visivel: { type: Boolean, default: false }, // Cliente decide
        fotoDestaque: String,
        depoimento: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);