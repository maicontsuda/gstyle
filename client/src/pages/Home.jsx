import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import CarCard from '../components/CarCard';
import './Home.css';

export default function Home() {
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca os carros mais recentes / disponíveis
    api.get('/carros?limit=6')
      .then(r => setCarros(r.data.carros || []))
      .catch(() => setCarros([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter home-container">
      
      {/* ── Carros Disponíveis ── */}
      <section className="section home-feed">
        <div className="container">
          <div className="home-header">
            <h1 className="section-title">Carros <span>Disponíveis</span></h1>
            <p className="section-sub">O estoque mais exclusivo da G-Style Custom Shop.</p>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : carros.length > 0 ? (
            <div className="grid-3">
              {carros.map(c => <CarCard key={c._id} carro={c} />)}
            </div>
          ) : (
            <div className="empty-state">
              <p>Nenhum veículo disponível no momento.</p>
            </div>
          )}

          {carros.length > 0 && (
            <div className="view-more">
              <Link to="/estoque" className="btn btn-primary">Ver Catálogo Completo</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Redes Sociais ── */}
      <section className="section social-section">
        <div className="container">
          <div className="accent-line" />
          <h2 className="section-title">Siga a <span>G-Style</span></h2>
          <p className="section-sub">Acompanhe nossas novidades e os projetos Custom Shop nas redes sociais.</p>

          <div className="social-grid">
            {/* Bloco Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-card instagram-card">
              <div className="social-icon">📸</div>
              <h3>Instagram</h3>
              <p>@gstylecustomshop</p>
              <span className="social-link-btn">Acessar Perfil ➔</span>
            </a>

            {/* Bloco Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-card facebook-card">
              <div className="social-icon">📘</div>
              <h3>Facebook</h3>
              <p>G-Style Motors & Custom</p>
              <span className="social-link-btn">Acessar Página ➔</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
