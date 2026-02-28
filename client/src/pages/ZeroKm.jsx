import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CarCard from '../components/CarCard';
import api from '../api';
import './Estoque.css'; // Reusing Estoque CSS for layout

const TIPOS = ['', 'sedan', 'suv', 'hatch', 'pickup', 'esportivo', 'van'];

export default function ZeroKm() {
  const [carros, setCarros] = useState([]);
  const [total, setTotal] = useState(0);
  const [paginas, setPaginas] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filtros, setFiltros] = useState({
    marca: searchParams.get('marca') || '',
    tipo:  searchParams.get('tipo')  || '',
    status: 'zero_km', // Forçado
    minValor: searchParams.get('minValor') || '',
    maxValor: searchParams.get('maxValor') || '',
    minAno: searchParams.get('minAno') || '',
    maxAno: searchParams.get('maxAno') || '',
    page: Number(searchParams.get('page')) || 1,
  });

  const buscar = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filtros).filter(([,v]) => v !== ''));
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
    setFiltros({ marca: '', tipo: '', status: 'zero_km', minValor: '', maxValor: '', minAno: '', maxAno: '', page: 1 });
  }

  return (
    <div className="estoque-layout page-enter">
      <aside className="estoque-sidebar">
        <div className="sidebar-header">
          <h2>Filtros Zero KM</h2>
          <button onClick={limpar} className="btn-limpar">Limpar</button>
        </div>

        <div className="filter-group">
          <label>Marca / Modelo</label>
          <input
            placeholder="Ex: Toyota, Civic..."
            value={filtros.marca}
            onChange={e => setFiltro('marca', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Tipo</label>
          <select value={filtros.tipo} onChange={e => setFiltro('tipo', e.target.value)}>
            <option value="">Todos</option>
            {TIPOS.filter(Boolean).map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Faixa de Preço (R$)</label>
          <div className="filter-row">
            <input
              type="number" placeholder="Mínimo"
              value={filtros.minValor}
              onChange={e => setFiltro('minValor', e.target.value)}
            />
            <input
              type="number" placeholder="Máximo"
              value={filtros.maxValor}
              onChange={e => setFiltro('maxValor', e.target.value)}
            />
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={buscar}>
          🔍 Buscar Zero KM
        </button>
      </aside>

      <div className="estoque-main">
        <div className="estoque-header">
          <h1 className="estoque-title">
            {loading ? 'Buscando...' : `${total} veículo${total !== 1 ? 's' : ''} Zero KM`}
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
            <p style={{ color: 'var(--text-muted)' }}>Nenhum veículo zero km encontrado.</p>
            <button onClick={limpar} className="btn btn-outline" style={{ marginTop: 16 }}>
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
