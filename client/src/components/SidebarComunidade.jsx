import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ja-JP');
}

export default function SidebarComunidade({ limit = 4 }) {
  const [postsAleatorios, setPostsAleatorios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca posts aleatórios (query random=true)
    api.get(`/publicacoes?random=true&limit=${limit}`)
      .then(res => setPostsAleatorios(res.data))
      .catch(err => console.error('Erro ao buscar publicações aleatórias para o sidebar:', err))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 block static lg:sticky lg:top-28 mb-8 lg:mb-0">
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (postsAleatorios.length === 0) return null;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 block static lg:sticky lg:top-28 shadow-xl mb-8 lg:mb-0">
      <h3 className="text-sm font-bold text-[var(--chrome-light)] mb-4 uppercase tracking-wider flex items-center gap-2">
        <span>🌟</span> Destaques G-Style
      </h3>
      <div className="space-y-4">
        {postsAleatorios.map((post) => (
          <div key={post._id} className="group flex flex-col gap-2 pb-4 border-b border-white/5 last:border-0 last:pb-0">
            {post.imagemUrl && (
              <a href={post.linkDestino || '#'} target={post.linkDestino ? "_blank" : "_self"} rel="noreferrer" className="block overflow-hidden rounded-xl">
                <img 
                  src={post.imagemUrl} 
                  alt={post.titulo} 
                  className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              </a>
            )}
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block ${
                post.tipo === 'evento' ? 'bg-[var(--chrome)] text-black' :
                post.tipo === 'parceiro' ? 'bg-white/10 text-[var(--chrome-light)]' :
                'bg-blue-500/20 text-blue-300'
              }`}>
                {post.tipo}
              </span>
              <a href={post.linkDestino || '#'} target={post.linkDestino ? "_blank" : "_self"} rel="noreferrer" className="block">
                <h4 className="text-white text-sm font-semibold leading-tight group-hover:text-[var(--chrome-light)] transition-colors line-clamp-2">
                  {post.titulo}
                </h4>
              </a>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                {formatDate(post.dataPublicacao)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-[var(--border)]">
        <Link to="/comunidade" className="text-xs font-bold text-[var(--chrome-light)] hover:text-white transition-colors block text-center">
          Ver Tudo na Comunidade →
        </Link>
      </div>
    </div>
  );
}
