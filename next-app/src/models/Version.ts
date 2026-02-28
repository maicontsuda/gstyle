import mongoose from 'mongoose';

const VersionSchema = new mongoose.Schema({
  modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'CarModel', required: true },
  name: { type: String, required: true },
  engine: { type: String, required: true }, // ex: 2.0 Hybrid, EV, 1.5 Turbo
  transmission: { type: String, enum: ['Automatic', 'Manual', 'CVT', 'Direct Drive (EV)'], required: true },
  basePrice: { type: Number, required: true }, // Preço base em Ienes já somado com o CarModel ou absoluto
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.CarVersion || mongoose.model('CarVersion', VersionSchema);
