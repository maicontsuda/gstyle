import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import SidebarComunidade from '../components/SidebarComunidade';
import './Comunidade.css';

export default function Comunidade() {
  const { user } = useAuth();
  const [publicacoes, setPublicacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // todos, evento, parceiro, social
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Verifica se o usuário pode editar o post (Admin ou Autor Vinculado)
  const canEdit = (pub) => {
    if (!user) return false;
    const isStaff = ['admin', 'dono', 'gerente', 'funcionario'].includes(user.tipo_usuario);
    if (isStaff) return true;
    const isOwner = pub.parceiroVinculado?._id === user._id || pub.parceiroVinculado === user._id;
    return isOwner;
  };

  useEffect(() => {
    const fetchPubs = async () => {
      setLoading(true);
      const url = user ? '/publicacoes/admin' : '/publicacoes';
      try {
        const res = await api.get(url);
        setPublicacoes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPubs();
  }, [user]);

  const getBadgeClass = (tipo) => {
    if (tipo === 'evento') return 'badge-gold';
    if (tipo === 'parceiro') return 'badge-green';
    return 'badge-primary'; // social
  };

  const getLabel = (tipo) => {
    if (tipo === 'evento') return '📅 Evento Automotivo';
    if (tipo === 'parceiro') return '🤝 Parceiro G-Style';
    return '📱 Redes Sociais';
  };

  const toggleFavorite = async (e, pubId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Por favor, faça login para favoritar publicações.");
      return;
    }
    try {
      await api.post(`/auth/favoritos/publicacoes/${pubId}`);
      if (user.setUser) {
         api.get('/auth/me').then(r => user.setUser(r.data));
      } else {
         window.location.reload(); 
      }
    } catch (err) {
      console.error('Erro ao favoritar', err);
    }
  };

  const handleAccessLink = (e, pubId, link) => {
    e.preventDefault();
    if (user) {
      api.post(`/auth/historico/publicacoes/${pubId}`).catch(() => {});
    }
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  // Filtrar e Ordenar no Client-side
  const postsFiltrados = publicacoes.filter(pub => {
    let matchFiltro = filtro === 'todos' || pub.tipo === filtro;
    
    // Filtragem por período customizado selecionado no painel
    let matchDataMin = true;
    let matchDataMax = true;
    if (dataInicio) {
      matchDataMin = new Date(pub.dataPublicacao) >= new Date(dataInicio);
    }
    if (dataFim) {
      const end = new Date(dataFim);
      end.setHours(23, 59, 59, 999);
      matchDataMax = new Date(pub.dataPublicacao) <= end;
    }

    return matchFiltro && matchDataMin && matchDataMax;
  }).sort((a, b) => {
    // Lógica de Prioridade: Eventos chegando em 3 dias ou menos ficam no topo
    const agora = new Date();
    const tresDiasFrente = new Date();
    tresDiasFrente.setDate(agora.getDate() + 3);

    const checkPrioritario = (pub) => {
      if (pub.tipo !== 'evento' || !pub.dataPublicacao) return false;
      const dataEvento = new Date(pub.dataPublicacao);
      // Se o evento for no futuro (ou hoje) e dentro da janela de 3 dias, é prioritário
      return dataEvento >= agora.setHours(0,0,0,0) && dataEvento <= tresDiasFrente;
    };

    const aIsPrioritario = checkPrioritario(a);
    const bIsPrioritario = checkPrioritario(b);

    if (aIsPrioritario && !bIsPrioritario) return -1;
    if (!aIsPrioritario && bIsPrioritario) return 1;

    // Se ambos são prioritários ou nenhum for, ordena por data (mais recente/próximo primeiro)
    return new Date(b.dataPublicacao) - new Date(a.dataPublicacao);
  });

  return (
    <div className="comunidade-page page-enter">
      <div className="container max-w-6xl mx-auto px-4">
        
        <div className="comunidade-header">
          <div className="accent-line" />
          <h1 className="section-title">Nossa <span>Comunidade</span></h1>
          <p className="section-sub">Acompanhe eventos, parcerias exclusivas e o que a G-Style anda aprontando nas redes sociais.</p>
        </div>

        <div className="flex flex-col gap-8">
          
          {/* Main Feed Area (Now takes full width) */}
          <div className="w-full">
            
            {/* Filters */}
            <div className="comunidade-filters flex-col md:flex-row !items-start md:!items-center justify-between pb-6 border-b border-[var(--border)] mb-8">
              <div className="flex flex-wrap gap-2">
                <button className={`btn-filter ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>Tudo</button>
                <button className={`btn-filter ${filtro === 'evento' ? 'active' : ''}`} onClick={() => setFiltro('evento')}>Eventos</button>
                <button className={`btn-filter ${filtro === 'parceiro' ? 'active' : ''}`} onClick={() => setFiltro('parceiro')}>Parceiros</button>
                <button className={`btn-filter ${filtro === 'social' ? 'active' : ''}`} onClick={() => setFiltro('social')}>Mídia</button>
              </div>
              
              <div className="flex items-center gap-2 mt-4 md:mt-0 text-sm">
                 <span className="text-[var(--text-muted)] font-semibold uppercase tracking-wider text-xs">Período:</span>
                 <input 
                   type="date" 
                   value={dataInicio} 
                   onChange={(e) => setDataInicio(e.target.value)}
                   className="bg-[var(--bg-card)] text-white border border-[var(--border)] rounded px-2 py-1 outline-none focus:border-[var(--chrome)]"
                 />
                 <span className="text-[var(--text-muted)]">até</span>
                 <input 
                   type="date" 
                   value={dataFim} 
                   onChange={(e) => setDataFim(e.target.value)}
                   className="bg-[var(--bg-card)] text-white border border-[var(--border)] rounded px-2 py-1 outline-none focus:border-[var(--chrome)]"
                 />
                 {(dataInicio || dataFim) && (
                   <button onClick={() => { setDataInicio(''); setDataFim(''); }} className="text-red-400 hover:text-red-300 ml-2 text-xs font-bold border border-red-400 px-2 py-1 rounded">
                     Limpar
                   </button>
                 )}
              </div>
            </div>

            {loading ? (
              <div className="spinner" />
            ) : postsFiltrados.length === 0 ? (
              <div className="empty-state">
                <p>Nenhuma publicação encontrada para o filtro selecionado.</p>
              </div>
            ) : (
              <div className="publicacoes-grid md:grid-cols-2 lg:grid-cols-3">
                {postsFiltrados.map(pub => {
                  
                  // Identifica visualmente se é um evento prioritário
                  const isTopPriority = (() => {
                    const agora = new Date();
                    const max = new Date();
                    max.setDate(agora.getDate() + 3);
                    if (pub.tipo !== 'evento' || !pub.dataPublicacao) return false;
                    const d = new Date(pub.dataPublicacao);
                    return d >= agora.setHours(0,0,0,0) && d <= max;
                  })();

                  const isFavorite = Boolean(
                    user && user.favoritosPublicacoes && user.favoritosPublicacoes.some(p => 
                      (typeof p === 'object' ? p._id : p) === pub._id
                    )
                  );

                  return (
                  <div key={pub._id} className={`pub-card card relative ${!pub.ativo ? 'opacity-50 grayscale' : ''} ${isTopPriority ? 'border-2 border-[var(--chrome-light)] shadow-[0_0_15px_rgba(235,199,139,0.3)]' : ''}`}>
                    
                    {/* Botoes de acao rapida */}
                    <div className="absolute top-2 right-2 flex gap-2 z-20">
                      <button 
                        onClick={(e) => toggleFavorite(e, pub._id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all bg-black/60 shadow-lg ${isFavorite ? 'text-red-500 scale-110' : 'text-white hover:text-red-400'}`}
                        title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFavorite ? "0" : "2"} className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </button>
                    </div>

                    {pub.imagemUrl && pub.tipo !== 'social' && (
                      <div className="pub-img relative">
                         {isTopPriority && (
                          <div className="absolute top-0 right-0 bg-[var(--chrome-light)] text-black text-xs font-bold px-3 py-1 -mt-1 -mr-1 z-10 shadow-lg">
                            🔥 EVENTO NESTA SEMANA
                          </div>
                        )}
                        <img src={pub.imagemUrl} alt={pub.titulo} />
                        {!pub.ativo && <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">INATIVO</div>}
                      </div>
                    )}
                    
                    {pub.tipo === 'social' && pub.linkDestino && (
                      <div className="pub-social-placeholder relative">
                        <span>📱 Ver no Instagram/TikTok</span>
                        {!pub.ativo && <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">INATIVO</div>}
                      </div>
                    )}

                    <div className="pub-body">
                      {isTopPriority && !pub.imagemUrl && (
                        <div className="bg-[var(--chrome-light)] text-black text-xs font-bold px-3 py-1 self-start mb-2 rounded shadow-lg">
                          🔥 EVENTO NESTA SEMANA
                        </div>
                      )}
                      <div className={`badge ${getBadgeClass(pub.tipo)} pub-badge`}>
                        {getLabel(pub.tipo)}
                      </div>
                      <h3 className="pub-title">{pub.titulo}</h3>
                      <span className="pub-data">{new Date(pub.dataPublicacao).toLocaleDateString('ja-JP')}</span>
                      {pub.descricao && <p className="pub-desc">{pub.descricao}</p>}
                      
                      <div className="mt-auto pt-4 flex gap-2 w-full">
                        {pub.linkDestino && (
                          <button onClick={(e) => handleAccessLink(e, pub._id, pub.linkDestino)} className="flex-1 btn btn-outline pub-btn !text-xs justify-center">
                            {pub.tipo === 'social' ? 'Ver Postagem' : 'Acessar Link'}
                          </button>
                        )}
                        {canEdit(pub) && (
                          <Link to={`/admin/publicacoes/edit/${pub._id}`} className="flex-1 btn !border-[var(--chrome)] !text-[var(--chrome)] hover:!bg-[var(--chrome)] hover:!text-black !text-xs font-bold transition-colors justify-center">
                            ✏️ Editar
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
