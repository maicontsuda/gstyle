import mongoose from 'mongoose';

const UsedCarSchema = new mongoose.Schema({
  manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  mileage: { type: Number, required: true },
  price: { type: Number, required: true }, // Preço em ¥
  region: { type: String, required: true }, // Ken/Província
  description: { type: String },
  images: [{ type: String }],
  financingAvailable: { type: Boolean, default: true },
  status: { type: String, enum: ['available', 'reserved', 'sold'], default: 'available' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Caso permita multi-lojista
}, { timestamps: true });

export default mongoose.models.UsedCar || mongoose.model('UsedCar', UsedCarSchema);
