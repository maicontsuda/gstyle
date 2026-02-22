import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Veiculo.css';

function formatPrice(v) {
  return v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}
function formatKm(km) { return km === 0 ? 'Zero km' : km?.toLocaleString('pt-BR') + ' km'; }

export default function Veiculo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [carro, setCarro] = useState(null);
  const [imgAtiva, setImgAtiva] = useState(0);
  const [loading, setLoading] = useState(true);

  // Financiamento
  const [entrada, setEntrada] = useState('');
  const [prazo, setPrazo] = useState(48);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // Reserva
  const [dataReserva, setDataReserva] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [reservaOk, setReservaOk] = useState(false);
  const [reservaLoading, setReservaLoading] = useState(false);
  const [reservaErro, setReservaErro] = useState('');

  useEffect(() => {
    api.get(`/carros/${id}`)
      .then(r => setCarro(r.data))
      .catch(() => navigate('/estoque'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const simular = async () => {
    if (!carro) return;
    setSimLoading(true);
    try {
      const r = await api.post('/financiamento/simular', {
        valorVeiculo: carro.valor,
        entrada: Number(entrada) || 0,
        prazo: Number(prazo),
      });
      setSimResult(r.data);
    } catch { setSimResult(null); }
    finally { setSimLoading(false); }
  };

  const agendarTestDrive = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setReservaLoading(true);
    setReservaErro('');
    try {
      await api.post('/reservas', { carro: carro._id, data: dataReserva, mensagem });
      setReservaOk(true);
    } catch (err) {
      setReservaErro(err.response?.data?.error || 'Erro ao agendar.');
    }
    finally { setReservaLoading(false); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  if (!carro)  return null;

  const imagens = carro.imagens?.length > 0
    ? carro.imagens
    : ['https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=900&q=80'];

  return (
    <div className="veiculo-page page-enter">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Início</Link> / <Link to="/estoque">Estoque</Link> / <span>{carro.marca} {carro.modelo}</span>
        </nav>

        <div className="veiculo-grid">
          {/* Galeria */}
          <div className="veiculo-gallery">
            <div className="gallery-main">
              <img src={imagens[imgAtiva]} alt={`${carro.marca} ${carro.modelo}`} />
              {carro.destaque && <span className="gallery-badge">⭐ Destaque</span>}
            </div>
            {imagens.length > 1 && (
              <div className="gallery-thumbs">
                {imagens.map((img, i) => (
                  <button key={i} className={`thumb ${i === imgAtiva ? 'active' : ''}`} onClick={() => setImgAtiva(i)}>
                    <img src={img} alt={`Foto ${i+1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="veiculo-info">
            <div className="vinfo-tipo">{carro.tipo?.toUpperCase()}</div>
            <h1 className="vinfo-name">{carro.marca} {carro.modelo}</h1>
            <div className="vinfo-price">{formatPrice(carro.valor)}</div>

            <div className="vinfo-specs">
              <div className="spec-item"><span className="spec-label">Ano</span><span className="spec-val">{carro.ano}</span></div>
              <div className="spec-item"><span className="spec-label">KM</span><span className="spec-val">{formatKm(carro.km)}</span></div>
              <div className="spec-item"><span className="spec-label">Cor</span><span className="spec-val">{carro.cor}</span></div>
              <div className="spec-item"><span className="spec-label">Câmbio</span><span className="spec-val">{carro.cambio}</span></div>
              <div className="spec-item"><span className="spec-label">Combustível</span><span className="spec-val">{carro.combustivel}</span></div>
              <div className="spec-item"><span className="spec-label">Status</span><span className={`spec-val ${carro.status === 'zero_km' ? 'text-green' : 'text-blue'}`}>{carro.status === 'zero_km' ? 'Zero KM' : 'Semi-novo'}</span></div>
              {carro.potencia && <div className="spec-item"><span className="spec-label">Potência</span><span className="spec-val">{carro.potencia}</span></div>}
            </div>

            {carro.descricao && (
              <div className="vinfo-desc">
                <h3>Descrição</h3>
                <p>{carro.descricao}</p>
              </div>
            )}

            <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              💬 Falar com consultor
            </a>
          </div>
        </div>

        {/* Simulação de Financiamento */}
        <div className="veiculo-bottom-grid">
          <div className="financiamento-card card">
            <h2>💳 Simular Financiamento</h2>
            <p className="fin-sub">Calcule as parcelas de forma rápida e transparente</p>

            <div className="fin-fields">
              <div>
                <label>Entrada (R$)</label>
                <input type="number" placeholder="0" value={entrada} onChange={e => setEntrada(e.target.value)} />
              </div>
              <div>
                <label>Prazo (meses)</label>
                <select value={prazo} onChange={e => setPrazo(e.target.value)}>
                  {[12, 24, 36, 48, 60, 72].map(p => <option key={p} value={p}>{p}x</option>)}
                </select>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={simular} disabled={simLoading}>
              {simLoading ? 'Calculando...' : 'Simular agora'}
            </button>

            {simResult && (
              <div className="fin-result">
                <div className="fin-row"><span>Valor financiado</span><strong>{formatPrice(simResult.valorFinanciado)}</strong></div>
                <div className="fin-row highlight"><span>Parcela mensal</span><strong>{formatPrice(simResult.parcela)}</strong></div>
                <div className="fin-row"><span>Total a pagar</span><strong>{formatPrice(simResult.totalPago)}</strong></div>
                <div className="fin-row"><span>Total de juros</span><strong>{formatPrice(simResult.totalJuros)}</strong></div>
                <p className="fin-obs">*Simulação informativa. Taxa: {simResult.taxaMensal}% a.m.</p>
              </div>
            )}
          </div>

          {/* Agendamento de Test Drive */}
          <div className="testdrive-card card">
            <h2>🚗 Agendar Test Drive</h2>
            <p className="fin-sub">Venha experimentar este veículo pessoalmente</p>

            {reservaOk ? (
              <div className="reserva-ok">
                <p>✅ Test drive agendado com sucesso!</p>
                <p className="fin-obs">Entraremos em contato para confirmar.</p>
              </div>
            ) : (
              <form onSubmit={agendarTestDrive} className="fin-fields" style={{ flexDirection: 'column' }}>
                <div>
                  <label>Data preferida</label>
                  <input
                    type="date"
                    required
                    value={dataReserva}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setDataReserva(e.target.value)}
                  />
                </div>
                <div>
                  <label>Mensagem (opcional)</label>
                  <textarea
                    rows={3}
                    placeholder="Horário de preferência, dúvidas..."
                    value={mensagem}
                    onChange={e => setMensagem(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                {reservaErro && <p style={{ color: '#f87171', fontSize: '0.85rem' }}>{reservaErro}</p>}
                <button type="submit" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} disabled={reservaLoading}>
                  {reservaLoading ? 'Agendando...' : user ? 'Confirmar agendamento' : 'Entrar para agendar'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
