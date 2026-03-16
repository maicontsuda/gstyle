import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Perfil.css';

function formatPrice(v) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(v);
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

const STATUS_LABELS = { pendente: 'Pendente', confirmada: '✅ Confirmada', cancelada: '❌ Cancelada' };

export default function Perfil() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [cancelando, setCancelando] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) {
      api.get('/reservas')
        .then(r => setReservas(r.data))
        .finally(() => setLoadingReservas(false));
    }
  }, [user, authLoading, navigate]);

  const cancelarReserva = async (id) => {
    setCancelando(id);
    try {
      await api.delete(`/reservas/${id}`);
      setReservas(prev => prev.map(r => r._id === id ? { ...r, status: 'cancelada' } : r));
    } finally { setCancelando(null); }
  };

  if (authLoading) return <div className="spinner" style={{ marginTop: 140 }} />;
  if (!user) return null;

  return (
    <div className="perfil-page page-enter">
      <div className="container">

        {/* Header do perfil */}
        <div className="perfil-header">
          <div className="perfil-avatar-wrap">
            <img src={user.thumbnail} alt={user.username} className="perfil-avatar" />
          </div>
          <div className="perfil-info">
            <div className="perfil-badge badge badge-gold">Cliente G-Style</div>
            <h1 className="perfil-name">{user.username}</h1>
            <p className="perfil-email">{user.email}</p>
            <p className="perfil-since">Membro desde {formatDate(user.createdAt)}</p>
          </div>
          <button onClick={logout} className="btn btn-ghost perfil-logout">Sair da conta</button>
        </div>

        <div className="divider" />

        {/* --- Visitas Agendadas --- */}
        <div className="mb-12">
          <div className="accent-line" />
          <h2 className="section-title">Minhas <span>Visitas Agendadas</span></h2>
          <p className="section-sub">Histórico de agendamentos de visita para conhecer os veículos</p>

          {loadingReservas ? (
            <div className="spinner" />
          ) : reservas.length === 0 ? (
            <div className="perfil-empty">
              <p>🚗</p>
              <p>Você ainda não agendou nenhuma visita.</p>
              <Link to="/estoque" className="btn btn-outline" style={{ marginTop: 16 }}>Explorar estoque</Link>
            </div>
          ) : (
            <div className="reservas-list">
              {reservas.map(r => (
                <div key={r._id} className="reserva-item card">
                  <div className="reserva-img-wrap">
                    <img
                      src={r.carro?.imagens?.[0] || 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=200&q=60'}
                      alt={r.carro ? `${r.carro.marca} ${r.carro.modelo}` : 'Veículo'}
                    />
                  </div>
                  <div className="reserva-body">
                    {r.carro ? (
                      <Link to={`/veiculo/${r.carro._id}`} className="reserva-carro-nome hover:text-[var(--chrome)] transition-colors">
                        {r.carro.marca} {r.carro.modelo} ({r.carro.ano})
                      </Link>
                    ) : <span className="reserva-carro-nome">Veículo removido</span>}
                    <div className="reserva-meta">
                      <span>📅 {formatDate(r.data)}</span>
                      {r.carro?.valor && <span>{formatPrice(r.carro.valor)}</span>}
                    </div>
                    {r.mensagem && <p className="reserva-msg">"{r.mensagem}"</p>}
                  </div>
                  <div className="reserva-status-col">
                    <span className={`badge ${r.status === 'confirmada' ? 'badge-green' : r.status === 'pendente' ? 'badge-gold' : ''}`}>
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                    {r.status === 'pendente' && (
                      <button
                        className="btn-cancel"
                        onClick={() => cancelarReserva(r._id)}
                        disabled={cancelando === r._id}
                      >
                        {cancelando === r._id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="divider" />

        {/* --- Favoritos --- */}
        <div className="mb-12">
          <div className="accent-line" />
          <h2 className="section-title">Minha <span>Lista de Desejos</span></h2>
          <p className="section-sub">Veículos e publicações que você favoritou</p>

          <div className="flex flex-col gap-12 mt-6">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="text-[var(--chrome)] text-2xl">❤️</span> Carros Favoritos</h2>
              {!user.favoritosCarros || user.favoritosCarros.length === 0 ? (
                 <div className="perfil-empty !py-8">
                    <p>Nenhum carro favoritado ainda.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                   {user.favoritosCarros.map(c => (
                     <div key={c._id} className="card overflow-hidden">
                       <Link to={`/veiculo/${c._id}`}>
                         <img src={c.imagens?.[0]} alt={c.modelo} className="w-full h-40 object-cover hover:scale-105 transition-transform" />
                       </Link>
                       <div className="p-4">
                         <h3 className="font-bold text-lg leading-tight">{c.marca} {c.modelo}</h3>
                         <p className="text-sm text-[var(--text-muted)]">{c.ano} • {c.kilometragem ? `${c.kilometragem}km` : c.km ? `${c.km}km` : '0km'}</p>
                         <p className="font-bold text-[var(--chrome)] mt-2">{formatPrice(c.valor)}</p>
                       </div>
                     </div>
                   ))}
                 </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="text-[var(--chrome)] text-2xl">❤️</span> Eventos e Destaques da Comunidade</h2>
              {!user.favoritosPublicacoes || user.favoritosPublicacoes.length === 0 ? (
                 <div className="perfil-empty !py-8">
                    <p>Nenhuma publicação favoritada ainda.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {user.favoritosPublicacoes.map(p => (
                      <div key={p._id} className="card flex flex-col items-start p-4 bg-[var(--bg-card)] border border-[var(--border)]">
                        <span className="badge badge-primary mb-2 text-xs">{p.tipo.toUpperCase()}</span>
                        {p.imagemUrl && <img src={p.imagemUrl} alt={p.titulo} className="w-full h-32 object-cover rounded mb-3" />}
                        <h4 className="font-bold text-lg mb-1">{p.titulo}</h4>
                        <span className="text-xs text-[var(--text-muted)] mb-3">{new Date(p.dataPublicacao).toLocaleDateString()}</span>
                        {p.linkDestino && <a href={p.linkDestino} target="_blank" rel="noreferrer" className="text-[var(--chrome)] hover:underline mt-auto text-sm font-semibold">Acessar →</a>}
                      </div>
                    ))}
                 </div>
              )}
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* --- Histórico --- */}
        <div className="mb-12">
          <div className="accent-line" />
          <h2 className="section-title">Vistos <span>Recentemente</span></h2>
          <p className="section-sub">Histórico das suas últimas visualizações no site</p>

          <div className="flex flex-col gap-12 mt-6">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="text-[var(--text-muted)] text-2xl">🕰️</span> Últimos Carros Visitados</h2>
              {!user.historicoCarros || user.historicoCarros.length === 0 ? (
                 <div className="perfil-empty !py-8">
                    <p>Seu histórico de veículos está vazio.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                   {user.historicoCarros.map(h => h.carro && (
                     <div key={h._id} className="card overflow-hidden">
                       <Link to={`/veiculo/${h.carro._id}`}>
                         <img src={h.carro.imagens?.[0]} alt={h.carro.modelo} className="w-full h-40 object-cover" />
                       </Link>
                       <div className="p-4 bg-[var(--bg-dark)] border-t border-[var(--border)]">
                         <h3 className="font-bold">{h.carro.marca} {h.carro.modelo}</h3>
                         <p className="font-bold text-[var(--chrome)] mt-1">{formatPrice(h.carro.valor)}</p>
                         <p className="text-xs text-[var(--text-muted)] mt-2">Visto em {new Date(h.viewedAt).toLocaleDateString()}</p>
                       </div>
                     </div>
                   ))}
                 </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="text-[var(--text-muted)] text-2xl">🕰️</span> Últimos Posts Lidos da Comunidade</h2>
              {!user.historicoPublicacoes || user.historicoPublicacoes.length === 0 ? (
                 <div className="perfil-empty !py-8">
                    <p>Seu histórico da comunidade está vazio.</p>
                 </div>
              ) : (
                 <div className="flex flex-col gap-4 opacity-80">
                    {user.historicoPublicacoes.map(h => h.publicacao && (
                      <div key={h._id} className="flex justify-between items-center bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded">
                        <div>
                          <p className="font-bold">{h.publicacao.titulo}</p>
                          <p className="text-xs text-[var(--text-muted)]">Visto em {new Date(h.viewedAt).toLocaleDateString()}</p>
                        </div>
                        {h.publicacao.linkDestino && <a href={h.publicacao.linkDestino} target="_blank" rel="noreferrer" className="text-[var(--chrome)] hover:underline text-sm font-semibold">Revisitar →</a>}
                      </div>
                    ))}
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Rol de Clientes ─────────────── */}
        {user.rolCliente?.fotoEntrega && (
          <>
            <div className="divider" />
            <div>
              <div className="accent-line" />
              <h2 className="section-title">Minha <span>Foto de Entrega</span></h2>
              <p className="section-sub">A foto do momento especial da sua entrega na G-Style</p>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 20 }}>
                <img
                  src={user.rolCliente.fotoEntrega}
                  alt="Entrega"
                  onClick={() => window.open(user.rolCliente.fotoEntrega, '_blank')}
                  style={{
                    width: '100%',
                    maxWidth: 360,
                    maxHeight: 320,
                    objectFit: 'contain',
                    borderRadius: 12,
                    border: '2px solid var(--chrome)',
                    background: '#0a0a0a',
                    cursor: 'zoom-in',
                    display: 'block'
                  }}
                />

                {user.rolCliente.depoimento && (
                  <p style={{ fontStyle: 'italic', color: 'var(--text-light)', maxWidth: 480 }}>
                    "{user.rolCliente.depoimento}"
                  </p>
                )}

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                  background: user.rolCliente?.visivel ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${user.rolCliente?.visivel ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                  borderRadius: 12
                }}>
                  <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                      {user.rolCliente?.visivel ? '✅ Sua foto está visível no Rol de Clientes!' : '🔒 Sua foto está privada'}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Você decide se quer aparecer na galeria pública do site.
                    </p>
                  </div>
                  <RolToggleBtn visivel={user.rolCliente?.visivel} />
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

function RolToggleBtn({ visivel }) {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const novo = !visivel;
      await api.patch('/auth/me/rol-foto', { visivel: novo, fotoPublica: novo });
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        marginLeft: 'auto', padding: '8px 18px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700,
        background: visivel ? 'var(--chrome)' : 'rgba(255,255,255,0.1)',
        color: visivel ? '#000' : 'var(--text-muted)',
        border: 'none', cursor: 'pointer', transition: 'all 0.2s'
      }}
    >
      {loading ? '...' : visivel ? 'Tornar Privado' : 'Tornar Público'}
    </button>
  );
}
