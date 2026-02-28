'use client';

import { useState, useEffect } from 'react';
import { api } from '@/contexts/AuthContext';
import './RolDeClientes.css';

export default function RolDeClientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRol = async () => {
      try {
        const res = await api.get('/auth/users'); // Usando endpoint refeito
        const filtrados = res.data.filter((u: any) => u.mostrarRolPub === true && u.anexos && u.anexos.length > 0);
        setClientes(filtrados);
      } catch (err) {
        setClientes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRol();
  }, []);

  return (
    <div className="page-enter rol-page">
      <div className="container section">
        <h1 className="section-title">Rol de Entregas <span>G-Style</span></h1>
        <p className="section-sub">Nossa maior satisfação é o sorriso dos nossos clientes pelo Japão.</p>
        
        {loading ? <div className="spinner"></div> : (
          <div className="masonry-grid" style={{marginTop: '30px'}}>
             {clientes.map(c => (
                c.anexos.map((anexo: any, idx: number) => (
                   <div key={`${c._id}-${idx}`} className="card rol-card">
                      {anexo.tipo === 'foto' ? (
                        <img src={anexo.url} alt="Entrega de Viatura G-Style" className="rol-img" />
                      ) : (
                        <div className="rol-placeholder">
                          📸 Cliente da Casa
                        </div>
                      )}
                      <div className="rol-badge">🔑 G-Style Family</div>
                   </div>
                ))
             ))}
             {clientes.length === 0 && <p className="muted-text">Nenhuma entrega pública liberada no momento.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
