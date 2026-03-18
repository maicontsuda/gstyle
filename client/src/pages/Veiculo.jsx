import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Veiculo.css';

function formatPrice(v) {
  if (!v && v !== 0) return '—';
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(v);
}
function formatKm(km) { return km === 0 ? 'Zero km' : km?.toLocaleString('ja-JP') + ' km'; }

const MediaRender = ({ src, alt, isMain }) => {
  const isVideo = typeof src === 'string' && src.toLowerCase().match(/\.(mp4|webm|mov)(\?|$)/);
  if (isVideo) {
    return <video src={src} title={alt} autoPlay={isMain} controls={isMain} muted loop playsInline />;
  }
  return <img src={src} alt={alt} loading="lazy" />;
};

export default function Veiculo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [carro, setCarro] = useState(null);
  const [imgAtiva, setImgAtiva] = useState(0);
  const [loading, setLoading] = useState(true);

  // Compartilhamento
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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
      .then(r => {
        setCarro(r.data);
        if (user) {
          // Registra no histórico silenciosamente
          api.post(`/auth/historico/carros/${r.data._id}`).catch(() => {});
        }
      })
      .catch(() => navigate('/estoque'))
      .finally(() => setLoading(false));
  }, [id, navigate, user]);

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

  const isFavorite = Boolean(
    user && user.favoritosCarros && carro && user.favoritosCarros.some(c => 
      (typeof c === 'object' ? c._id : c) === carro._id
    )
  );

  const toggleFavorite = async () => {
    if (!user) {
      alert("Por favor, faça login para favoritar veículos.");
      return;
    }
    try {
      await api.post(`/auth/favoritos/carros/${carro._id}`);
      if (user.setUser) {
         api.get('/auth/me').then(r => user.setUser(r.data));
      } else {
         // Fallback manual refresh case if setUser is bound externally
         window.location.reload(); 
      }
    } catch (err) {
      console.error('Erro ao favoritar', err);
    }
  };

  const fecharShareMenu = () => {
    setShowShareMenu(false);
    setLinkCopied(false);
  };

  const getShareText = () => {
    const url = window.location.href;
    return `Confira este carro incrível na G-Style Motors!\n\n🚗 *${carro.marca} ${carro.modelo}*\n📅 Ano: ${carro.ano}\n🛣️ KM: ${formatKm(carro.km)}\n💰 Valor: ${formatPrice(carro.valor)}\n\nVeja no site:\n👉 ${url}\n\n📍 Nossa loja:\nhttps://maps.app.goo.gl/iKMNgFsQLBcRRgmH6`;
  };

  const shareWhatsApp = () => {
    const text = getShareText();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const whatsappUrl = isMobile 
      ? `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    fecharShareMenu();
  };

  const shareFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    fecharShareMenu();
  };

  const shareTwitter = () => {
    const text = getShareText();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    fecharShareMenu();
  };

  const copyToClipboard = () => {
    const text = getShareText();
    navigator.clipboard.writeText(text).then(() => {
      setLinkCopied(true);
      setTimeout(() => fecharShareMenu(), 2000);
    }).catch(err => {
      console.error('Erro ao copiar', err);
    });
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
          <Link to="/">Início</Link> / <Link to="/estoque">Semi Novo</Link> / <span>{carro.marca} {carro.modelo}</span>
        </nav>

        <div className="veiculo-grid">
          {/* Galeria */}
          <div className="veiculo-gallery">
            <div className="gallery-main">
              <MediaRender src={imagens[imgAtiva]} alt={`${carro.marca} ${carro.modelo}`} isMain={true} />
              {carro.destaque && <span className="gallery-badge">⭐ Destaque</span>}
            </div>
            {imagens.length > 1 && (
              <div className="gallery-thumbs">
                {imagens.map((img, i) => (
                  <button key={i} className={`thumb ${i === imgAtiva ? 'active' : ''}`} onClick={() => setImgAtiva(i)}>
                    <MediaRender src={img} alt={`Foto ${i+1}`} isMain={false} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="veiculo-info">
            <div className="flex justify-between items-start">
              <div>
                <div className="vinfo-tipo">{carro.tipo?.toUpperCase()}</div>
                <h1 className="vinfo-name">{carro.marca} {carro.modelo}</h1>
                <div className="vinfo-price">{formatPrice(carro.valor)}</div>
              </div>
              
              <button 
                onClick={toggleFavorite}
                className={`flex items-center justify-center p-3 rounded-full transition-all border ${isFavorite ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' : 'bg-[var(--bg-deep)] border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-gray-500'}`}
                title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFavorite ? "0" : "2"} className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>

            <div className="vinfo-specs">
              <div className="spec-item"><span className="spec-label">Ano</span><span className="spec-val">{carro.ano}</span></div>
              <div className="spec-item"><span className="spec-label">KM</span><span className="spec-val">{formatKm(carro.km)}</span></div>
              <div className="spec-item"><span className="spec-label">Cor</span><span className="spec-val">{carro.cor}</span></div>
              <div className="spec-item"><span className="spec-label">Câmbio</span><span className="spec-val">{carro.cambio}</span></div>
              <div className="spec-item"><span className="spec-label">Combustível</span><span className="spec-val">{carro.combustivel}</span></div>
              <div className="spec-item"><span className="spec-label">Status</span><span className={`spec-val ${carro.status === 'zero_km' ? 'text-green' : 'text-blue'}`}>{carro.status === 'zero_km' ? 'Zero KM' : 'Semi-novo'}</span></div>
              {carro.potencia && <div className="spec-item"><span className="spec-label">Potência</span><span className="spec-val">{carro.potencia}</span></div>}
            </div>

            {/* Novas Especificações Goo-net */}
            <div className="mt-6 border-t border-[var(--border)] pt-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="text-[var(--chrome)]">⚙️</span> Dados Técnicos Detalhados</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {carro.comprimento && <div className="bg-[var(--bg-card2)] p-3 rounded-lg border border-[var(--border)]"><div className="text-xs text-[var(--text-muted)] mb-1">Comprimento</div><div className="font-semibold text-white">{carro.comprimento} mm</div></div>}
                {carro.largura && <div className="bg-[var(--bg-card2)] p-3 rounded-lg border border-[var(--border)]"><div className="text-xs text-[var(--text-muted)] mb-1">Largura</div><div className="font-semibold text-white">{carro.largura} mm</div></div>}
                {carro.altura && <div className="bg-[var(--bg-card2)] p-3 rounded-lg border border-[var(--border)]"><div className="text-xs text-[var(--text-muted)] mb-1">Altura</div><div className="font-semibold text-white">{carro.altura} mm</div></div>}
                {carro.peso && <div className="bg-[var(--bg-card2)] p-3 rounded-lg border border-[var(--border)]"><div className="text-xs text-[var(--text-muted)] mb-1">Peso</div><div className="font-semibold text-white">{carro.peso} kg</div></div>}
                {carro.wltcConsumo && <div className="bg-[var(--bg-card2)] p-3 rounded-lg border border-[var(--border)]"><div className="text-xs text-[var(--text-muted)] mb-1">Consumo WLTC</div><div className="font-semibold text-white">{carro.wltcConsumo}</div></div>}
                {carro.jc08Consumo && <div className="bg-[var(--bg-card2)] p-3 rounded-lg border border-[var(--border)]"><div className="text-xs text-[var(--text-muted)] mb-1">Consumo JC08</div><div className="font-semibold text-white">{carro.jc08Consumo}</div></div>}
                {carro.chassiCodigo && <div className="bg-[var(--bg-card2)] p-3 rounded-lg border border-[var(--border)]"><div className="text-xs text-[var(--text-muted)] mb-1">Chassi</div><div className="font-semibold text-[var(--chrome-normal)]">{carro.chassiCodigo}</div></div>}
              </div>
            </div>

            {/* Avaliação do Veículo */}
            {(carro.avaliacaoExterna || carro.avaliacaoInterna) && (
              <div className="mt-6 border-t border-[var(--border)] pt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="text-yellow-400">⭐</span> Avaliação do Veículo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {carro.avaliacaoExterna && (
                    <div className="flex items-center justify-between bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                      <span className="text-sm font-semibold text-blue-100">Avaliação Externa</span>
                      <div className="flex text-yellow-400 text-lg">
                        {Array.from({length: 5}).map((_, i) => <span key={i} className={i < carro.avaliacaoExterna ? 'opacity-100' : 'opacity-30'}>★</span>)}
                      </div>
                    </div>
                  )}
                  {carro.avaliacaoInterna && (
                    <div className="flex items-center justify-between bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                      <span className="text-sm font-semibold text-purple-100">Avaliação Interna</span>
                      <div className="flex text-yellow-400 text-lg">
                        {Array.from({length: 5}).map((_, i) => <span key={i} className={i < carro.avaliacaoInterna ? 'opacity-100' : 'opacity-30'}>★</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Equipamentos */}
            {carro.equipamentos && carro.equipamentos.length > 0 && (
              <div className="mt-6 border-t border-[var(--border)] pt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="text-green-400">✨</span> Equipamentos e Opcionais</h3>
                <div className="flex flex-wrap gap-2">
                  {carro.equipamentos.map((eq, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--chrome)]/10 text-[var(--chrome-light)] border border-[var(--chrome)]/30">
                      <svg className="mr-1.5 h-3 w-3 text-[var(--chrome)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {carro.observacoes && (
              <div className="mt-6 border-t border-yellow-500/30 pt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-500">📋 Observações do Veículo</h3>
                <div className="bg-yellow-500/5 p-4 rounded-xl text-[var(--text-muted)] text-sm leading-relaxed border border-yellow-500/20 whitespace-pre-line">
                  {carro.observacoes}
                </div>
              </div>
            )}

            {carro.descricao && (
              <div className="vinfo-desc mt-6 border-t border-[var(--border)] pt-6">
                <h3 className="text-xl font-bold mb-4">Descrição Geral</h3>
                <p className="whitespace-pre-line text-[var(--text-muted)]">{carro.descricao}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                💬 Falar com consultor
              </a>
              <button type="button" onClick={() => setShowShareMenu(true)} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}>
                📤 Compartilhar
              </button>
            </div>

            {/* Redes Sociais */}
            {(carro.linkVideo || carro.linkInstagram) && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {carro.linkVideo && (
                  <a href={carro.linkVideo} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', borderColor: '#ef4444', color: '#ef4444' }}>
                    ▶️ Ver Vídeo
                  </a>
                )}
                {carro.linkInstagram && (
                  <a href={carro.linkInstagram} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', borderColor: '#d946ef', color: '#d946ef' }}>
                    📸 Instagram
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Simulação de Financiamento */}
        <div className="veiculo-bottom-grid">
          <div className="financiamento-card card">
            <h2>💳 Simular Financiamento</h2>
            <p className="fin-sub">Taxas japonesas (APR ~4.9% a.a.) — Tabela Price</p>

            <div className="fin-fields">
              <div>
                <label>Entrada (¥)</label>
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
                <div className="fin-row highlight"><span>Parcela mensal</span><strong>{formatPrice(simResult.parcelaMensal)}</strong></div>
                <div className="fin-row"><span>Total a pagar</span><strong>{formatPrice(simResult.totalPago)}</strong></div>
                <div className="fin-row"><span>Total de juros</span><strong>{formatPrice(simResult.totalJuros)}</strong></div>
                <p className="fin-obs">*Simulação informativa. Taxa APR: {simResult.taxaAnual}% a.a. ({simResult.taxaMensalUtilizada}% a.m.)</p>
              </div>
            )}
          </div>

          {/* Agendamento de Test Drive */}
          <div className="testdrive-card card">
            <h2>📅 Agendar sua Visita</h2>
            <p className="fin-sub">Venha conhecer este veículo pessoalmente em nossa loja</p>

            {reservaOk ? (
              <div className="reserva-ok">
                <p>✅ Visita agendada com sucesso!</p>
                <p className="fin-obs">Entraremos em contato para confirmar o horário.</p>
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
                  {reservaLoading ? 'Agendando...' : user ? 'Confirmar visita' : 'Entrar para agendar'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {showShareMenu && (
        <div 
          className="share-modal-overlay" 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={fecharShareMenu}
        >
          <div 
            className="share-modal-content" 
            style={{ backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--chrome-light)', margin: 0 }}>Compartilhar</h3>
              <button onClick={fecharShareMenu} style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
            </div>
            
            <button onClick={shareWhatsApp} className="btn" style={{ backgroundColor: '#25D366', color: 'white', justifyContent: 'start', padding: '12px 16px', border: 'none' }}>
              <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>💬</span> WhatsApp
            </button>

            <button onClick={shareFacebook} className="btn" style={{ backgroundColor: '#1877F2', color: 'white', justifyContent: 'start', padding: '12px 16px', border: 'none' }}>
              <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>📘</span> Facebook
            </button>
            
            <button onClick={shareTwitter} className="btn" style={{ backgroundColor: '#1DA1F2', color: 'white', justifyContent: 'start', padding: '12px 16px', border: 'none' }}>
              <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🐦</span> Twitter / X
            </button>

            <button onClick={copyToClipboard} className="btn btn-outline" style={{ justifyContent: 'start', padding: '12px 16px', color: linkCopied ? '#10b981' : 'var(--text-muted)' }}>
              <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>{linkCopied ? '✅' : '🔗'}</span> 
              {linkCopied ? 'Link Copiado!' : 'Copiar Link (Instagram/Outros)'}
            </button>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px', lineHeight: 1.4 }}>
              Para o Instagram, copie o link e cole na sua bio ou nos stories!
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
