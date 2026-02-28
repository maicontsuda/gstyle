import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  versionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CarVersion', required: true },
  type: { type: String, enum: ['color', 'wheel', 'interior', 'tech', 'package'], required: true },
  name: { type: String, required: true },
  additionalPrice: { type: Number, default: 0 }, // Custo adcional em Ienes
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.CarOption || mongoose.model('CarOption', OptionSchema);
