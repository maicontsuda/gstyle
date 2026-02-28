import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// ── Marcas/Modelos compartilhados com ZeroKM ──────────────────────────────
const carModels = {
  Japonesa: {
    'Toyota':     ['Corolla Cross', 'RAV4', 'Prius', 'Yaris Cross', 'Camry', 'Land Cruiser', 'C-HR', 'Crown', 'Alphard', 'Vellfire', 'Sienta', 'Aqua', 'Harrier'],
    'Honda':      ['Vezel', 'Civic', 'ZR-V', 'Step WGN', 'Accord', 'Fit', 'Freed', 'N-BOX', 'N-WGN', 'Odyssey'],
    'Nissan':     ['Kicks', 'Ariya', 'X-Trail', 'Note', 'Aura', 'Serena', 'Sakura', 'Skyline', 'Leaf', 'Roox'],
    'Mazda':      ['CX-30', 'CX-5', 'CX-60', 'Mazda3', 'Mazda2', 'Roadster'],
    'Subaru':     ['Crosstrek', 'Forester', 'Levorg', 'Outback', 'WRX', 'Impreza'],
    'Suzuki':     ['Jimny', 'Swift', 'Hustler', 'Spacia', 'Alto', 'Solio', 'Crossbee'],
    'Mitsubishi': ['Outlander PHEV', 'Eclipse Cross', 'Delica D:5', 'eK X'],
    'Daihatsu':   ['Tanto', 'Rocky', 'Taft', 'Move'],
    'Lexus':      ['NX', 'RX', 'UX', 'LX', 'LC', 'IS', 'ES']
  },
  Importada: {
    'BMW':           ['X1', 'X3', '3 Series', '4 Series', 'M2', 'M4', 'iX', 'i4', 'Z4', 'X5'],
    'Mercedes-Benz': ['GLA', 'GLB', 'GLC', 'C-Class', 'E-Class', 'A-Class', 'G-Class', 'EQA', 'EQB'],
    'Audi':          ['Q3', 'Q5', 'A3', 'A4', 'e-tron', 'Q4 e-tron', 'A5', 'TT'],
    'Volkswagen':    ['Golf', 'Polo', 'T-Roc', 'Tiguan', 'ID.4'],
    'Porsche':       ['Macan', 'Cayenne', '911', 'Taycan', 'Panamera', '718 Boxster'],
    'Volvo':         ['XC40', 'XC60', 'V60', 'C40', 'EX30'],
    'Jeep':          ['Wrangler', 'Renegade', 'Compass', 'Grand Cherokee'],
    'Land Rover':    ['Defender', 'Range Rover Evoque', 'Discovery Sport', 'Range Rover Velar'],
    'Tesla':         ['Model 3', 'Model Y', 'Model S', 'Model X']
  }
};

