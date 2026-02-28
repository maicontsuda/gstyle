import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import ZeroKmCard from '../components/ZeroKmCard';
import './Estoque.css'; // Podemos reaproveitar muito do layout de Estoque

export default function ZeroKmCars() {
  const { brand } = useParams();
  
  const [carros, setCarros] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    model: '',
    minPrice: '',
    maxPrice: '',
    year: '',
    fuel_type: '',
    category: '',
    transmission: '',
    color: '',
    sort: 'popular' // 'asc_price', 'desc_price', 'newest', 'oldest', 'az'
  });

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [paginas, setPaginas] = useState(1);

  const fetchCarros = () => {
    setLoading(true);
    // Monta a query string com todos os filtros válidos
    const params = new URLSearchParams({ brand, page: paginaAtual, limit: 12 });
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) params.append(key, filtros[key]);
    });

    api.get(`/zerokm?${params.toString()}`)
      .then(res => {
        setCarros(res.data.carros);
        setTotal(res.data.total);
        setPaginas(res.data.paginas);
      })
      .catch(err => console.error("Erro ao buscar 0KM:", err))
      .finally(() => setLoading(false));
  };

  // Re-fetch quando página, marca ou filtros (ao aplicar) mudarem
  useEffect(() => {
    fetchCarros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand, paginaAtual, filtros.sort]); 
  // Nota: Não colocamos 'filtros' inteiro aqui senão o onChange do input daria refresh a cada letra.
  // A busca será acionada por um botão "Aplicar Filtros".

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    setPaginaAtual(1); // Reseta paginação ao filtrar
    fetchCarros();
  };

  const handleClearFilters = () => {
    setFiltros({
      model: '', minPrice: '', maxPrice: '', year: '', 
      fuel_type: '', category: '', transmission: '', color: '', sort: 'popular'
    });
    setPaginaAtual(1);
    // O useEffect do sort vai rodar, mas para garantir:
    setTimeout(fetchCarros, 0); 
  };

  return (
    <div className="page-enter bg-[var(--bg-deep)] min-h-screen">
      
      {/* Mini Hero Header */}
      <div className="pt-32 pb-12 bg-black/40 border-b border-[var(--border)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--chrome)]/10 to-transparent pointer-events-none"></div>
        <div className="container relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <Link to="/zero-km" className="text-[var(--chrome-dark)] hover:text-[var(--chrome-light)] mb-2 inline-block text-sm font-semibold tracking-wider uppercase transition-colors">
              ← Voltar para Marcas
            </Link>
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white uppercase tracking-wider">
              {brand} <span className="text-[var(--chrome)] font-normal ml-2">0KM</span>
            </h1>
            <p className="text-[var(--text-muted)] mt-2">
              Explorando {total} modelo(s) disponíveis no catálogo do Japão.
            </p>
          </div>
          
          {/* Ordenação rápida */}
          <div className="flex items-center gap-3 bg-[var(--bg-card)] p-2 rounded-lg border border-[var(--border)]">
            <span className="text-sm font-medium text-[var(--text-muted)] pl-2">Ordenar por:</span>
            <select 
              name="sort" 
              value={filtros.sort} 
              onChange={(e) => { handleChange(e); setPaginaAtual(1); }}
              className="bg-transparent border-none text-[var(--chrome-light)] font-medium focus:ring-0 cursor-pointer text-sm w-auto"
            >
              <option value="popular">Relevância</option>
              <option value="asc_price">Menor Preço</option>
              <option value="desc_price">Maior Preço</option>
              <option value="newest">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
              <option value="az">Ordem Alfabética</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container py-12 px-6">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* SIDEBAR DE FILTROS */}
          <aside className="w-full lg:w-[300px] flex-shrink-0 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 sticky top-28 backdrop-blur-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border)]">
              <h2 className="font-playfair text-xl text-[var(--chrome-light)]">Filtros Avançados</h2>
              <button onClick={handleClearFilters} className="text-xs font-bold text-[var(--chrome-dark)] hover:text-[var(--chrome-light)] uppercase tracking-wider transition-colors">
                Limpar
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-5">
              
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Modelo</label>
                <input type="text" name="model" value={filtros.model} onChange={handleChange} placeholder="Ex: Prius, G-Class..." 
                       className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-white focus:border-[var(--chrome)] transition-colors outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Categoria</label>
                <select name="category" value={filtros.category} onChange={handleChange}
                        className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-white focus:border-[var(--chrome)] transition-colors outline-none cursor-pointer">
                  <option value="">Todas as Categorias</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Minivan">Minivan</option>
                  <option value="Kei Car">Kei Car</option>
                  <option value="Esportivo">Esportivo</option>
                  <option value="Picape">Picape / Truck</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Preço Min (¥)</label>
                  <input type="number" name="minPrice" value={filtros.minPrice} onChange={handleChange} step="100000" placeholder="0"
                         className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--chrome)] transition-colors outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Preço Max (¥)</label>
                  <input type="number" name="maxPrice" value={filtros.maxPrice} onChange={handleChange} step="100000" placeholder="Sem limite"
                         className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--chrome)] transition-colors outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Ano</label>
                  <input type="number" name="year" value={filtros.year} onChange={handleChange} placeholder="Ano exato"
                         className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--chrome)] transition-colors outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Câmbio</label>
                  <select name="transmission" value={filtros.transmission} onChange={handleChange}
                          className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--chrome)] transition-colors outline-none cursor-pointer">
                    <option value="">Qualquer</option>
                    <option value="AT">Automático</option>
                    <option value="MT">Manual</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Combustível</label>
                <select name="fuel_type" value={filtros.fuel_type} onChange={handleChange}
                        className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-white focus:border-[var(--chrome)] transition-colors outline-none cursor-pointer">
                  <option value="">Qualquer</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Hybrid">Híbrido (HEV/PHEV)</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Elétrico">Elétrico (EV)</option>
                </select>
              </div>

              <button type="submit" className="w-full mt-6 py-3 rounded-lg bg-gradient-to-r from-[var(--chrome-dark)] to-[var(--chrome)] text-black font-bold uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[var(--chrome)]/20 transition-all active:scale-95">
                Aplicar Filtros
              </button>
            </form>
          </aside>

          {/* GRID DE RESULTADOS */}
          <main className="flex-1 min-w-0 pb-20">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="spinner w-10 h-10 border-4 border-[var(--border)] border-t-[var(--chrome)] rounded-full animate-spin"></div>
              </div>
            ) : carros.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {carros.map(car => (
                    <ZeroKmCard key={car._id} car={car} />
                  ))}
                </div>

                {/* Paginação */}
                {paginas > 1 && (
                  <div className="flex justify-center gap-2 mt-16">
                    {Array.from({ length: paginas }, (_, i) => i + 1).map(pag => (
                      <button 
                        key={pag}
                        onClick={() => { setPaginaAtual(pag); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${paginaAtual === pag ? 'bg-[var(--chrome-light)] text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--chrome-light)] hover:text-white'}`}
                      >
                        {pag}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4 opacity-50">🏎️</div>
                <h3 className="text-2xl font-playfair text-[var(--chrome-light)] mb-2">Nenhum veículo encontrado</h3>
                <p className="text-[var(--text-muted)]">Não encontramos nenhum {brand} 0KM com os filtros selecionados.</p>
                <button onClick={handleClearFilters} className="mt-6 px-6 py-2 border border-[var(--chrome)] bg-transparent text-[var(--chrome-light)] rounded-lg hover:bg-[var(--chrome)] hover:text-black transition-colors font-semibold uppercase tracking-wider text-sm">
                  Limpar Filtros
                </button>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
