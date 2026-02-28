import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import CarCard from '../components/CarCard';
import './Home.css';

const SERVICOS_MOCKUP = [
  { icone: '🔧', nome: 'Revisão Completa',    descricao: 'Verificação total do veículo com laudo técnico detalhado.' },
  { icone: '💳', nome: 'Financiamento',        descricao: 'Simule e aprove seu financiamento com as melhores taxas do mercado.' },
  { icone: '🔄', nome: 'Troca / Avaliação',   descricao: 'Traga seu veículo e receba uma avaliação justa na hora.' },
  { icone: '🛡️', nome: 'Garantia Estendida', descricao: 'Proteção completa pós-compra para sua tranquilidade.' },
  { icone: '🚗', nome: 'Test Drive',           descricao: 'Agende um test drive e sinta a experiência antes de comprar.' },
  { icone: '📋', nome: 'Documentação',         descricao: 'Nossa equipe cuida de toda a burocracia para você.' },
];

export default function Home() {
  const [destaques, setDestaques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/carros?destaque=true&limit=6')
      .then(r => setDestaques(r.data.carros || []))
      .catch(() => setDestaques([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-badge badge badge-gold">✦ Premium Collection 2025</div>
          <h1 className="hero-title">
            Encontre o Carro<br />
            <span>dos seus Sonhos</span>
          </h1>
          <p className="hero-sub">
            Catálogo selecionado de veículos zero km e semi-novos com a garantia G-Style.
          </p>
          <div className="hero-actions">
            <Link to="/estoque" className="btn btn-primary">Ver Estoque</Link>
            <a href="#servicos" className="btn btn-ghost">Nossos Serviços</a>
          </div>

          <div className="hero-stats">
            <div className="hero-stat"><strong>500+</strong><span>Veículos no estoque</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>98%</strong><span>Clientes satisfeitos</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>10 anos</strong><span>De experiência</span></div>
          </div>
        </div>
      </section>

      {/* ── Destaques ── */}
      <section className="section">
        <div className="container">
          <div className="accent-line" />
          <h2 className="section-title">Veículos em <span>Destaque</span></h2>
          <p className="section-sub">Seleção especial curada pela nossa equipe</p>

          {loading ? (
            <div className="spinner" />
          ) : destaques.length > 0 ? (
            <div className="grid-3">
              {destaques.map(c => <CarCard key={c._id} carro={c} />)}
            </div>
          ) : (
            <div className="empty-state">
              <p>Nenhum veículo em destaque no momento.</p>
              <Link to="/estoque" className="btn btn-outline" style={{ marginTop: 16 }}>Ver todo o estoque</Link>
            </div>
          )}

          {destaques.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link to="/estoque" className="btn btn-outline">Ver Todo o Estoque →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Serviços ── */}
      <section className="section servicos-section" id="servicos">
        <div className="container">
          <div className="accent-line" />
          <h2 className="section-title">Nossos <span>Serviços</span></h2>
          <p className="section-sub">Tudo o que você precisa em um só lugar</p>
          <div className="grid-3">
            {SERVICOS_MOCKUP.map((s, i) => (
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
              <Link to="/estoque" className="btn btn-primary">Explorar Estoque</Link>
              <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="btn btn-ghost">
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
