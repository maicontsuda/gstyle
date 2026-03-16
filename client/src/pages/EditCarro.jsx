import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

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
    'Lexus':      ['NX', 'RX', 'UX', 'LX', 'LC', 'IS', 'ES'],
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
    'Tesla':         ['Model 3', 'Model Y', 'Model S', 'Model X'],
    'Aston Martin':  ['Vantage', 'DB11', 'DBX', 'DBS', 'DB12'],
  },
};

const ANOS = Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i);
const TIPOS = ['sedan','suv','hatch','minivan','kei','esportivo','pickup','van'];
const TIPO_LABELS = { sedan:'Sedan', suv:'SUV', hatch:'Hatchback', minivan:'Minivan', kei:'Kei Car', esportivo:'Esportivo', pickup:'Picape', van:'Van' };
const CORES_COMUNS = ['Branco Pérola','Preto Metálico','Prata','Cinza','Azul','Vermelho','Verde','Bege','Dourado','Laranja','Rosa','Roxo'];

function getOriginForBrand(marca) {
  for (const [origin, brands] of Object.entries(carModels)) {
    if (Object.keys(brands).includes(marca)) return origin;
  }
  return 'Japonesa';
}

// Helper to resize image client-side before upload to avoid Vercel 4.5MB limit
const resizeImage = (file, maxWidth = 1200) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', 0.8); // 80% quality JPEG
      };
    };
  });
};

