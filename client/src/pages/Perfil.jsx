import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Perfil.css';

function formatPrice(v) {
  return v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
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

        {/* Reservas */}
        <div>
          <div className="accent-line" />
          <h2 className="section-title">Meus <span>Test Drives</span></h2>
          <p className="section-sub">Histórico de agendamentos de test drive</p>

          {loadingReservas ? (
            <div className="spinner" />
          ) : reservas.length === 0 ? (
            <div className="perfil-empty">
              <p>🚗</p>
              <p>Você ainda não agendou nenhum test drive.</p>
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
                      <Link to={`/veiculo/${r.carro._id}`} className="reserva-carro-nome">
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
      </div>
    </div>
  );
}
