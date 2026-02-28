import { useEffect, useState } from 'react';
import api from '../api';
import './RolDeClientes.css';

export default function RolDeClientes() {
  const [itensGaleria, setItensGaleria] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retorna apenas anexos (fotos/posts anônimos) de clientes que marcaram visivel = true
    api.get('/auth/rol-clientes')
      .then(res => setItensGaleria(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rol-page page-enter">
      <div className="container">
        
        <div className="rol-header">
          <div className="accent-line" />
          <h1 className="section-title">Rol de <span>Clientes</span></h1>
          <p className="section-sub">Acompanhe as postagens da G-Style e os registros de entregas dos nossos clientes.</p>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : itensGaleria.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma foto ou postagem de entrega disponível no momento.</p>
          </div>
        ) : (
          <div className="rol-grid">
            {itensGaleria.map(item => (
              <div key={item._id} className="rol-card">
                <div className="rol-img-wrap">
                  {item.tipo === 'post_social' ? (
                    <div className="social-post-bg">
                      <span className="social-icon">📱</span>
                      <span className="social-text">Postagem de Rede Social</span>
                    </div>
                  ) : (
                    <img src={item.url} alt={item.titulo} />
                  )}
                  <div className="rol-overlay">
                    <h3 className="rol-title">{item.titulo}</h3>
                    {item.descricao && <p className="rol-desc">{item.descricao}</p>}
                    
                    {item.tipo === 'post_social' && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-social-link">
                        Ver Postagem Original
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
