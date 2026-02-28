'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import {
  Car, UserPlus, Users, Instagram, Briefcase, FileText, UploadCloud, MonitorCheck, Settings, KeySquare
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link href="/">
          <img src="/logo-gstyle.png" alt="G-Style Custom Shop" />
        </Link>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link href="/" className={pathname === '/' ? 'active' : ''}>
              <Car size={18} /><span>Home</span>
            </Link>
          </li>
          
          <li className="nav-title">COMPRAR JAPÃO 🇯🇵</li>
          <li>
            <Link href="/carros-zero" className={pathname === '/carros-zero' ? 'active' : ''}>
              <MonitorCheck size={18} /><span>Configurador Zero KM</span>
            </Link>
          </li>
          <li>
            <Link href="/seminovos" className={pathname === '/seminovos' ? 'active' : ''}>
              <KeySquare size={18} /><span>Marketplace Seminovos</span>
            </Link>
          </li>
          <li>
            <Link href="/financeira" className={pathname === '/financeira' ? 'active' : ''}>
              <FileText size={18} /><span>Financiamento JPN</span>
            </Link>
          </li>

          <li className="nav-title">CONTEÚDO</li>
          <li>
            <Link href="/comunidade" className={pathname === '/comunidade' ? 'active' : ''}>
              <Users size={18} /><span>Nossa Comunidade</span>
            </Link>
          </li>
          <li>
            <Link href="/rol-de-clientes" className={pathname === '/rol-de-clientes' ? 'active' : ''}>
              <Instagram size={18} /><span>Rol de Entregas</span>
            </Link>
          </li>

          {user && (user.tipo_usuario === 'admin' || user.tipo_usuario === 'dono' || user.tipo_usuario === 'funcionario') && (
            <>
              <li className="nav-title">GESTÃO DE NEGÓCIOS</li>
              <li>
                <Link href="/admin" className={pathname?.startsWith('/admin') ? 'active' : ''}>
                  <Briefcase size={18} /><span>Área Admin</span>
                </Link>
              </li>
            </>
          )}

          {user && (
            <>
              <li className="nav-title">MINHA CONTA</li>
              <li>
                <Link href="/perfil" className={pathname === '/perfil' ? 'active' : ''}>
                  <Settings size={18} /><span>Meu Perfil</span>
                </Link>
              </li>
              <li>
                <button onClick={logout} className="logout-btn">
                  <UploadCloud size={18} style={{ transform: 'rotate(180deg)' }} /><span>Sair</span>
                </button>
              </li>
            </>
          )}

          {!user && (
            <>
              <li className="nav-title">ACESSO</li>
              <li>
                <Link href="/login" className={pathname === '/login' ? 'active' : ''}>
                  <Users size={18} /><span>Entrar</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <p>&copy; 2026 G-Style Motors</p>
      </div>
    </aside>
  );
}
