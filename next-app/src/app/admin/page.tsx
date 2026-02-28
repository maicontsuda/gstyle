'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext, api } from '@/contexts/AuthContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('clientes');
  
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // States genéricos migratórios (Para economizar escopo no Next)
  const [clientes, setClientes] = useState<any[]>([]);
  const [propostas, setPropostas] = useState<any[]>([]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users').catch(() => ({ data: [] })); 
      setClientes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropostas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/financiamento/propostas').catch(() => ({ data: [] }));
      setPropostas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'clientes') fetchClientes();
    if (activeTab === 'propostas') fetchPropostas();
  }, [activeTab]);

  if (authLoading || !user) return <div className="spinner" style={{marginTop: 100}}/>;

  if (user.tipo_usuario === 'cliente') {
    return (
      <div className="page-enter" style={{textAlign: 'center', marginTop: '10vh'}}>
        <h2>Acesso Negado</h2>
        <p>Apenas administradores podem acessar esta área.</p>
      </div>
    );
  }

  return (
    <div className="page-enter admin-dashboard">
      <div className="container section">
        <div className="accent-line" />
        <h1 className="section-title">Painel de <span>Controle G-Style</span></h1>
        <p className="section-sub">Gestão do ecossistema Next.js SaaS</p>

        {msg.text && <div className={`msg-alert ${msg.type}`}>{msg.text}</div>}

        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'clientes' ? 'active' : ''}`} onClick={() => setActiveTab('clientes')}>Gestão de Clientes</button>
          <button className={`tab-btn ${activeTab === 'propostas' ? 'active' : ''}`} onClick={() => setActiveTab('propostas')}>Propostas de Financiamento</button>
          <button className={`tab-btn ${activeTab === 'marketplace' ? 'active' : ''}`} onClick={() => setActiveTab('marketplace')}>Catálogo (Marketplace)</button>
        </div>

        <div className="admin-content card">
          {activeTab === 'clientes' && (
             <div className="slide-in">
               <h3>Clientes Cadastrados</h3>
               <p className="muted-text">Em breve refatorado para o padrão Next.js Server Actions.</p>
               <div className="grid">
                 {loading ? <div className="spinner" /> : clientes.map((c: any) => (
                    <div key={c._id} className="card p-4">
                      Objeto Cliente Base Migrado ({c.nome})
                    </div>
                 ))}
               </div>
             </div>
          )}

          {activeTab === 'propostas' && (
            <div className="slide-in">
              <h3>Propostas de Financiamento / Pré-Aprovação</h3>
              {loading ? <div className="spinner"/> : (
                 <div className="grid">
                   {propostas.map((p: any) => (
                      <div key={p._id} className="card p-4">
                        Proposta de: {p.nomeCompleto} ({p.tipoVisto})
                      </div>
                   ))}
                 </div>
              )}
            </div>
          )}
          
          {activeTab === 'marketplace' && (
            <div className="slide-in">
              <h3>Gestão de Catálogo SaaS</h3>
              <p className="muted-text">Aba em desenvolvimento... (Contrato Monolítico de Marketplace)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