export default function EditCarro() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [customModel, setCustomModel] = useState(false);
  const [customColor, setCustomColor] = useState(false);
  // Existing images already saved in DB (kept separate — never filtered)
  const [existingImages, setExistingImages] = useState([]);
  // New files the user selects via file picker
  const [imageFiles, setImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  // Manual URL text field (additional URLs typed by user)
  const [urlText, setUrlText] = useState('');
  const [form, setForm] = useState(null);

  const isAuthorized = user && ['admin', 'dono', 'gerente', 'funcionario'].includes(user.tipo_usuario);

  useEffect(() => {
    api.get(`/carros/${id}`)
      .then(r => {
        const c = r.data;
        const origin = getOriginForBrand(c.marca);
        const isCustomModel = c.modelo && !carModels[origin]?.[c.marca]?.includes(c.modelo);
        const isCustomColor = c.cor && !CORES_COMUNS.includes(c.cor);
        setCustomModel(isCustomModel);
        setCustomColor(isCustomColor);
        setForm({
          origin,
          marca: c.marca || '',
          modelo: c.modelo || '',
          status: c.status || 'semi_novo',
          tipo: c.tipo || 'sedan',
          ano: c.ano || new Date().getFullYear(),
          mesModelo: c.mesModelo || '',
          diaModelo: c.diaModelo || '',
          km: c.km ?? '',
          shakenVencimento: c.shakenVencimento || '',
          cor: c.cor || '',
          combustivel: c.combustivel || 'hibrido',
          cambio: c.cambio || 'automatico',
          potencia: c.potencia || '',
          valor: c.valor ?? '',
          descricao: c.descricao || '',
          garantia: c.garantia || '',
          observacoes: c.observacoes || '',
          defeitos: c.defeitos || '',
          informacoes_adicionais: c.informacoes_adicionais || '',
          
          comprimento: c.comprimento || '',
          largura: c.largura || '',
          altura: c.altura || '',
          peso: c.peso || '',
          wltcConsumo: c.wltcConsumo || '',
          jc08Consumo: c.jc08Consumo || '',
          chassiCodigo: c.chassiCodigo || '',
          avaliacaoExterna: c.avaliacaoExterna || '',
          avaliacaoInterna: c.avaliacaoInterna || '',
          estadoMecanico: c.estadoMecanico || 'Normal',
          equipamentos: c.equipamentos || [],
          isVendido: c.isVendido || false,
          vinculoPublico: c.vinculoPublico || false,
          comprador: c.comprador?._id || c.comprador || '',
          linkVideo: c.linkVideo || '',
          linkInstagram: c.linkInstagram || '',
        });
        // Load existing images into their own state — don't put them in the form/textarea
        setExistingImages(Array.isArray(c.imagens) ? c.imagens : []);
      })
      .catch(() => setError('Erro ao carregar veículo.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (!isAuthorized) return (
    <div className="pt-32 container text-center min-h-screen">
      <h1 className="text-3xl text-red-500 mb-4">Acesso Negado</h1>
    </div>
  );

  if (loading) return <div className="spinner" style={{ marginTop: 160 }} />;
  if (!form) return null;

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const handleChange = e => set(e.target.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value);
  const handleOriginChange = e => setForm(prev => ({ ...prev, origin: e.target.value, marca: '', modelo: '' }));
  const handleBrandChange = e => setForm(prev => ({ ...prev, marca: e.target.value, modelo: '' }));

  const handleImageFilesChange = e => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      setNewImagePreviews(prev => [...prev, url]);
    });
  };

  const removeExisting = (idx) => setExistingImages(prev => prev.filter((_, i) => i !== idx));
  const removeNew = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };
  
  const equipamentosList = [
    'Ar Condicionado', 'Direção Hidráulica', 'Vidros Elétricos', 'Travas Elétricas',
    'Teto Solar', 'Tela de Teto', 'Bancos de Couro', 'Bancos Elétricos', 'Aquecimento de Bancos',
    'Navegação GPS', 'Navi Original', 'Apple CarPlay', 'Android Auto', 'Bluetooth',
    'Câmera de Ré', 'Camera Record (Dashcam)', 'Sensores de Estacionamento', 'Câmera 360',
    'Airbag', 'Freios ABS', 'Controle de Estabilidade', 'Alerta de Ponto Cego',
    'Assistente de Faixa', 'Piloto Automático', 'Frenagem de Emergência',
    'Faróis de LED', 'Faróis de Neblina',
    'Rodas de Liga Leve', 'Comando de Som no Volante', 'Chave Presencial', 'Sistema Start-Stop', 'ETC'
  ];

  const aquecimentoOpcoes = ['Motorista', 'Passageiro da Frente', 'Banco Traseiro Direito', 'Banco Traseiro Esquerdo'];
  const handleAquecimentoToggle = (opcao) => {
    const tag = `Aquecimento de Bancos - ${opcao}`;
    setForm(prev => {
      const eq = prev.equipamentos || [];
      if (eq.includes(tag)) return { ...prev, equipamentos: eq.filter(e => e !== tag) };
      return { ...prev, equipamentos: [...eq, tag] };
    });
  };

  const handleEquipamentoToggle = (item) => {
    setForm(prev => {
      const current = prev.equipamentos || [];
      if (current.includes(item)) {
         return { ...prev, equipamentos: current.filter(e => e !== item) };
      } else {
         return { ...prev, equipamentos: [...current, item] };
      }
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Strip front-end only field 'origin' from the payload
      // eslint-disable-next-line no-unused-vars
      const { origin, ...rest } = form;

      // Start with existing images as-is (they may be base64 or CDN URLs — preserve all)
      let imagens = [...existingImages];

      // Upload any new files (resizing them first, EXCEPT videos)
      if (imageFiles.length > 0) {
        const uploadData = new FormData();
        
        // Resize images in parallel, pass videos as-is
        const processedFiles = await Promise.all(
          imageFiles.map(f => {
            if (f.type.startsWith('image/')) return resizeImage(f);
            return f;
          })
        );
        processedFiles.forEach(f => uploadData.append('images', f));

        const uploadRes = await api.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imagens = [...imagens, ...(uploadRes.data.urls || [])];
      }

      // Add any manually typed http URLs
      if (urlText.trim()) {
        const manualUrls = urlText.split(',').map(u => u.trim()).filter(u => u.startsWith('http'));
        imagens = [...imagens, ...manualUrls];
      }

      const payload = {
        ...rest,
        imagens,
        km: rest.km === '' || rest.km === undefined || rest.km === null ? null : Number(rest.km),
        comprador: rest.comprador || null,
      };

      await api.put(`/carros/${id}`, payload);
      setSuccess('✅ Veículo atualizado com sucesso!');
      setImageFiles([]);
      setNewImagePreviews([]);
      setUrlText('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Erro ao atualizar veículo.';
      setError(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const isSemiNovo = form.status === 'semi_novo';

  const sel = 'w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none cursor-pointer';
  const inp = 'w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none';
  const lbl = 'block text-sm font-semibold text-[var(--chrome-light)] mb-2';
  const txa = 'w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none resize-none';

  return (
    <div className="page-enter bg-[var(--bg-deep)] min-h-screen pt-32 pb-16">
      <div className="container max-w-3xl">
        <div className="card p-8 backdrop-blur-xl border-[var(--border)] shadow-2xl">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <span className="badge badge-gold mb-3">Admin Panel</span>
              <h1 className="text-3xl font-playfair font-bold text-[var(--chrome-light)]">
                Editar Veículo
              </h1>
              <p className="text-[var(--text-muted)] mt-2">
                {form.marca} {form.modelo} • {form.ano}
              </p>
            </div>
            <button onClick={() => navigate('/admin/carros')}
              className="text-[var(--text-muted)] hover:text-white transition-colors text-sm mt-2">
              ← Voltar ao Controle
            </button>
          </div>

          {error   && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">{error}</div>}
          {success && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg mb-6">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Status ──────────────────────────────────────────── */}
            <div>
              <label className={lbl}>Status do Veículo</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'semi_novo', icon: '🚘', label: 'Semi-novo', desc: 'Usado / Pré-owned' },
                  { val: 'zero_km',  icon: '🆕', label: 'Zero KM',   desc: 'Direto da fábrica' },
                ].map(opt => (
                  <button key={opt.val} type="button" onClick={() => set('status', opt.val)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${form.status === opt.val
                      ? 'border-[var(--chrome)] bg-[var(--chrome)]/10'
                      : 'border-[var(--border)] hover:border-[var(--chrome-dark)]'}`}>
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    <div className="font-bold text-white text-sm">{opt.label}</div>
                    <div className="text-xs text-[var(--text-muted)]">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Origem & Marca ──────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={lbl}>Origem</label>
                <select name="origin" value={form.origin} onChange={handleOriginChange} className={sel}>
                  <option value="Japonesa">Doméstica (Japonesa)</option>
                  <option value="Importada">Importada</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Marca</label>
                <select name="marca" value={form.marca} onChange={handleBrandChange} required className={sel}>
                  <option value="">Selecione a Marca...</option>
                  {Object.keys(carModels[form.origin]).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Modelo & Preço ──────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-[var(--chrome-light)]">Modelo</label>
                  <button type="button" onClick={() => { setCustomModel(v => !v); set('modelo', ''); }}
                    className="text-xs text-[var(--chrome-dark)] hover:text-[var(--chrome-light)] underline">
                    {customModel ? '← Usar lista' : '+ Variação personalizada'}
                  </button>
                </div>
                {customModel ? (
                  <input type="text" name="modelo" value={form.modelo} onChange={handleChange} required
                    placeholder="Ex: Prius AX..." className={`${inp} border-dashed border-[var(--chrome-dark)]`} />
                ) : (
                  <select name="modelo" value={form.modelo} onChange={handleChange} required disabled={!form.marca} className={`${sel} disabled:opacity-50`}>
                    <option value="">Selecione o Modelo...</option>
                    {form.marca && carModels[form.origin][form.marca]?.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className={lbl}>Preço (¥ JPY)</label>
                <input type="number" name="valor" value={form.valor} onChange={handleChange} required
                  placeholder="Ex: 1500000" className={inp} />
              </div>
            </div>

            {/* ── Tipo / Categoria ──────────────────────────────── */}
            <div>
              <label className={lbl}>Categoria / Tipo de Carroceria</label>
              <div className="grid grid-cols-4 gap-2">
                {TIPOS.map(t => (
                  <button key={t} type="button" onClick={() => set('tipo', t)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${form.tipo === t
                      ? 'border-[var(--chrome)] bg-[var(--chrome)]/15 text-white'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--chrome-dark)]'}`}>
                    {TIPO_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Ano + Mês + Dia ────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Ano</label>
                <select name="ano" value={form.ano} onChange={handleChange} required className={sel}>
                  {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Mês</label>
                <select name="mesModelo" value={form.mesModelo} onChange={handleChange} className={sel}>
                  <option value="">-- Mês --</option>
                  {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => (
                    <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Dia</label>
                <select name="diaModelo" value={form.diaModelo} onChange={handleChange} className={sel}>
                  <option value="">-- Dia --</option>
                  {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Semi-novo: KM e Shaken ──────────────────────────── */}
            {isSemiNovo && (
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-[var(--chrome-dark)]/30 bg-[var(--bg-card2)]/50">
                <div>
                  <label className={lbl}>Quilometragem (km)</label>
                  <input type="number" name="km" value={form.km} onChange={handleChange} required={isSemiNovo}
                    placeholder="Ex: 35000" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Shaken (車検) — Vencimento</label>
                  <input type="month" name="shakenVencimento" value={form.shakenVencimento} onChange={handleChange} className={inp} />
                  <p className="text-xs text-[var(--text-muted)] mt-1">Deixe vazio se não tiver shaken vigente.</p>
                </div>
              </div>
            )}

            {/* ── Cor ─────────────────────────────────────────────── */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-[var(--chrome-light)]">Cor</label>
                <button type="button" onClick={() => { setCustomColor(v => !v); set('cor', ''); }}
                  className="text-xs text-[var(--chrome-dark)] hover:text-[var(--chrome-light)] underline">
                  {customColor ? '← Cores comuns' : '+ Cor personalizada'}
                </button>
              </div>
              {customColor ? (
                <input type="text" name="cor" value={form.cor} onChange={handleChange} required placeholder="Ex: Azul Safira Metálico" className={inp} />
              ) : (
                <select name="cor" value={form.cor} onChange={handleChange} required className={sel}>
                  <option value="">Selecione a Cor...</option>
                  {CORES_COMUNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>

            {/* ── Câmbio / Combustível / Potência ────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Câmbio</label>
                <select name="cambio" value={form.cambio} onChange={handleChange} required className={sel}>
                  <option value="automatico">Automático (AT)</option>
                  <option value="cvt">CVT</option>
                  <option value="manual">Manual (MT)</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Combustível</label>
                <select name="combustivel" value={form.combustivel} onChange={handleChange} required className={sel}>
                  <option value="hibrido">Híbrido (HEV/PHEV)</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="eletrico">Elétrico (EV)</option>
                  <option value="diesel">Diesel</option>
                  <option value="flex">Flex</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Motor / Potência</label>
                <input type="text" name="potencia" value={form.potencia} onChange={handleChange} placeholder="Ex: 1.8L 140cv" className={inp} />
              </div>
            </div>

            {/* ── Garantia ────────────────────────────────────────── */}
            <div>
              <label className={lbl}>Garantia</label>
              <input type="text" name="garantia" value={form.garantia} onChange={handleChange}
                placeholder="Ex: 6 meses de garantia de motor" className={inp} />
            </div>

            {/* ── Descrição Geral ─────────────────────────────────── */}
            <div>
              <label className={lbl}>Descrição Geral</label>
              <textarea name="descricao" value={form.descricao} onChange={handleChange} rows="3"
                placeholder="Estado geral, histórico de manutenção..." className={txa} />
            </div>

            {/* ── Equipamentos / Opcionais ─────────────────────── */}
            <div className="border border-[var(--chrome-dark)]/30 bg-[var(--bg-card2)]/40 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-[var(--chrome-light)] text-sm uppercase tracking-wider">⚙️ Equipamentos / Opcionais</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', marginTop: '8px' }}>
                {equipamentosList.map(eq => (
                  <div key={eq}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      cursor: 'pointer', padding: '8px 10px', borderRadius: '8px',
                      background: form.equipamentos?.includes(eq) ? 'rgba(200,205,212,0.1)' : 'rgba(255,255,255,0.03)',
                      border: form.equipamentos?.includes(eq) ? '1px solid rgba(200,205,212,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s',
                    }}>
                      <input
                        type="checkbox"
                        checked={form.equipamentos?.includes(eq) || false}
                        onChange={() => handleEquipamentoToggle(eq)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--chrome)', cursor: 'pointer', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: '0.82rem', color: form.equipamentos?.includes(eq) ? 'var(--chrome-light)' : 'var(--text-muted)', userSelect: 'none', lineHeight: 1.3 }}>
                        {eq}
                      </span>
                    </label>

                    {eq === 'Aquecimento de Bancos' && form.equipamentos?.includes('Aquecimento de Bancos') && (
                      <div style={{ marginTop: '6px', marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Qual banco tem aquecimento?</p>
                        {aquecimentoOpcoes.map(opcao => {
                          const tag = `Aquecimento de Bancos - ${opcao}`;
                          const checked = form.equipamentos?.includes(tag) || false;
                          return (
                            <label key={opcao} style={{
                              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                              padding: '5px 8px', borderRadius: '6px',
                              background: checked ? 'rgba(200,205,212,0.08)' : 'rgba(255,255,255,0.02)',
                              border: checked ? '1px solid rgba(200,205,212,0.3)' : '1px solid rgba(255,255,255,0.04)',
                            }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleAquecimentoToggle(opcao)}
                                style={{ width: '13px', height: '13px', accentColor: 'var(--chrome)', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '0.78rem', color: checked ? 'var(--chrome-light)' : 'var(--text-muted)' }}>{opcao}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {form.equipamentos && form.equipamentos.filter(eq => !equipamentosList.includes(eq) && !aquecimentoOpcoes.map(o => `Aquecimento de Bancos - ${o}`).includes(eq)).length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(138,144,153,0.2)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--chrome-dark)', display: 'block', marginBottom: '8px' }}>Outros opcionais cadastrados:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {form.equipamentos.filter(eq => !equipamentosList.includes(eq) && !aquecimentoOpcoes.map(o => `Aquecimento de Bancos - ${o}`).includes(eq)).map(eq => (
                      <span key={eq} style={{ background: 'var(--bg-card2)', border: '1px solid var(--chrome-dark)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {eq}
                        <button type="button" onClick={() => handleEquipamentoToggle(eq)} style={{ color: '#f87171', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Dimensões e Consumo (Novo Goo-net) ──────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[var(--bg-card2)]/30 p-4 rounded-xl border border-[var(--border)] mt-4">
              <div>
                <label className={lbl}>Comprimento (mm)</label>
                <input type="number" name="comprimento" value={form.comprimento} onChange={handleChange} placeholder="Ex: 4895" className={inp} />
              </div>
              <div>
                <label className={lbl}>Largura (mm)</label>
                <input type="number" name="largura" value={form.largura} onChange={handleChange} placeholder="Ex: 1800" className={inp} />
              </div>
              <div>
                <label className={lbl}>Altura (mm)</label>
                <input type="number" name="altura" value={form.altura} onChange={handleChange} placeholder="Ex: 1450" className={inp} />
              </div>
              <div>
                <label className={lbl}>Peso (kg)</label>
                <input type="number" name="peso" value={form.peso} onChange={handleChange} placeholder="Ex: 1650" className={inp} />
              </div>
              
              <div>
                <label className={lbl}>Consumo WLTC</label>
                <input type="text" name="wltcConsumo" value={form.wltcConsumo} onChange={handleChange} placeholder="Ex: 15.0km/L" className={inp} />
              </div>
              <div>
                <label className={lbl}>Consumo JC08</label>
                <input type="text" name="jc08Consumo" value={form.jc08Consumo} onChange={handleChange} placeholder="Ex: 19.2km/L" className={inp} />
              </div>
              <div>
                <label className={lbl}>Código Chassi</label>
                <input type="text" name="chassiCodigo" value={form.chassiCodigo} onChange={handleChange} placeholder="Ex: DAA-AWS210" className={inp} />
              </div>
            </div>

            {/* ── Avaliação Goo-net / Condição ────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 mt-4">
              <div>
                <label className={lbl}>Avaliação Externa (1 a 5)</label>
                <select name="avaliacaoExterna" value={form.avaliacaoExterna} onChange={handleChange} className={sel}>
                  <option value="">Sem avaliação</option>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Estrelas</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Avaliação Interna (1 a 5)</label>
                <select name="avaliacaoInterna" value={form.avaliacaoInterna} onChange={handleChange} className={sel}>
                  <option value="">Sem avaliação</option>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Estrelas</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Estado Mecânico</label>
                <select name="estadoMecanico" value={form.estadoMecanico} onChange={handleChange} className={sel}>
                  <option value="Normal">Normal (正常)</option>
                  <option value="Requer Atenção">Requer Atenção</option>
                </select>
              </div>
            </div>

            {/* ── Observações ─────────────────────────────────────── */}
            <div className="border border-[var(--chrome-dark)]/30 bg-[var(--bg-card2)]/40 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-[var(--chrome-light)] text-sm uppercase tracking-wider">📋 Observações do Veículo</h3>
              <p className="text-xs text-[var(--text-muted)]">Detalhes visíveis para o cliente.</p>
              <textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows="4"
                placeholder="Ex: Rodas aro 18, teto solar, turbo, conversível, bancos em couro, sem histórico de sinistro..." className={txa} />
            </div>

            {/* ── Informações Internas ────────────────────────────── */}
            <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-yellow-400 text-sm uppercase tracking-wider">⚠️ Informações Internas</h3>
              <div>
                <label className={lbl}>Defeitos / Avarias conhecidas</label>
                <textarea name="defeitos" value={form.defeitos} onChange={handleChange} rows="2"
                  placeholder="Ex: Risco leve no pára-choque..." className={txa} />
              </div>
              <div>
                <label className={lbl}>Observações Internas</label>
                <textarea name="informacoes_adicionais" value={form.informacoes_adicionais} onChange={handleChange} rows="2"
                  placeholder="Observações para a equipe..." className={txa} />
              </div>
            </div>

            {/* ── Status de Venda ─────────────────────────────────── */}
            <div className="border border-green-500/20 bg-green-500/5 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-green-400 text-sm uppercase tracking-wider">💰 Status de Venda</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="isVendido" checked={form.isVendido} onChange={handleChange}
                  className="w-5 h-5 accent-green-500" />
                <span className="text-white font-medium">Veículo Vendido</span>
              </label>
              {form.isVendido && (
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <input type="checkbox" name="vinculoPublico" checked={form.vinculoPublico} onChange={handleChange}
                    className="w-5 h-5 accent-blue-500" />
                  <span className="text-blue-100 font-medium text-sm">Tornar Vínculo Público</span>
                </label>
              )}
            </div>

            {/* ── Redes Sociais & Mídia (Links) ────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--bg-card2)]/30 p-4 rounded-xl border border-[var(--border)]">
              <div>
                <label className={lbl}>Link do Vídeo (YouTube, Facebook...)</label>
                <input type="url" name="linkVideo" value={form.linkVideo} onChange={handleChange}
                  placeholder="Ex: https://youtube.com/watch?v=..." className={inp} />
              </div>
              <div>
                <label className={lbl}>Link do Instagram (Post/Reels)</label>
                <input type="url" name="linkInstagram" value={form.linkInstagram} onChange={handleChange}
                  placeholder="Ex: https://instagram.com/p/..." className={inp} />
              </div>
            </div>

            {/* ── Mídia (Fotos e Vídeos) ──────────────────────────── */}
            <div>
              <label className={lbl}>Mídia do Veículo (Fotos e Vídeos)</label>

              {/* Existing photos (from DB) */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-2">📂 Mídia já salva (passe o mouse para reordenar/remover):</p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {existingImages.map((src, i) => {
                      const isVideo = typeof src === 'string' && src.toLowerCase().match(/\.(mp4|webm|mov)(\?|$)/);
                      return (
                      <div key={i} className="relative group">
                        {isVideo ? (
                          <video src={src} className="w-24 h-24 object-cover rounded-lg border border-[var(--chrome)]" muted />
                        ) : (
                          <img
                            src={src}
                            alt={`foto ${i}`}
                            className="w-24 h-24 object-cover rounded-lg border border-[var(--border)]"
                            onError={e => { e.currentTarget.style.display='none'; }}
                          />
                        )}
                        <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button type="button" onClick={(e) => { e.stopPropagation(); if (i > 0) { const m = [...existingImages]; [m[i-1], m[i]] = [m[i], m[i-1]]; setExistingImages(m); } }}
                             className="bg-black/80 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center hover:bg-black disabled:opacity-30" disabled={i === 0}>◀</button>
                           <button type="button" onClick={(e) => { e.stopPropagation(); if (i < existingImages.length - 1) { const m = [...existingImages]; [m[i+1], m[i]] = [m[i], m[i+1]]; setExistingImages(m); } }}
                             className="bg-black/80 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center hover:bg-black disabled:opacity-30" disabled={i === existingImages.length - 1}>▶</button>
                        </div>
                        <button type="button" onClick={() => removeExisting(i)}
                          className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          ×
                        </button>
                      </div>
                    )})}
                  </div>
                </div>
              )}

              {/* New photos picked from file system */}
              {newImagePreviews.length > 0 && (
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-2">🆕 Nova mídia a enviar (passe o mouse para reordenar/remover):</p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {newImagePreviews.map((src, i) => {
                      const isVideo = imageFiles[i] && imageFiles[i].type.startsWith('video/');
                      return (
                      <div key={i} className="relative group">
                        {isVideo ? (
                           <video src={src} className="w-24 h-24 object-cover rounded-lg border border-[var(--chrome)]" muted autoPlay loop />
                        ) : (
                           <img src={src} alt={`nova ${i}`} className="w-24 h-24 object-cover rounded-lg border border-[var(--chrome-dark)]/50" />
                        )}
                        <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button type="button" onClick={(e) => { e.stopPropagation(); if (i > 0) { const f = [...imageFiles]; const p = [...newImagePreviews]; [f[i-1], f[i]] = [f[i], f[i-1]]; [p[i-1], p[i]] = [p[i], p[i-1]]; setImageFiles(f); setNewImagePreviews(p); } }}
                             className="bg-black/80 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center hover:bg-black disabled:opacity-30" disabled={i === 0}>◀</button>
                           <button type="button" onClick={(e) => { e.stopPropagation(); if (i < imageFiles.length - 1) { const f = [...imageFiles]; const p = [...newImagePreviews]; [f[i+1], f[i]] = [f[i], f[i+1]]; [p[i+1], p[i]] = [p[i], p[i+1]]; setImageFiles(f); setNewImagePreviews(p); } }}
                             className="bg-black/80 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center hover:bg-black disabled:opacity-30" disabled={i === imageFiles.length - 1}>▶</button>
                        </div>
                        <button type="button" onClick={() => removeNew(i)}
                          className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          ×
                        </button>
                      </div>
                    )})}
                  </div>
                </div>
              )}

              <div className="bg-[var(--bg-card2)] border-2 border-dashed border-[var(--border)] hover:border-[var(--chrome-dark)] rounded-xl p-6 text-center transition-colors cursor-pointer group"
                onClick={() => document.getElementById('img-edit-upload').click()}>
                <div className="text-2xl mb-1">📷/🎥</div>
                <p className="text-sm text-[var(--text-muted)] group-hover:text-white">Adicionar mais fotos ou vídeos</p>
                <input id="img-edit-upload" type="file" multiple accept="image/*,video/mp4,video/mov,video/webm" style={{ display: 'none' }} onChange={handleImageFilesChange} />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-5">Ou cole URLs diretas (separadas por vírgula):</p>
              <textarea value={urlText} onChange={e => setUrlText(e.target.value)} rows="2"
                placeholder="https://imagem1.jpg, https://video1.mp4"
                className="mt-2 w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none resize-none text-sm" />
            </div>

            {/* ── Botões ─────────────────────────────────────────── */}
            <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3">
              <button type="button" onClick={() => navigate('/admin/carros')}
                className="px-6 py-3 rounded-lg font-bold text-[var(--text-muted)] hover:text-white transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="px-8 py-3 rounded-lg font-bold bg-gradient-to-r from-[var(--chrome-light)] to-[var(--chrome)] text-black hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.2)]">
                {saving ? 'Salvando...' : '💾 Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
