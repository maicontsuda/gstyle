import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function AddZeroKm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    origin: 'Japonesa',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    fuel_type: 'Gasolina',
    category: 'SUV',
    transmission: 'AT',
    engine: '',
    is_new: true,
    colors_available: '',
    images: ''
  });

  // Basic Protection
  if (!user || user.role !== 'admin') {
    return (
      <div className="pt-32 container text-center min-h-screen">
        <h1 className="text-3xl text-red-500 mb-4">Acesso Negado</h1>
        <p className="text-[var(--text-muted)]">Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Formata os campos arrays (colors e images separados por vírgula)
      const payload = { ...formData };
      payload.colors_available = payload.colors_available.split(',').map(c => c.trim()).filter(c => c);
      payload.images = payload.images.split(',').map(i => i.trim()).filter(i => i);
      
      await api.post('/zerokm', payload);
      setSuccess('Veículo 0KM adicionado com sucesso!');
      
      // Reset after success
      setFormData({
        ...formData,
        model: '', price: '', colors_available: '', images: '', engine: ''
      });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao adicionar veículo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter bg-[var(--bg-deep)] min-h-screen pt-32 pb-16">
      <div className="container max-w-3xl">
        <div className="card p-8 backdrop-blur-xl border-[var(--border)] shadow-2xl">
          <div className="mb-8">
            <span className="badge badge-gold mb-3">Admin Panel</span>
            <h1 className="text-3xl font-playfair font-bold text-[var(--chrome-light)]">Adicionar Veículo 0KM</h1>
            <p className="text-[var(--text-muted)] mt-2">Cadastre um novo modelo no catálogo do Japão.</p>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">{error}</div>}
          {success && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg mb-6">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Origem</label>
                <select name="origin" value={formData.origin} onChange={handleChange} required className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none cursor-pointer">
                  <option value="Japonesa">Doméstica (Japonesa)</option>
                  <option value="Importada">Importada</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Marca</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange} required placeholder="Ex: Toyota, BMW" className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Modelo</label>
                <input type="text" name="model" value={formData.model} onChange={handleChange} required placeholder="Ex: Corolla Cross" className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Preço (¥ JPY)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required placeholder="Ex: 3500000" className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Ano</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} required className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Categoria</label>
                <select name="category" value={formData.category} onChange={handleChange} required className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none cursor-pointer">
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Minivan">Minivan</option>
                  <option value="Kei Car">Kei Car</option>
                  <option value="Esportivo">Esportivo</option>
                  <option value="Picape">Picape</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Câmbio</label>
                <select name="transmission" value={formData.transmission} onChange={handleChange} required className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none cursor-pointer">
                  <option value="AT">Automático (AT)</option>
                  <option value="CVT">CVT</option>
                  <option value="MT">Manual (MT)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Combustível</label>
                <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} required className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none cursor-pointer">
                  <option value="Gasolina">Gasolina</option>
                  <option value="Hybrid">Híbrido (HEV/PHEV)</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Elétrico">Elétrico (EV)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Motor (Opcional)</label>
                <input type="text" name="engine" value={formData.engine} onChange={handleChange} placeholder="Ex: 1.8L VVT-i" className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Cores Disponíveis (separadas por vírgula)</label>
              <input type="text" name="colors_available" value={formData.colors_available} onChange={handleChange} placeholder="Branco Pérola, Preto Metálico, Prata" className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Links de Imagens (separados por vírgula)</label>
              <textarea name="images" value={formData.images} onChange={handleChange} rows="3" placeholder="https://imagem1.jpg, https://imagem2.jpg" className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none resize-none"></textarea>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3">
              <button type="button" onClick={() => navigate('/zero-km')} className="px-6 py-3 rounded-lg font-bold text-[var(--text-muted)] hover:text-white transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="px-8 py-3 rounded-lg font-bold bg-gradient-to-r from-[var(--chrome-light)] to-[var(--chrome)] text-black hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.2)]">
                {loading ? 'Salvando...' : 'Adicionar Veículo'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
