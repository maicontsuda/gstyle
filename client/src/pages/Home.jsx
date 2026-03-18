import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import CarCard from '../components/CarCard';
import ClientRollSlider from '../components/ClientRollSlider';
import './Home.css';

// Retorna N itens aleatórios de um array
function sortAleat(arr, n) {
  if (!arr?.length) return [];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const SERVICOS = [
  { icone: '🔧', nome: 'Revisão Completa',    descricao: 'Verificação total do veículo com laudo técnico.' },
  { icone: '💳', nome: 'Financiamento',        descricao: 'Simule e aprove seu financiamento com as melhores taxas japonesas.' },
  { icone: '🔄', nome: 'Troca / Avaliação',   descricao: 'Traga seu veículo e receba avaliação justa na hora.' },
  { icone: '🛡️', nome: 'Garantia Estendida', descricao: 'Proteção completa pós-compra para sua tranquilidade.' },
  { icone: '📅', nome: 'Agendar Visita',       descricao: 'Marque sua visita e conheça nossos veículos pessoalmente.' },
  { icone: '📋', nome: 'Documentação',         descricao: 'Nossa equipe cuida de toda a burocracia para você.' },
];

export default function Home() {
  const [zerokm, setZerokm]     = useState([]);
  const [seminovos, setSeminovos] = useState([]);
  const [rolFotos, setRolFotos]  = useState([]);
  const [posts, setPosts]        = useState([]);
  const [totalVeiculos, setTotalVeiculos] = useState('...');
  const [loading, setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/carros?status=zero_km&limit=20'),
      api.get('/carros?status=semi_novo&limit=20'),
      api.get('/carros?limit=1'),
      api.get('/auth/rol-clientes').catch(() => ({ data: [] })),
      api.get('/publicacoes').catch(() => ({ data: [] })),
    ]).then(([rZero, rSemi, rTotal, rRol, rPosts]) => {
      setZerokm(sortAleat(rZero.data.carros, 3));
      setSeminovos(sortAleat(rSemi.data.carros, 3));
      setTotalVeiculos((rTotal.data.total || 0));
      setRolFotos(rRol.data.filter(f => f.url) || []);
      setPosts(sortAleat(rPosts.data, 4));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-badge badge badge-gold">✦ Custom Shop G-Style</div>
          <h1 className="hero-title">
            Encontre o carro<br />
            <span>Dos seus sonhos</span>
          </h1>
          <p className="hero-sub">
            Catálogo selecionado de veículos zero km e semi-novos com a garantia G-Style.
          </p>
          <div className="hero-actions">
            <Link to="/estoque" className="btn btn-primary">Ver Semi Novos</Link>
            <a href="#servicos" className="btn btn-ghost">Nossos Serviços</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>{totalVeiculos}</strong><span>Veículos no estoque</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>98%</strong><span>Clientes satisfeitos</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>10 anos</strong><span>De experiência</span></div>
          </div>
        </div>
      </section>

      {/* ── 3 Carros 0KM Aleatórios ── */}
      <section className="section">
        <div className="container">
          <div className="accent-line" />
          <h2 className="section-title">Carros <span>Zero KM</span></h2>
          <p className="section-sub">Modelos novos direto do Japão — seleção aleatória do dia</p>
          {loading ? <div className="spinner" /> : zerokm.length > 0 ? (
            <div className="grid-3">
              {zerokm.map(c => <CarCard key={c._id} carro={c} />)}
            </div>
          ) : (
            <div className="empty-state"><p>Nenhum carro zero km no momento.</p></div>
          )}
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link to="/zero-km" className="btn btn-outline">Ver Catálogo 0KM →</Link>
          </div>
        </div>
      </section>

      {/* ── 3 Seminovos Aleatórios ── */}
      <section className="section" style={{ background: 'var(--bg-dark)' }}>
        <div className="container">
          <div className="accent-line" />
          <h2 className="section-title">Semi<span>novos</span></h2>
          <p className="section-sub">Veículos seminovos selecionados — estoque atualizado diariamente</p>
          {loading ? <div className="spinner" /> : seminovos.length > 0 ? (
            <div className="grid-3">
              {seminovos.map(c => <CarCard key={c._id} carro={c} />)}
            </div>
          ) : (
            <div className="empty-state"><p>Nenhum seminovo disponível no momento.</p></div>
          )}
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link to="/estoque?status=semi_novo" className="btn btn-outline">Ver Todos os Seminovos →</Link>
          </div>
        </div>
      </section>

      {/* ── Rol de Clientes (Slideshow) ── */}
      <section className="section rol-section">
        <div className="container">
          <div className="accent-line" />
          <h2 className="section-title">Nossos <span>Clientes</span></h2>
          <p className="section-sub">Momentos especiais das entregas G-Style</p>
          {rolFotos.length > 0 ? (
            <ClientRollSlider fotos={rolFotos} />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📸</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                Em breve, galeria de fotos de entregas dos nossos clientes!
              </p>
              <Link to="/rol-clientes" className="btn btn-outline" style={{ fontSize: '0.88rem' }}>
                Ver Galeria de Clientes →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Posts da Rede Social ── */}
      {posts.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="accent-line" />
            <h2 className="section-title">Nossa <span>Comunidade</span></h2>
            <p className="section-sub">Novidades e destaques das redes sociais</p>
            <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {posts.map(p => (
                <div key={p._id} className="card post-card">
                  {p.imagemUrl && (
                    <div className="post-card-img">
                      <img src={p.imagemUrl} alt={p.titulo} loading="lazy" />
                    </div>
                  )}
                  <div className="post-card-body">
                    <span className="post-card-tipo">{p.tipo}</span>
                    <h3 className="post-card-titulo">{p.titulo}</h3>
                    {p.descricao && <p className="post-card-desc">{p.descricao.substring(0, 100)}{p.descricao.length > 100 ? '...' : ''}</p>}
                    {p.linkDestino && (
                      <a href={p.linkDestino} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ marginTop: 12, fontSize: '0.82rem' }}>
                        Ver Post →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link to="/comunidade" className="btn btn-outline">Ver Comunidade →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Serviços ── */}
      <section className="section servicos-section" id="servicos">
        <div className="container">
          <div className="accent-line" />
          <h2 className="section-title">Nossos <span>Serviços</span></h2>
          <p className="section-sub">Tudo o que você precisa em um só lugar</p>
          <div className="grid-3">
            {SERVICOS.map((s, i) => (
              <div key={i} className="card servico-card">
                <div className="servico-icon">{s.icone}</div>
                <h3 className="servico-nome">{s.nome}</h3>
                <p className="servico-desc">{s.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Pronto para <span>encontrar seu carro?</span></h2>
            <p>Entre em contato ou venha nos visitar. Nossa equipe está pronta para atendê-lo.</p>
            <div className="cta-actions">
              <Link to="/estoque" className="btn btn-primary">Explorar Semi Novos</Link>
              <a href="https://wa.me/818097355956" target="_blank" rel="noreferrer" className="btn btn-ghost">
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
