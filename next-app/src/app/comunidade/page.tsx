'use client';

import { useState, useEffect } from 'react';
import { api } from '@/contexts/AuthContext';
import './Comunidade.css';

export default function Comunidade() {
  const [pubs, setPubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPubs = async () => {
      try {
        // Rota migrada ainda será feita
        const res = await api.get('/publicacoes');
        setPubs(res.data);
      } catch (err) {
        setPubs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPubs();
  }, []);

  return (
    <div className="page-enter comunidade-page">
      <div className="container section">
        <h1 className="section-title">Comunidade <span>G-Style</span></h1>
        <p className="section-sub">Fique por dentro dos nossos parceiros, eventos e lifestyle de carros no Japão.</p>
        
        {loading ? <div className="spinner"></div> : (
          <div className="masonry-grid" style={{marginTop:'30px'}}>
             {pubs.map(p => (
                <div key={p._id} className="card p-4">Publicação Mock</div>
             ))}
             {pubs.length === 0 && <p className="muted-text">Nenhuma publicação por enquanto.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
