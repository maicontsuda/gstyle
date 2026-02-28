import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { name: 'Início', path: '/' },
    { name: 'Carro 0KM', path: '/zero-km' },
    { name: 'Estoque', path: '/estoque' },
    { name: 'Financeira', path: '/financeira' },
    { name: 'Seguro', path: '/seguro' },
    { name: 'Serviços', path: '/servicos' },
    { name: 'Contato', path: '/contato' },
    { name: 'Site', path: '/site' },
  ];

  if (user && ['admin', 'dono', 'gerente', 'funcionario'].includes(user.tipo_usuario)) {
    links.push({ name: 'Admin', path: '/admin' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link to="/">
          <img src="/logo-gstyle.png" alt="G-Style Custom Shop" />
        </Link>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.name}
          </Link>
        ))}

        {user && ['admin', 'dono', 'funcionario'].includes(user.tipo_usuario) && (
          <div className="sidebar-admin-section">
            <h4 className="admin-menu-title">Área Admin</h4>
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>Dashboard</Link>
            <Link to="/admin/compras" className={`nav-link ${location.pathname === '/admin/compras' ? 'active' : ''}`}>Registrar Compra</Link>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <div className="sidebar-user">
            <span className="user-name">Olá, {(user.username || user.nome || 'Usuário').split(' ')[0]}</span>
            <Link to="/perfil" className="nav-link nav-small">Meu Painel</Link>
            <button onClick={logout} className="nav-link btn-logout">Sair</button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-login">
            Entrar
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
