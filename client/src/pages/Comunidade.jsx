import { useEffect, useState } from 'react';
import api from '../api';
import './Comunidade.css';

export default function Comunidade() {
  const [publicacoes, setPublicacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // todos, evento, parceiro, social

  useEffect(() => {
    fetchPublicacoes(filtro);
  }, [filtro]);

  const fetchPublicacoes = async (tipo) => {
    setLoading(true);
    try {
      const url = tipo === 'todos' ? '/publicacoes' : `/publicacoes?tipo=${tipo}`;
      const res = await api.get(url);
      setPublicacoes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (tipo) => {
    if (tipo === 'evento') return 'badge-gold';
    if (tipo === 'parceiro') return 'badge-green';
    return 'badge-primary'; // social
  };

  const getLabel = (tipo) => {
    if (tipo === 'evento') return '📅 Evento Automotivo';
    if (tipo === 'parceiro') return '🤝 Parceiro G-Style';
    return '📱 Redes Sociais';
  };

  return (
    <div className="comunidade-page page-enter">
      <div className="container">
        
        <div className="comunidade-header">
          <div className="accent-line" />
          <h1 className="section-title">Nossa <span>Comunidade</span></h1>
          <p className="section-sub">Acompanhe eventos, parcerias exclusivas e o que a G-Style anda aprontando nas redes sociais.</p>
        </div>

        <div className="comunidade-filters">
          <button className={`btn-filter ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>Tudo</button>
          <button className={`btn-filter ${filtro === 'evento' ? 'active' : ''}`} onClick={() => setFiltro('evento')}>Eventos</button>
          <button className={`btn-filter ${filtro === 'parceiro' ? 'active' : ''}`} onClick={() => setFiltro('parceiro')}>Parceiros</button>
          <button className={`btn-filter ${filtro === 'social' ? 'active' : ''}`} onClick={() => setFiltro('social')}>Social/Mídia</button>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : publicacoes.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma publicação encontrada no momento.</p>
          </div>
        ) : (
          <div className="publicacoes-grid">
            {publicacoes.map(pub => (
              <div key={pub._id} className="pub-card card">
                
                {pub.imagemUrl && pub.tipo !== 'social' && (
                  <div className="pub-img">
                    <img src={pub.imagemUrl} alt={pub.titulo} />
                  </div>
                )}
                
                {pub.tipo === 'social' && pub.linkDestino && (
                  <div className="pub-social-placeholder">
                    <span>📱 Ver no Instagram/TikTok</span>
                  </div>
                )}

                <div className="pub-body">
                  <div className={`badge ${getBadgeClass(pub.tipo)} pub-badge`}>
                    {getLabel(pub.tipo)}
                  </div>
                  <h3 className="pub-title">{pub.titulo}</h3>
                  <span className="pub-data">{new Date(pub.dataPublicacao).toLocaleDateString('pt-BR')}</span>
                  {pub.descricao && <p className="pub-desc">{pub.descricao}</p>}
                  
                  {pub.linkDestino && (
                    <a href={pub.linkDestino} target="_blank" rel="noreferrer" className="btn btn-outline pub-btn">
                      {pub.tipo === 'social' ? 'Ver Postagem Original' : 'Acessar Link'}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
