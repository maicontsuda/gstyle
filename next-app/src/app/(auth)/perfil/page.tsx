'use client';

import { useContext, useState, useEffect } from 'react';
import { AuthContext, api } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import './Perfil.css';

export default function Perfil() {
  const { user, setUser } = useContext(AuthContext);
  const router = useRouter();
  
  const [mostrarRolPub, setMostrarRolPub] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setMostrarRolPub(user.mostrarRolPub || false);
    }
  }, [user, router]);

  const handleToggleRol = async () => {
    const novoStatus = !mostrarRolPub;
    setMostrarRolPub(novoStatus);
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      await api.patch('/auth/me/rol', { mostrarRolPub: novoStatus });
      setUser((prev: any) => ({ ...prev, mostrarRolPub: novoStatus }));
      
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      localUser.mostrarRolPub = novoStatus;
      localStorage.setItem('user', JSON.stringify(localUser));

      setMsg({ type: 'success', text: 'Preferência de exibição pública atualizada!' });
    } catch (err) {
      setMostrarRolPub(!novoStatus);
      setMsg({ type: 'error', text: 'Erro ao atualizar preferência no servidor.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="spinner"></div>;

  return (
    <div className="page-enter">
      <div className="container section">
        <h1 className="section-title">Meu <span>Perfil</span></h1>
        
        {msg.text && <div className={`msg-alert ${msg.type}`}>{msg.text}</div>}

        <div className="perfil-layout">
          <div className="perfil-card">
            <h2>Dados Pessoais</h2>
            <div className="perfil-info">
              <p><strong>Nome:</strong> {user.nome}</p>
              <p><strong>E-mail:</strong> {user.email}</p>
              <p><strong>Tipo de Conta:</strong> <span className="badge">{user.tipo_usuario}</span></p>
            </div>
          </div>
          
          <div className="perfil-card">
            <h2>Privacidade</h2>
            <p className="muted-text" style={{marginBottom: '15px'}}>Controle como você aparece para o público na comunidade G-Style.</p>
            <div className="perfil-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label className="switch">
                <input type="checkbox" checked={mostrarRolPub} onChange={handleToggleRol} disabled={loading}/>
                <span className="slider round"></span>
              </label>
              <div>
                <p><strong>Mostrar meu perfil no Rol de Clientes público</strong></p>
                <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                  Ao ativar, as fotos oficiais da entrega do seu carro poderão aparecer para todos os visitantes do site.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
