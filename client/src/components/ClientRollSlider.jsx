import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/**
 * ClientRollSlider
 * Troca de foto a cada 20–30 segundos com transição suave.
 * Props:
 *   fotos: [{ url, titulo, descricao }]
 */
export default function ClientRollSlider({ fotos = [] }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef(null);

  const next = (current, total) => {
    setFade(false);
    setTimeout(() => {
      setIdx(i => (i + 1) % total);
      setFade(true);
    }, 500); // tempo do fade out
  };

  useEffect(() => {
    if (fotos.length <= 1) return;

    const schedule = () => {
      const delay = 20000 + Math.random() * 10000; // 20–30s
      timerRef.current = setTimeout(() => {
        next(idx, fotos.length);
        schedule();
      }, delay);
    };

    schedule();
    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fotos.length]);

  if (!fotos.length) return null;

  const foto = fotos[idx];

  return (
    <div className="client-roll-slider">
      <div
        className="client-roll-img"
        style={{
          backgroundImage: `url(${foto.url})`,
          opacity: fade ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
        onClick={() => window.open(foto.url, '_blank')}
        title="Clique para ver em tamanho real"
      >
        <div className="client-roll-overlay">
          {foto.titulo && <h3 className="client-roll-title">{foto.titulo}</h3>}
          {foto.descricao && <p className="client-roll-desc">{foto.descricao}</p>}
        </div>
      </div>

      {/* Dots */}
      {fotos.length > 1 && (
        <div className="client-roll-dots">
          {fotos.map((_, i) => (
            <button
              key={i}
              onClick={() => { clearTimeout(timerRef.current); setFade(false); setTimeout(() => { setIdx(i); setFade(true); }, 400); }}
              className={`client-roll-dot${i === idx ? ' active' : ''}`}
            />
          ))}
        </div>
      )}

      <Link to="/rol-clientes" className="client-roll-cta">Ver Galeria Completa →</Link>
    </div>
  );
}
