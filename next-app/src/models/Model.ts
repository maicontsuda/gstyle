import mongoose from 'mongoose';

const ModelSchema = new mongoose.Schema({
  manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['SUV', 'Sedan', 'Hatch', 'K-Car', 'Minivan', 'Sport', 'Pickup', 'Outro'], required: true },
  year: { type: Number, required: true },
  basePriceJapan: { type: Number, required: true }, // Preço base em Ienes ¥
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.CarModel || mongoose.model('CarModel', ModelSchema);
