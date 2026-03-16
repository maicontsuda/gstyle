import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// ── Marcas/Modelos ─────────────────────────────────────────────────────────
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
const MESES = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const TIPOS = ['sedan','suv','hatch','minivan','kei','esportivo','pickup','van'];
const TIPO_LABELS = { sedan:'Sedan', suv:'SUV', hatch:'Hatchback', minivan:'Minivan', kei:'Kei Car', esportivo:'Esportivo', pickup:'Picape', van:'Van' };
const CORES_COMUNS = ['Branco Pérola','Preto Metálico','Prata','Cinza','Azul','Vermelho','Verde','Bege','Dourado','Laranja','Rosa','Roxo'];

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
        }, 'image/jpeg', 0.8);
      };
    };
  });
};

export default function AddEstoque() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [customModel, setCustomModel] = useState(false);
  const [customColor, setCustomColor] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Scraper states (AI Image OCR)
  const [aiImage, setAiImage] = useState(null);      // File object
  const [aiPreview, setAiPreview] = useState(null);  // object URL for preview
  const [importing, setImporting] = useState(false);

  const [formData, setFormData] = useState({
    origin: 'Japonesa',
    marca: '',
    modelo: '',
    status: 'semi_novo',
    tipo: 'sedan',
    // ── Ano / Data de fabricação
    ano: new Date().getFullYear(),
    mesModelo: '',
    diaModelo: '',
    // ── Semi-novo specific
    km: '',
    shakenVencimento: '',    // YYYY-MM
    // ── Specs
    cor: '',
    combustivel: 'hibrido',
    cambio: 'automatico',
    potencia: '',
    cilindradas: '',
    portas: 5,
    lotacao: 5,
    tracao: '',
    valor: '',
    // ── Texts
    descricao: '',
    garantia: '',
    // ── Observações detalhadas (visible to client)
    observacoes: '',
    // ── Internal only
    defeitos: '',
    informacoes_adicionais: '',
    historicoReparo: false,
    donoUnico: false,
    
    // Novas categorias Goo-net
    comprimento: '',
    largura: '',
    altura: '',
    peso: '',
    wltcConsumo: '',
    jc08Consumo: '',
    chassiCodigo: '',
    avaliacaoExterna: '',
    avaliacaoInterna: '',
    estadoMecanico: 'Normal',

    imagens: '',
    // ── Redes Sociais
    linkVideo: '',
    linkInstagram: '',
    equipamentos: [],
  });

  const isSemiNovo = formData.status === 'semi_novo';

  const isAuthorized = user && ['admin', 'dono', 'gerente', 'funcionario'].includes(user.tipo_usuario);
  if (!isAuthorized) {
    return (
      <div className="pt-32 container text-center min-h-screen">
        <h1 className="text-3xl text-red-500 mb-4">Acesso Negado</h1>
        <p className="text-[var(--text-muted)]">Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  const set = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
  const handleChange = e => set(e.target.name, e.target.value);

  const handleStatusChange = e => {
    const val = e.target.value;
    if (val === 'zero_km') {
      navigate('/admin/add-zerokm');
      return;
    }
    set('status', val);
  };

  const handleOriginChange = e => setFormData(prev => ({ ...prev, origin: e.target.value, marca: '', modelo: '' }));
  const handleBrandChange = e => setFormData(prev => ({ ...prev, marca: e.target.value, modelo: '' }));

  const handleImageFilesChange = e => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const equipamentosList = [
    'Ar Condicionado', 'Direção Hidráulica', 'Vidros Elétricos', 'Travas Elétricas',
    'Teto Solar', 'Bancos de Couro', 'Bancos Elétricos', 'Aquecimento de Bancos',
    'Navegação GPS', 'Apple CarPlay / Android Auto', 'Bluetooth', 'Câmera de Ré',
    'Sensores de Estacionamento', 'Câmera 360', 'Airbag', 'Freios ABS',
    'Controle de Estabilidade', 'Alerta de Ponto Cego', 'Assistente de Faixa',
    'Piloto Automático', 'Frenagem de Emergência', 'Faróis de LED', 'Faróis de Neblina',
    'Rodas de Liga Leve', 'Comando de Som no Volante', 'Chave Presencial', 'Sistema Start-Stop', 'ETC'
  ];

  const handleEquipamentoToggle = (item) => {
    setFormData(prev => {
      const current = prev.equipamentos || [];
      if (current.includes(item)) {
         return { ...prev, equipamentos: current.filter(e => e !== item) };
      } else {
         return { ...prev, equipamentos: [...current, item] };
      }
    });
  };

  const handleAIImport = async () => {
    if (!aiImage) return;
    setImporting(true);
    setError('');
    setSuccess('');
    try {
      // Compress/resize via canvas before base64 encoding (to stay under Vercel 4.5MB body limit)
      const compressedBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(aiImage);
        reader.onerror = reject;
        reader.onload = e => {
          const img = new Image();
          img.src = e.target.result;
          img.onerror = reject;
          img.onload = () => {
            const MAX_DIM = 1200;
            let w = img.width, h = img.height;
            if (w > h) {
              if (w > MAX_DIM) { h = Math.round(h * MAX_DIM / w); w = MAX_DIM; }
            } else {
              if (h > MAX_DIM) { w = Math.round(w * MAX_DIM / h); h = MAX_DIM; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
          };
        };
      });

      const res = await api.post('/ai-scraper/image', {
        imageBase64: compressedBase64,
        mimeType: 'image/jpeg',
      });
      const data = res.data;
      const importedEquips = data.equipamentos || [];

      setFormData(prev => ({
        ...prev,
        marca:           data.marca           || prev.marca,
        modelo:          data.modelo          || prev.modelo,
        ano:             data.ano             ? parseInt(data.ano) : prev.ano,
        valor:           data.valor           || prev.valor,
        km:              data.kilometragem    != null ? data.kilometragem : prev.km,
        cor:             data.cor             || prev.cor,
        combustivel:     data.combustivel     ? mapCombustivel(data.combustivel) : prev.combustivel,
        cambio:          data.cambio          ? mapCambio(data.cambio) : prev.cambio,
        cilindradas:     data.cilindradas     || prev.cilindradas,
        potencia:        data.potencia        || prev.potencia,
        portas:          data.portas          || prev.portas,
        lotacao:         data.lotacao         || prev.lotacao,
        tracao:          data.tracao          || prev.tracao,
        shakenVencimento: data.shakenVencimento || prev.shakenVencimento,
        historicoReparo: data.historicoReparo != null ? Boolean(data.historicoReparo) : prev.historicoReparo,
        donoUnico:       data.donoUnico       != null ? Boolean(data.donoUnico) : prev.donoUnico,
        
        comprimento:     data.comprimento     || prev.comprimento,
        largura:         data.largura         || prev.largura,
        altura:          data.altura          || prev.altura,
        peso:            data.peso            || prev.peso,
        wltcConsumo:     data.wltcConsumo     || prev.wltcConsumo,
        jc08Consumo:     data.jc08Consumo     || prev.jc08Consumo,
        chassiCodigo:    data.chassiCodigo    || prev.chassiCodigo,
        avaliacaoExterna:data.avaliacaoExterna|| prev.avaliacaoExterna,
        avaliacaoInterna:data.avaliacaoInterna|| prev.avaliacaoInterna,
        estadoMecanico:  data.estadoMecanico  || prev.estadoMecanico,

        observacoes:     data.observacoes     || prev.observacoes,
        equipamentos:    importedEquips.length > 0 ? importedEquips : prev.equipamentos,
      }));
      setCustomModel(true);
      setCustomColor(true);
      setSuccess('✅ IA leu o print com sucesso! Revise os campos antes de salvar.');
      setAiImage(null);
      setAiPreview(null);
    } catch (err) {
      let errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Erro ao processar imagem com IA.';
      if (typeof errMsg === 'object') errMsg = JSON.stringify(errMsg);
      setError(`❌ ${errMsg}`);
    } finally {
      setImporting(false);
    }
  };

  // Helpers para mapear strings traduzidas
  const mapCombustivel = (str) => {
    if (!str) return 'hibrido';
    const s = str.toLowerCase();
    if (s.includes('híbrido') || s.includes('hibrido') || s.includes('hybrid')) return 'hibrido';
    if (s.includes('elétrico') || s.includes('eletrico') || s.includes('electric')) return 'eletrico';
    if (s.includes('diesel')) return 'diesel';
    if (s.includes('gasolina') || s.includes('gasoline')) return 'gasolina';
    if (s.includes('flex')) return 'flex';
    return 'gasolina';
  };
  const mapCambio = (str) => {
    if (!str) return 'automatico';
    const s = str.toLowerCase();
    if (s.includes('cvt')) return 'cvt';
    if (s.includes('manual') || s.includes('mt')) return 'manual';
    return 'automatico';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...formData };
      if (imageFiles.length > 0) {
        const uploadData = new FormData();
        const processedFiles = await Promise.all(
          imageFiles.map(f => {
            if (f.type.startsWith('image/')) return resizeImage(f);
            return f; // If it's a video, don't resize
          })
        );
        processedFiles.forEach(f => uploadData.append('images', f));
        
        const uploadRes = await api.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
        const uploadedUrls = uploadRes.data.urls || [];
        const manualUrls = payload.imagens ? payload.imagens.split(',').map(i => i.trim()).filter(i => i) : [];
        payload.imagens = [...manualUrls, ...uploadedUrls];
      } else {
        payload.imagens = payload.imagens ? payload.imagens.split(',').map(i => i.trim()).filter(i => i) : [];
      }
      await api.post('/carros', payload);
      setSuccess('Veículo adicionado ao Estoque com sucesso!');
      setFormData(p => ({ ...p, marca: '', modelo: '', km: '', cor: '', valor: '', potencia: '', descricao: '', garantia: '', observacoes: '', defeitos: '', informacoes_adicionais: '', imagens: '' }));
      setImageFiles([]);
      setImagePreviews([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Erro ao adicionar veículo.';
      setError(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const sel = 'w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none cursor-pointer';
  const inp = 'w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none';
  const lbl = 'block text-sm font-semibold text-[var(--chrome-light)] mb-2';
  const txa = 'w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none resize-none';

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

          {/* ── Aviso de redirecionamento ── */}
          <div className="bg-[var(--bg-card2)] border border-[var(--chrome-dark)]/30 rounded-xl p-4 mb-6 text-sm text-[var(--text-muted)]">
            💡 <strong className="text-[var(--chrome-light)]">Dica:</strong> Se o carro for <strong>Zero KM</strong>, selecione essa opção no campo Status abaixo — você será redirecionado automaticamente para o formulário correto.
          </div>

          {/* ── Importador IA – Print Screen ── */}
          <div className="mb-6 bg-[var(--bg-card2)] border border-[var(--primary)]/30 p-5 rounded-xl">
            <h3 className="text-[var(--primary)] font-bold mb-1 flex items-center gap-2">
              ✨ Importar por Print Screen (IA)
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Cole um print da página do Goo-net com <strong>Ctrl+V</strong>, ou clique para selecionar o arquivo. A IA lê as informações e preenche os campos automaticamente.
            </p>

            {/* Drop / Paste Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                aiPreview ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] hover:border-[var(--chrome-dark)] bg-[var(--bg-deep)]'
              }`}
              onPaste={e => {
                const items = e.clipboardData?.items;
                if (!items) return;
                for (const item of items) {
                  if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    setAiImage(file);
                    setAiPreview(URL.createObjectURL(file));
                    break;
                  }
                }
              }}
              onClick={() => document.getElementById('ai-image-input').click()}
              tabIndex={0}
            >
              <input
                id="ai-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setAiImage(f); setAiPreview(URL.createObjectURL(f)); }
                }}
              />
              {aiPreview ? (
                <div className="p-3">
                  <img src={aiPreview} alt="Preview" className="max-h-48 rounded-lg mx-auto object-contain" />
                  <p className="text-center text-xs text-[var(--chrome-normal)] mt-2">Clique para trocar a imagem</p>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-4xl mb-2">📷</p>
                  <p className="text-[var(--chrome-light)] font-medium">Cole com Ctrl+V ou clique para selecionar</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG, WEBP etc.</p>
                </div>
              )}
            </div>

            {aiPreview && (
              <button
                type="button"
                onClick={handleAIImport}
                disabled={importing}
                className="mt-3 w-full px-6 py-3 rounded-lg font-bold bg-[var(--primary)] text-white hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                {importing ? '⏳ Analisando com IA...' : '✨ Analisar Print com IA'}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Status ──────────────────────────────────────────────── */}
            <div>
              <label className={lbl}>Status do Veículo</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'semi_novo', icon: '🚘', label: 'Semi-novo', desc: 'Usado / Pré-owned' },
                  { val: 'zero_km',  icon: '🆕', label: 'Zero KM',   desc: 'Direto para área de 0KM' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => handleStatusChange({ target: { value: opt.val } })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.status === opt.val
                      ? 'border-[var(--chrome)] bg-[var(--chrome)]/10'
                      : 'border-[var(--border)] hover:border-[var(--chrome-dark)]'}`}
                  >
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    <div className="font-bold text-white text-sm">{opt.label}</div>
                    <div className="text-xs text-[var(--text-muted)]">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Origem & Marca ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={lbl}>Origem</label>
                <select name="origin" value={formData.origin} onChange={handleOriginChange} className={sel}>
                  <option value="Japonesa">Doméstica (Japonesa)</option>
                  <option value="Importada">Importada</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Marca</label>
                <select name="marca" value={formData.marca} onChange={handleBrandChange} required className={sel}>
                  <option value="">Selecione a Marca...</option>
                  {Object.keys(carModels[formData.origin]).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Modelo & Preço ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-[var(--chrome-light)]">Modelo</label>
                  <button type="button" onClick={() => { setCustomModel(v => !v); set('modelo', ''); }}
                    className="text-xs text-[var(--chrome-dark)] hover:text-[var(--chrome-light)] underline transition-colors">
                    {customModel ? '← Usar lista' : '+ Variação personalizada'}
                  </button>
                </div>
                {customModel ? (
                  <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} required
                    placeholder="Ex: Prius AX, Harrier Turbo..." className={`${inp} border-[var(--chrome-dark)] border-dashed`} />
                ) : (
                  <select name="modelo" value={formData.modelo} onChange={handleChange} required disabled={!formData.marca} className={`${sel} disabled:opacity-50`}>
                    <option value="">Selecione o Modelo...</option>
                    {formData.marca && carModels[formData.origin][formData.marca]?.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className={lbl}>Preço (¥ JPY)</label>
                <input type="number" name="valor" value={formData.valor} onChange={handleChange} required placeholder="Ex: 1500000" className={inp} />
              </div>
            </div>

            {/* ── Tipo / Categoria ──────────────────────────────────── */}
            <div>
              <label className={lbl}>Categoria / Tipo de Carroceria</label>
              <div className="grid grid-cols-4 gap-2">
                {TIPOS.map(t => (
                  <button key={t} type="button"
                    onClick={() => set('tipo', t)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${formData.tipo === t
                      ? 'border-[var(--chrome)] bg-[var(--chrome)]/15 text-white'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--chrome-dark)]'}`}>
                    {TIPO_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Ano + Mês + Dia  ────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Ano</label>
                <select name="ano" value={formData.ano} onChange={handleChange} required className={sel}>
                  {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Mês</label>
                <select name="mesModelo" value={formData.mesModelo} onChange={handleChange} className={sel}>
                  <option value="">-- Mês --</option>
                  {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => (
                    <option key={m} value={MESES[i]}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Dia</label>
                <select name="diaModelo" value={formData.diaModelo} onChange={handleChange} className={sel}>
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
                  <input type="number" name="km" value={formData.km} onChange={handleChange} required={isSemiNovo}
                    placeholder="Ex: 35000" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Shaken (車検) — Vencimento</label>
                  <input type="month" name="shakenVencimento" value={formData.shakenVencimento} onChange={handleChange}
                    className={inp} />
                  <p className="text-xs text-[var(--text-muted)] mt-1">Deixe em branco se não tiver shaken vigente.</p>
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
                <input type="text" name="cor" value={formData.cor} onChange={handleChange} required placeholder="Ex: Azul Safira Metálico" className={inp} />
              ) : (
                <select name="cor" value={formData.cor} onChange={handleChange} required className={sel}>
                  <option value="">Selecione a Cor...</option>
                  {CORES_COMUNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>

            {/* ── Câmbio / Combustível / Potência ────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Câmbio</label>
                <select name="cambio" value={formData.cambio} onChange={handleChange} required className={sel}>
                  <option value="automatico">Automático (AT)</option>
                  <option value="cvt">CVT</option>
                  <option value="manual">Manual (MT)</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Combustível</label>
                <select name="combustivel" value={formData.combustivel} onChange={handleChange} required className={sel}>
                  <option value="hibrido">Híbrido (HEV/PHEV)</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="eletrico">Elétrico (EV)</option>
                  <option value="diesel">Diesel</option>
                  <option value="flex">Flex</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Motor / Potência</label>
                <input type="text" name="potencia" value={formData.potencia} onChange={handleChange} placeholder="Ex: 1.8L 140cv" className={inp} />
              </div>
            </div>

            {/* ── Dados Técnicos Avançados ──────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[var(--bg-card2)]/30 p-4 rounded-xl border border-[var(--border)]">
              <div>
                <label className={lbl}>Cilindradas (cc)</label>
                <input type="number" name="cilindradas" value={formData.cilindradas || ''} onChange={handleChange}
                  placeholder="Ex: 1800" className={inp} />
              </div>
              <div>
                <label className={lbl}>Nº de Portas</label>
                <select name="portas" value={formData.portas} onChange={handleChange} className={sel}>
                  {[2,3,4,5].map(n => <option key={n} value={n}>{n} portas</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Lotação (pass.)</label>
                <select name="lotacao" value={formData.lotacao} onChange={handleChange} className={sel}>
                  {[2,4,5,6,7,8].map(n => <option key={n} value={n}>{n} pessoas</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Tração</label>
                <select name="tracao" value={formData.tracao} onChange={handleChange} className={sel}>
                  <option value="">Selecione...</option>
                  <option value="FF">FF (Dianteira)</option>
                  <option value="FR">FR (Traseira)</option>
                  <option value="4WD">4WD (Integral)</option>
                  <option value="AWD">AWD (Integral)</option>
                  <option value="MR">MR (Motor Central)</option>
                </select>
              </div>
            </div>

            {/* ── Dimensões e Consumo (Novo Goo-net) ──────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[var(--bg-card2)]/30 p-4 rounded-xl border border-[var(--border)] mt-4">
              <div>
                <label className={lbl}>Comprimento (mm)</label>
                <input type="number" name="comprimento" value={formData.comprimento} onChange={handleChange} placeholder="Ex: 4895" className={inp} />
              </div>
              <div>
                <label className={lbl}>Largura (mm)</label>
                <input type="number" name="largura" value={formData.largura} onChange={handleChange} placeholder="Ex: 1800" className={inp} />
              </div>
              <div>
                <label className={lbl}>Altura (mm)</label>
                <input type="number" name="altura" value={formData.altura} onChange={handleChange} placeholder="Ex: 1450" className={inp} />
              </div>
              <div>
                <label className={lbl}>Peso (kg)</label>
                <input type="number" name="peso" value={formData.peso} onChange={handleChange} placeholder="Ex: 1650" className={inp} />
              </div>
              
              <div>
                <label className={lbl}>Consumo WLTC</label>
                <input type="text" name="wltcConsumo" value={formData.wltcConsumo} onChange={handleChange} placeholder="Ex: 15.0km/L" className={inp} />
              </div>
              <div>
                <label className={lbl}>Consumo JC08</label>
                <input type="text" name="jc08Consumo" value={formData.jc08Consumo} onChange={handleChange} placeholder="Ex: 19.2km/L" className={inp} />
              </div>
              <div>
                <label className={lbl}>Código Chassi</label>
                <input type="text" name="chassiCodigo" value={formData.chassiCodigo} onChange={handleChange} placeholder="Ex: DAA-AWS210" className={inp} />
              </div>
            </div>

            {/* ── Avaliação Goo-net / Condição ────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 mt-4">
              <div>
                <label className={lbl}>Avaliação Externa (1 a 5)</label>
                <select name="avaliacaoExterna" value={formData.avaliacaoExterna} onChange={handleChange} className={sel}>
                  <option value="">Sem avaliação</option>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Estrelas</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Avaliação Interna (1 a 5)</label>
                <select name="avaliacaoInterna" value={formData.avaliacaoInterna} onChange={handleChange} className={sel}>
                  <option value="">Sem avaliação</option>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Estrelas</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Estado Mecânico</label>
                <select name="estadoMecanico" value={formData.estadoMecanico} onChange={handleChange} className={sel}>
                  <option value="Normal">Normal (正常)</option>
                  <option value="Requer Atenção">Requer Atenção</option>
                </select>
              </div>
            </div>

            {/* ── Histórico / Dono Único ────────────────────────── */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 flex-1 min-w-[180px] bg-white/5 rounded-lg border border-white/10">
                <input type="checkbox" name="donoUnico" checked={!!formData.donoUnico} onChange={e => set('donoUnico', e.target.checked)}
                  className="w-5 h-5 accent-[var(--primary)]" />
                <div>
                  <span className="text-white font-medium block">Dono Único</span>
                  <span className="text-xs text-[var(--text-muted)]">ワンオーナー — apenas 1 dono anterior</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 flex-1 min-w-[180px] bg-red-500/5 rounded-lg border border-red-500/10">
                <input type="checkbox" name="historicoReparo" checked={!!formData.historicoReparo} onChange={e => set('historicoReparo', e.target.checked)}
                  className="w-5 h-5 accent-red-500" />
                <div>
                  <span className="text-red-200 font-medium block">Histórico de Reparo</span>
                  <span className="text-xs text-[var(--text-muted)]">修復歴あり — teve reparo estrutural</span>
                </div>
              </label>
            </div>

            {/* ── Garantia ────────────────────────────────────────── */}
            <div>
              <label className={lbl}>Garantia</label>
              <input type="text" name="garantia" value={formData.garantia} onChange={handleChange} placeholder="Ex: 6 meses de garantia de motor" className={inp} />
            </div>

            {/* ── Descrição Geral ─────────────────────────────────── */}
            <div>
              <label className={lbl}>Descrição Geral</label>
              <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows="3"
                placeholder="Estado geral do veículo, histórico de manutenção, pontos positivos..." className={txa} />
            </div>

            {/* ── Equipamentos / Opcionais ─────────────────────── */}
            <div className="border border-[var(--chrome-dark)]/30 bg-[var(--bg-card2)]/40 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-[var(--chrome-light)] text-sm uppercase tracking-wider">⚙️ Equipamentos / Opcionais</h3>
              <p className="text-xs text-[var(--text-muted)]">Itens detectados do Goo-net serão marcados automaticamente. Clique para alterar.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {equipamentosList.map(eq => (
                  <label key={eq} className="flex items-center gap-3 cursor-pointer group bg-black/20 hover:bg-black/40 p-2.5 rounded-lg border border-transparent hover:border-[var(--border)] transition-all">
                    <input 
                      type="checkbox" 
                      checked={formData.equipamentos.includes(eq)} 
                      onChange={() => handleEquipamentoToggle(eq)}
                      className="w-4 h-4 accent-[var(--chrome)] cursor-pointer"
                    />
                    <span className={`text-sm select-none transition-colors ${formData.equipamentos.includes(eq) ? 'text-white font-medium' : 'text-[var(--text-muted)] group-hover:text-[var(--chrome-light)]'}`}>
                      {eq}
                    </span>
                  </label>
                ))}
              </div>
              
              {/* Opcionais importados que não estão na lista padrão */}
              {formData.equipamentos.filter(eq => !equipamentosList.includes(eq)).length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--chrome-dark)]/30">
                  <span className="text-xs text-[var(--chrome-normal)] block mb-2">Outros opcionais detectados:</span>
                  <div className="flex flex-wrap gap-2">
                    {formData.equipamentos.filter(eq => !equipamentosList.includes(eq)).map(eq => (
                      <span key={eq} className="bg-[var(--bg-card2)] border border-[var(--chrome-dark)] px-3 py-1 rounded-md text-xs flex items-center gap-2">
                        {eq}
                        <button type="button" onClick={() => handleEquipamentoToggle(eq)} className="text-red-400 hover:text-red-300 font-bold">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Observações Detalhadas ─────────────────────────── */}
            <div className="border border-[var(--chrome-dark)]/30 bg-[var(--bg-card2)]/40 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-[var(--chrome-light)] text-sm uppercase tracking-wider">📋 Observações do Veículo</h3>
              <p className="text-xs text-[var(--text-muted)]">Detalhes visíveis para o cliente na página do veículo.</p>
              <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} rows="4"
                placeholder="Ex: Rodas esportivas aro 18, teto solar panorâmico, turbo, conversível, bancos em couro, câmera 360°, não batido, sem histórico de sinistro, revisões na concessionária..."
                className={txa} />
            </div>

            {/* ── Informações Internas ────────────────────────────── */}
            <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-yellow-400 text-sm uppercase tracking-wider">⚠️ Informações Internas (não visíveis ao cliente)</h3>
              <div>
                <label className={lbl}>Defeitos / Avarias conhecidas</label>
                <textarea name="defeitos" value={formData.defeitos} onChange={handleChange} rows="2"
                  placeholder="Ex: Risco leve no pára-choque traseiro, amortecedor com folga..." className={txa} />
              </div>
              <div>
                <label className={lbl}>Observações Internas</label>
                <textarea name="informacoes_adicionais" value={formData.informacoes_adicionais} onChange={handleChange} rows="2"
                  placeholder="Qualquer observação interna para a equipe..." className={txa} />
              </div>
            </div>

            {/* ── Redes Sociais & Mídia (Links) ────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--bg-card2)]/30 p-4 rounded-xl border border-[var(--border)]">
              <div>
                <label className={lbl}>Link do Vídeo (YouTube, Facebook...)</label>
                <input type="url" name="linkVideo" value={formData.linkVideo} onChange={handleChange}
                  placeholder="Ex: https://youtube.com/watch?v=..." className={inp} />
              </div>
              <div>
                <label className={lbl}>Link do Instagram (Post/Reels)</label>
                <input type="url" name="linkInstagram" value={formData.linkInstagram} onChange={handleChange}
                  placeholder="Ex: https://instagram.com/p/..." className={inp} />
              </div>
            </div>

            {/* ── Fotos & Vídeos ─────────────────────────────────────────── */}
            <div>
              <label className={lbl}>Mídia do Veículo (Fotos e Vídeos)</label>
              <div className="bg-[var(--bg-card2)] border-2 border-dashed border-[var(--border)] hover:border-[var(--chrome-dark)] rounded-xl p-6 text-center transition-colors cursor-pointer group"
                onClick={() => document.getElementById('img-upload-estoque').click()}>
                <div className="text-3xl mb-2">📷/🎥</div>
                <p className="text-sm text-[var(--text-muted)] group-hover:text-white transition-colors">Clique para selecionar mídia</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Imagens (JPG, PNG, WEBP) ou Vídeos (MP4, WEBM) — Até 50MB</p>
                <input id="img-upload-estoque" type="file" multiple accept="image/*,video/mp4,video/mov,video/webm" style={{ display: 'none' }} onChange={handleImageFilesChange} />
              </div>
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                   {imagePreviews.map((src, i) => {
                     const isVideo = imageFiles[i] && imageFiles[i].type.startsWith('video/');
                     return (
                       <div key={i} className="relative group">
                         {isVideo ? (
                           <video src={src} className="w-24 h-24 object-cover rounded-lg border border-[var(--chrome)]" muted autoPlay loop />
                         ) : (
                           <img src={src} alt={`preview ${i}`} className="w-24 h-24 object-cover rounded-lg border border-[var(--border)]" />
                         )}
                         {/* Ordering Controls */}
                         <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button type="button" onClick={(e) => { e.stopPropagation(); if (i > 0) { const f = [...imageFiles]; const p = [...imagePreviews]; [f[i-1], f[i]] = [f[i], f[i-1]]; [p[i-1], p[i]] = [p[i], p[i-1]]; setImageFiles(f); setImagePreviews(p); } }}
                             className="bg-black/60 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center hover:bg-black disabled:opacity-30" disabled={i === 0}>◀</button>
                           <button type="button" onClick={(e) => { e.stopPropagation(); if (i < imageFiles.length - 1) { const f = [...imageFiles]; const p = [...imagePreviews]; [f[i+1], f[i]] = [f[i], f[i+1]]; [p[i+1], p[i]] = [p[i], p[i+1]]; setImageFiles(f); setImagePreviews(p); } }}
                             className="bg-black/60 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center hover:bg-black disabled:opacity-30" disabled={i === imageFiles.length - 1}>▶</button>
                         </div>
                         <button type="button" onClick={(e) => { e.stopPropagation(); const f = [...imageFiles]; const p = [...imagePreviews]; f.splice(i, 1); p.splice(i, 1); setImageFiles(f); setImagePreviews(p); }}
                           className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                       </div>
                     );
                   })}
                </div>
              )}
              <p className="text-xs text-[var(--text-muted)] mt-5">Ou cole URLs diretas (separadas por vírgula):</p>
              <textarea name="imagens" value={formData.imagens} onChange={handleChange} rows="2"
                placeholder="https://imagem1.jpg, https://video1.mp4"
                className="mt-2 w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:border-[var(--chrome)] transition-colors outline-none resize-none text-sm" />
            </div>

            {/* ── Botões ─────────────────────────────────────────── */}
            <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3">
              <button type="button" onClick={() => navigate('/admin')}
                className="px-6 py-3 rounded-lg font-bold text-[var(--text-muted)] hover:text-white transition-colors">Cancelar</button>
              <button type="submit" disabled={loading}
                className="px-8 py-3 rounded-lg font-bold bg-gradient-to-r from-[var(--chrome-light)] to-[var(--chrome)] text-black hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.2)]">
                {loading ? 'Salvando...' : 'Adicionar ao Estoque'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