export default function AddEstoque() {
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
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    km: '',
    cor: '',
    valor: '',
    status: 'semi_novo',
    tipo: 'sedan',
    combustivel: 'hibrido',
    cambio: 'automatico',
    potencia: '',
    descricao: '',
    garantia: '',
    defeitos: '',
    modificacoes: '',
    informacoes_adicionais: '',
    imagens: ''
  });

  // Role protection
  const isAuthorized = user && ['admin', 'dono', 'gerente', 'funcionario'].includes(user.tipo_usuario);
  if (!isAuthorized) {
    return (
      <div className="pt-32 container text-center min-h-screen">
        <h1 className="text-3xl text-red-500 mb-4">Acesso Negado</h1>
        <p className="text-[var(--text-muted)]">Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOriginChange = (e) => {
    setFormData(prev => ({ ...prev, origin: e.target.value, marca: '', modelo: '' }));
  };

  const handleBrandChange = (e) => {
    setFormData(prev => ({ ...prev, marca: e.target.value, modelo: '' }));
  };

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = { ...formData };

      if (imageFiles.length > 0) {
        const uploadData = new FormData();
        imageFiles.forEach(f => uploadData.append('images', f));
        const uploadRes = await api.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
        const uploadedUrls = uploadRes.data.urls || [];
        const manualUrls = payload.imagens ? payload.imagens.split(',').map(i => i.trim()).filter(i => i) : [];
        payload.imagens = [...manualUrls, ...uploadedUrls];
      } else {
        payload.imagens = payload.imagens ? payload.imagens.split(',').map(i => i.trim()).filter(i => i) : [];
      }

      await api.post('/carros', payload);
      setSuccess('Veículo adicionado ao Estoque com sucesso!');
      setFormData({ ...formData, marca: '', modelo: '', km: '', cor: '', valor: '', potencia: '', descricao: '', garantia: '', defeitos: '', modificacoes: '', informacoes_adicionais: '', imagens: '' });
      setImageFiles([]);
      setImagePreviews([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao adicionar veículo ao estoque.');
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none cursor-pointer";
  const inputClass  = "w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none";
  const labelClass  = "block text-sm font-semibold text-[var(--chrome-light)] mb-2";
  const textareaClass = "w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none resize-none";

  return (
    <div className="page-enter bg-[var(--bg-deep)] min-h-screen pt-32 pb-16">
      <div className="container max-w-3xl">
        <div className="card p-8 backdrop-blur-xl border-[var(--border)] shadow-2xl">
          <div className="mb-8">
            <span className="badge badge-gold mb-3">Admin Panel</span>
            <h1 className="text-3xl font-playfair font-bold text-[var(--chrome-light)]">Adicionar ao Estoque</h1>
            <p className="text-[var(--text-muted)] mt-2">Cadastre um veículo seminovo no estoque da loja.</p>
          </div>

          {error   && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">{error}</div>}
          {success && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg mb-6">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Origem & Marca ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Origem</label>
                <select name="origin" value={formData.origin} onChange={handleOriginChange} required className={selectClass}>
                  <option value="Japonesa">Doméstica (Japonesa)</option>
                  <option value="Importada">Importada</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Marca</label>
                <select name="marca" value={formData.marca} onChange={handleBrandChange} required className={selectClass}>
                  <option value="">Selecione a Marca...</option>
                  {Object.keys(carModels[formData.origin]).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Modelo & Preço ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-[var(--chrome-light)]">Modelo</label>
                  <button type="button" onClick={() => { setCustomModel(v => !v); setFormData(p => ({...p, modelo: ''})); }}
                    className="text-xs text-[var(--chrome-dark)] hover:text-[var(--chrome-light)] underline transition-colors">
                    {customModel ? '← Usar lista padrão' : '+ Digitar variação personalizada'}
                  </button>
                </div>
                {customModel ? (
                  <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} required
                    placeholder="Ex: Prius AX, Harrier Turbo..." className={`${inputClass} border-[var(--chrome-dark)] border-dashed`} />
                ) : (
                  <select name="modelo" value={formData.modelo} onChange={handleChange} required disabled={!formData.marca} className={`${selectClass} disabled:opacity-50 disabled:cursor-not-allowed`}>
                    <option value="">Selecione o Modelo...</option>
                    {formData.marca && carModels[formData.origin][formData.marca]?.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className={labelClass}>Preço (¥ JPY)</label>
                <input type="number" name="valor" value={formData.valor} onChange={handleChange} required placeholder="Ex: 1500000" className={inputClass} />
              </div>
            </div>

            {/* ── Ano / KM / Cor ───────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Ano</label>
                <input type="number" name="ano" value={formData.ano} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Quilometragem (km)</label>
                <input type="number" name="km" value={formData.km} onChange={handleChange} required placeholder="Ex: 35000" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Cor</label>
                <input type="text" name="cor" value={formData.cor} onChange={handleChange} required placeholder="Ex: Preto Metálico" className={inputClass} />
              </div>
            </div>

            {/* ── Categoria / Câmbio / Combustível ────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Categoria</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} required className={selectClass}>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatch">Hatchback</option>
                  <option value="minivan">Minivan</option>
                  <option value="kei">Kei Car</option>
                  <option value="esportivo">Esportivo</option>
                  <option value="pickup">Picape</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Câmbio</label>
                <select name="cambio" value={formData.cambio} onChange={handleChange} required className={selectClass}>
                  <option value="automatico">Automático (AT)</option>
                  <option value="cvt">CVT</option>
                  <option value="manual">Manual (MT)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Combustível</label>
                <select name="combustivel" value={formData.combustivel} onChange={handleChange} required className={selectClass}>
                  <option value="hibrido">Híbrido (HEV/PHEV)</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="eletrico">Elétrico (EV)</option>
                  <option value="diesel">Diesel</option>
                  <option value="flex">Flex</option>
                </select>
              </div>
            </div>

            {/* ── Potência & Descrição ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Motor / Potência (Opcional)</label>
                <input type="text" name="potencia" value={formData.potencia} onChange={handleChange} placeholder="Ex: 1.8L VVT-i 140cv" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Garantia</label>
                <input type="text" name="garantia" value={formData.garantia} onChange={handleChange} placeholder="Ex: 6 meses de garantia de motor" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Descrição Geral</label>
              <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows="3" placeholder="Descreva o veículo, estado geral, histórico de manutenção..." className={textareaClass}></textarea>
            </div>

            {/* ── Defeitos / Modificações / Info adicional ─────────────────── */}
            <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-xl p-6 space-y-5">
              <h3 className="font-semibold text-yellow-400 text-sm uppercase tracking-wider">⚠️ Informações Específicas (Visíveis apenas internamente)</h3>
              <div>
                <label className={labelClass}>Defeitos / Avarias conhecidas</label>
                <textarea name="defeitos" value={formData.defeitos} onChange={handleChange} rows="2" placeholder="Ex: Risco leve no pára-choque traseiro, arranhão na porta direita..." className={textareaClass}></textarea>
              </div>
              <div>
                <label className={labelClass}>Modificações / Acessórios aftermarket</label>
                <textarea name="modificacoes" value={formData.modificacoes} onChange={handleChange} rows="2" placeholder="Ex: Rodas de liga leve 17', sistem de som aftermarket..." className={textareaClass}></textarea>
              </div>
              <div>
                <label className={labelClass}>Informações Adicionais</label>
                <textarea name="informacoes_adicionais" value={formData.informacoes_adicionais} onChange={handleChange} rows="2" placeholder="Qualquer observação extra que a equipe deva saber..." className={textareaClass}></textarea>
              </div>
            </div>

            {/* ── Fotos ────────────────────────────────────────────────────── */}
            <div>
              <label className={labelClass}>Fotos do Veículo</label>
              <div className="bg-[var(--bg-card2)] border-2 border-dashed border-[var(--border)] hover:border-[var(--chrome-dark)] rounded-xl p-6 text-center transition-colors cursor-pointer group"
                onClick={() => document.getElementById('img-upload-estoque').click()}>
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm text-[var(--text-muted)] group-hover:text-white transition-colors">Clique para selecionar fotos</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">JPG, PNG, WEBP — Múltiplos arquivos permitidos</p>
                <input id="img-upload-estoque" type="file" multiple accept="image/*" className="hidden" onChange={handleImageFilesChange} />
              </div>
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {imagePreviews.map((src, i) => (
                    <img key={i} src={src} alt={`preview ${i}`} className="w-24 h-24 object-cover rounded-lg border border-[var(--border)]" />
                  ))}
                </div>
              )}
              <p className="text-xs text-[var(--text-muted)] mt-3">Ou cole URLs diretas de imagens (separadas por vírgula):</p>
              <textarea name="imagens" value={formData.imagens} onChange={handleChange} rows="2"
                placeholder="https://imagem1.jpg, https://imagem2.jpg"
                className="mt-2 w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none resize-none text-sm"></textarea>
            </div>

            {/* ── Botões ───────────────────────────────────────────────────── */}
            <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3">
              <button type="button" onClick={() => navigate('/admin')} className="px-6 py-3 rounded-lg font-bold text-[var(--text-muted)] hover:text-white transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="px-8 py-3 rounded-lg font-bold bg-gradient-to-r from-[var(--chrome-light)] to-[var(--chrome)] text-black hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.2)]">
                {loading ? 'Salvando...' : 'Adicionar ao Estoque'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
