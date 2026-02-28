import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <img src="/logo-gstyle.png" alt="Custom Shop G-Style" className="navbar-logo-img" />
          <span className="navbar-logo-text">
            Custom Shop <em>G-Style</em>
          </span>
        </Link>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/"        className={location.pathname === '/'        ? 'active' : ''}>Início</Link>
          <Link to="/zero-km" className={location.pathname.startsWith('/zero-km') ? 'active' : ''}>Carro 0KM</Link>
          <Link to="/estoque" className={location.pathname === '/estoque' ? 'active' : ''}>Estoque</Link>
          <Link to="/financeira" className={location.pathname === '/financeira' ? 'active' : ''}>Financeira</Link>
          <Link to="/seguro" className={location.pathname === '/seguro' ? 'active' : ''}>Seguro</Link>
          <Link to="/servicos" className={location.pathname === '/servicos' ? 'active' : ''}>Serviços</Link>
          <Link to="/contato" className={location.pathname === '/contato' ? 'active' : ''}>Contato</Link>
          <Link to="/site" className={location.pathname === '/site' ? 'active' : ''}>Site</Link>
        </nav>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user">
              <img src={user.thumbnail} alt={user.username} className="navbar-avatar" />
              <div className="navbar-user-menu">
                <Link to="/perfil">Meu Perfil</Link>
                {user && ['admin', 'dono'].includes(user.tipo_usuario) && (
                  <Link to="/admin/add-zerokm">Painel Admin (0KM)</Link>
                )}
                <button onClick={logout}>Sair</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>
              Entrar
            </Link>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
