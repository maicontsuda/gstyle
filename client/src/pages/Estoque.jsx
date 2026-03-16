import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CarCard from '../components/CarCard';
import api from '../api';
import './Estoque.css';

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

const ALL_BRANDS = [
  ...Object.keys(carModels.Japonesa),
  ...Object.keys(carModels.Importada),
];

const TIPOS = ['sedan','suv','hatch','minivan','kei','esportivo','pickup','van'];
const TIPO_LABELS = { sedan:'Sedan', suv:'SUV', hatch:'Hatch', minivan:'Minivan', kei:'Kei Car', esportivo:'Esportivo', pickup:'Picape', van:'Van' };

const ANOS = Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i);

export default function Estoque() {
  const navigate = useNavigate();
  const [carros, setCarros] = useState([]);
  const [total, setTotal] = useState(0);
  const [paginas, setPaginas] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [filtros, setFiltros] = useState({
    marca: searchParams.get('marca') || '',
    modelo: searchParams.get('modelo') || '',
    tipo:   searchParams.get('tipo')   || '',
    status: searchParams.get('status') || '',
    minValor: searchParams.get('minValor') || '',
    maxValor: searchParams.get('maxValor') || '',
    minAno: searchParams.get('minAno') || '',
    maxAno: searchParams.get('maxAno') || '',
    page: Number(searchParams.get('page')) || 1,
  });

  // When status changes to zero_km, redirect to Zero KM page
  const handleStatusChange = (value) => {
    if (value === 'zero_km') {
      navigate('/zero-km');
      return;
    }
    setFiltro('status', value);
  };

  // Derived: which brand group is selected?
  const selectedBrandGroup = () => {
    for (const [group, brands] of Object.entries(carModels)) {
      if (Object.keys(brands).includes(filtros.marca)) return group;
    }
    return null;
  };
  const modelsForBrand = filtros.marca
    ? (carModels[selectedBrandGroup() || 'Japonesa']?.[filtros.marca] || [])
    : [];

  const buscar = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''));
    api.get('/carros', { params })
      .then(r => {
        setCarros(r.data.carros || []);
        setTotal(r.data.total || 0);
        setPaginas(r.data.paginas || 1);
      })
      .catch(() => setCarros([]))
      .finally(() => setLoading(false));
  }, [filtros]);

  useEffect(() => { buscar(); }, [buscar]);

  function setFiltro(key, value) {
    setFiltros(f => ({ ...f, [key]: value, page: 1 }));
  }

  function limpar() {
    setFiltros({ marca: '', modelo: '', tipo: '', status: '', minValor: '', maxValor: '', minAno: '', maxAno: '', page: 1 });
  }

  return (
    <div className="estoque-layout page-enter">
      {/* Sidebar de filtros */}
      <aside className="estoque-sidebar">
        <div className="sidebar-header">
          <h2>Filtros</h2>
          <button onClick={limpar} className="btn-limpar">Limpar</button>
        </div>

        {/* ── Status ──────────────── */}
        <div className="filter-group">
          <label>Status</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { val: '', label: 'Todos' },
              { val: 'semi_novo', label: '🚘 Semi-novo' },
              { val: 'zero_km', label: '🆕 Zero KM', redirect: true },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => opt.redirect ? handleStatusChange(opt.val) : setFiltro('status', opt.val)}
                style={{
                  padding: '8px 6px',
                  borderRadius: 8,
                  border: `1.5px solid ${filtros.status === opt.val && !opt.redirect ? 'var(--chrome)' : 'var(--border)'}`,
                  background: filtros.status === opt.val && !opt.redirect ? 'rgba(200,205,212,0.12)' : 'transparent',
                  color: filtros.status === opt.val && !opt.redirect ? 'var(--text)' : 'var(--text-muted)',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  gridColumn: opt.val === '' ? 'span 2' : 'span 1',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Marca ────────────────── */}
        <div className="filter-group">
          <label>Marca</label>
          <select value={filtros.marca} onChange={e => { setFiltro('marca', e.target.value); setFiltro('modelo', ''); }}>
            <option value="">Todas as marcas</option>
            <optgroup label="🇯🇵 Domésticas">
              {Object.keys(carModels.Japonesa).map(b => <option key={b} value={b}>{b}</option>)}
            </optgroup>
            <optgroup label="🌍 Importadas">
              {Object.keys(carModels.Importada).map(b => <option key={b} value={b}>{b}</option>)}
            </optgroup>
          </select>
        </div>

        {/* ── Modelo (aparece só quando tem marca selecionada) ── */}
        {filtros.marca && modelsForBrand.length > 0 && (
          <div className="filter-group">
            <label>Modelo — {filtros.marca}</label>
            <select value={filtros.modelo} onChange={e => setFiltro('modelo', e.target.value)}>
              <option value="">Todos os modelos</option>
              {modelsForBrand.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}

        {/* ── Tipo ─────────────────── */}
        <div className="filter-group">
          <label>Tipo de Carroceria</label>
          <select value={filtros.tipo} onChange={e => setFiltro('tipo', e.target.value)}>
            <option value="">Todos</option>
            {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABELS[t]}</option>)}
          </select>
        </div>

        {/* ── Preço ────────────────── */}
        <div className="filter-group">
          <label>Faixa de Preço (¥)</label>
          <div className="filter-row">
            <input type="number" placeholder="Mínimo" value={filtros.minValor} onChange={e => setFiltro('minValor', e.target.value)} />
            <input type="number" placeholder="Máximo" value={filtros.maxValor} onChange={e => setFiltro('maxValor', e.target.value)} />
          </div>
        </div>

        {/* ── Ano ──────────────────── */}
        <div className="filter-group">
          <label>Ano</label>
          <div className="filter-row">
            <select value={filtros.minAno} onChange={e => setFiltro('minAno', e.target.value)}>
              <option value="">De</option>
              {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={filtros.maxAno} onChange={e => setFiltro('maxAno', e.target.value)}>
              <option value="">Até</option>
              {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={buscar}>
          🔍 Buscar
        </button>
      </aside>

      {/* Grade de resultados */}
      <div className="estoque-main">
        <div className="estoque-header">
          <h1 className="estoque-title">
            {loading ? 'Buscando...' : `${total} veículo${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
          </h1>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : carros.length > 0 ? (
          <>
            <div className="grid-3">
              {carros.map(c => <CarCard key={c._id} carro={c} />)}
            </div>

            {paginas > 1 && (
              <div className="paginacao">
                {Array.from({ length: paginas }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`pag-btn ${filtros.page === p ? 'active' : ''}`}
                    onClick={() => setFiltros(f => ({ ...f, page: p }))}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state" style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: 12 }}>🚗</p>
            <p style={{ color: 'var(--text-muted)' }}>Nenhum veículo encontrado com esses filtros.</p>
            <button onClick={limpar} className="btn btn-outline" style={{ marginTop: 16 }}>
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
