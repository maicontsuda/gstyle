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
  const [customModel, setCustomModel] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

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
  const isAdminOrDono = user && ['admin', 'dono', 'gerente', 'funcionario'].includes(user.tipo_usuario);
  if (!isAdminOrDono) {
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
      const payload = { ...formData };
      payload.colors_available = payload.colors_available.split(',').map(c => c.trim()).filter(c => c);

      // If files were selected, upload them first
      if (imageFiles.length > 0) {
        const uploadData = new FormData();
        imageFiles.forEach(f => uploadData.append('images', f));
        const uploadRes = await api.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
        const uploadedUrls = uploadRes.data.urls || [];
        // Merge with any manual URL entries
        const manualUrls = payload.images ? payload.images.split(',').map(i => i.trim()).filter(i => i) : [];
        payload.images = [...manualUrls, ...uploadedUrls];
      } else {
        payload.images = payload.images ? payload.images.split(',').map(i => i.trim()).filter(i => i) : [];
      }
      
      await api.post('/zerokm', payload);
      setSuccess('Veículo 0KM adicionado com sucesso!');
      setFormData({ ...formData, model: '', price: '', colors_available: '', images: '', engine: '' });
      setImageFiles([]);
      setImagePreviews([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao adicionar veículo.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  // Predefined Brands and Models categorized by origin
  const carModels = {
    Japonesa: {
      'Toyota': ['Corolla Cross', 'RAV4', 'Prius', 'Yaris Cross', 'Camry', 'Land Cruiser', 'C-HR', 'Crown', 'Alphard', 'Vellfire', 'Sienta', 'Aqua', 'Harrier'],
      'Honda': ['Vezel', 'Civic', 'ZR-V', 'Step WGN', 'Accord', 'Fit', 'Freed', 'N-BOX', 'N-WGN', 'Odyssey'],
      'Nissan': ['Kicks', 'Ariya', 'X-Trail', 'Note', 'Aura', 'Serena', 'Sakura', 'Skyline', 'Leaf', 'Roox'],
      'Mazda': ['CX-30', 'CX-5', 'CX-60', 'Mazda3', 'Mazda2', 'Roadster'],
      'Subaru': ['Crosstrek', 'Forester', 'Levorg', 'Outback', 'WRX', 'Impreza'],
      'Suzuki': ['Jimny', 'Swift', 'Hustler', 'Spacia', 'Alto', 'Solio', 'Crossbee'],
      'Mitsubishi': ['Outlander PHEV', 'Eclipse Cross', 'Delica D:5', 'eK X'],
      'Daihatsu': ['Tanto', 'Rocky', 'Taft', 'Move']
    },
    Importada: {
      'BMW': ['X1', 'X3', '3 Series', '4 Series', 'M2', 'M4', 'iX', 'i4', 'Z4', 'X5'],
      'Mercedes-Benz': ['GLA', 'GLB', 'GLC', 'C-Class', 'E-Class', 'A-Class', 'G-Class', 'EQA', 'EQB'],
      'Audi': ['Q3', 'Q5', 'A3', 'A4', 'e-tron', 'Q4 e-tron', 'A5', 'TT'],
      'Volkswagen': ['Golf', 'Polo', 'T-Roc', 'Tiguan', 'ID.4'],
      'Porsche': ['Macan', 'Cayenne', '911', 'Taycan', 'Panamera', '718 Boxster'],
      'Volvo': ['XC40', 'XC60', 'V60', 'C40', 'EX30'],
      'Jeep': ['Wrangler', 'Renegade', 'Compass', 'Grand Cherokee'],
      'Peugeot': ['208', '2008', '308', '3008', 'e-208'],
      'Renault': ['Kangoo', 'Lutecia', 'Captur', 'Megane R.S.'],
      'Land Rover': ['Defender', 'Range Rover Evoque', 'Discovery Sport', 'Range Rover Velar'],
      'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X']
    }
  };

  const handleOriginChange = (e) => {
    setFormData(prev => ({
      ...prev,
      origin: e.target.value,
      brand: '', // Reset brand when origin changes
      model: ''  // Reset model when origin changes
    }));
  };

  const handleBrandChange = (e) => {
    setFormData(prev => ({
      ...prev,
      brand: e.target.value,
      model: '' // Reset model when brand changes
    }));
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
                <select name="origin" value={formData.origin} onChange={handleOriginChange} required className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none cursor-pointer">
                  <option value="Japonesa">Doméstica (Japonesa)</option>
                  <option value="Importada">Importada</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Marca</label>
                <select name="brand" value={formData.brand} onChange={handleBrandChange} required className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none cursor-pointer">
                  <option value="">Selecione a Marca...</option>
                  {Object.keys(carModels[formData.origin]).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-[var(--chrome-light)]">Modelo</label>
                  <button type="button" onClick={() => { setCustomModel(v => !v); setFormData(p => ({...p, model: ''})); }}
                    className="text-xs text-[var(--chrome-dark)] hover:text-[var(--chrome-light)] underline transition-colors">
                    {customModel ? '← Usar lista padrão' : '+ Digitar variação personalizada'}
                  </button>
                </div>
                {customModel ? (
                  <input type="text" name="model" value={formData.model} onChange={handleChange} required
                    placeholder="Ex: Prius AX, RAV4 Hybrid 4WD..."
                    className="w-full bg-[var(--bg-card2)] border border-[var(--chrome-dark)] border-dashed rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none" />
                ) : (
                  <select name="model" value={formData.model} onChange={handleChange} required disabled={!formData.brand}
                    className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">Selecione o Modelo...</option>
                    {formData.brand && carModels[formData.origin][formData.brand].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                )}
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
              <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Fotos do Veículo</label>
              <div className="bg-[var(--bg-card2)] border-2 border-dashed border-[var(--border)] hover:border-[var(--chrome-dark)] rounded-xl p-6 text-center transition-colors cursor-pointer group" onClick={() => document.getElementById('img-upload-0km').click()}>
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm text-[var(--text-muted)] group-hover:text-white transition-colors">Clique para selecionar fotos</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">JPG, PNG, WEBP — Múltiplos arquivos permitidos</p>
                <input id="img-upload-0km" type="file" multiple accept="image/*" className="hidden" onChange={handleImageFilesChange} />
              </div>
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {imagePreviews.map((src, i) => (
                    <img key={i} src={src} alt={`preview ${i}`} className="w-24 h-24 object-cover rounded-lg border border-[var(--border)]" />
                  ))}
                </div>
              )}
              <p className="text-xs text-[var(--text-muted)] mt-3">Ou cole URLs diretas de imagens (separadas por vírgula):</p>
              <textarea name="images" value={formData.images} onChange={handleChange} rows="2" placeholder="https://imagem1.jpg, https://imagem2.jpg" className="mt-2 w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none resize-none text-sm"></textarea>
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
