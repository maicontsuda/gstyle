import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  },
  tipo_usuario: {
    type: String,
    enum: ['admin', 'dono', 'funcionario', 'cliente'],
    default: 'cliente'
  },
  mostrarRolPub: {
    type: Boolean,
    default: false
  },
  anexos: [{
    tipo: {
      type: String,
      enum: ['foto', 'documento', 'post_social'],
      required: true
    },
    titulo: String,
    url: String, // Base64 ou URL real
    descricao: String,
    dataAdicao: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Previne a sobreposição de compilação de modelos no Next.js (Hot Reloading)
export default mongoose.models.User || mongoose.model('User', UserSchema);
