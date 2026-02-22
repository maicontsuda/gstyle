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

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          G<span>-</span>Style <em>Motors</em>
        </Link>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/"        className={location.pathname === '/'        ? 'active' : ''}>Início</Link>
          <Link to="/estoque" className={location.pathname === '/estoque' ? 'active' : ''}>Estoque</Link>
          <a href="/#servicos">Serviços</a>
          <a href="/#contato">Contato</a>
        </nav>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user">
              <img src={user.thumbnail} alt={user.username} className="navbar-avatar" />
              <div className="navbar-user-menu">
                <Link to="/perfil">Meu Perfil</Link>
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
