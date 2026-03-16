const mongoose = require('mongoose');

const DiaEspecialSchema = new mongoose.Schema({
  data: { type: String, required: true }, // ISO date string: "2026-03-15"
  tipo: { type: String, enum: ['folga', 'evento'], required: true },
  descricao: { type: String, default: '' },
});

const ConfigSchema = new mongoose.Schema({
  fotoContato: { type: String, default: '' },
  telefones: { type: [String], default: [] },
  enderecoLink: { type: String, default: 'https://maps.google.com' },
  diasEspeciais: { type: [DiaEspecialSchema], default: [] },
  diasSemanaFolga: { type: [Number], default: [] }, // 0=Dom,1=Seg,2=Ter,3=Qua,4=Qui,5=Sex,6=Sáb
}, { timestamps: true });

// Teremos sempre apenas um documento de Config
module.exports = mongoose.model('Config', ConfigSchema);
