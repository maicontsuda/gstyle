import mongoose from 'mongoose';

const ManufacturerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  logoUrl: { type: String },
  country: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Manufacturer || mongoose.model('Manufacturer', ManufacturerSchema);
