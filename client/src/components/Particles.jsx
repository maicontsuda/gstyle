import { useEffect, useState } from 'react';

export default function Particles({ theme }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Só renderiza partículas se o tema for sakura ou natal
    if (theme !== 'sakura' && theme !== 'natal') {
      setParticles([]);
      return;
    }

    const isSakura = theme === 'sakura';
    const isNatal = theme === 'natal';
    const count = isSakura ? 35 : isNatal ? 50 : 0; // Mais neve que pétalas
    
    const newParticles = Array.from({ length: count }).map((_, i) => {
      // Posição inicial (em vw)
      const startX = Math.random() * 100;
      // Direção final horizontal para a animação (em vw)
      const endX = startX + (Math.random() * 40 - 20); // Cai um pouco de lado
      // Rotação final para a pétala 
      const endRot = Math.random() * 720 + 'deg';
      
      return {
        id: i,
        // Neve tem tamanhos diferentes. Pétalas também mas num range menor
        size: isSakura ? 12 + Math.random() * 10 : 8 + Math.random() * 15, // px
        startX,
        endX,
        endRot,
        // Duração da queda: sakura cai mais de boa (10-18s) e neve (8-15s)
        duration: isSakura ? 10 + Math.random() * 8 : 8 + Math.random() * 7, // s
        // Atraso inicial para não caírem todas juntas
        delay: Math.random() * 10, // s
      };
    });

    setParticles(newParticles);
  }, [theme]);

  if (particles.length === 0) return null;

  const className = theme === 'sakura' ? 'sakura-petal' : 'snow-flake';

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998, overflow: 'hidden' }}>
      {particles.map(p => (
        <div
          key={p.id}
          className={className}
          style={{
            left: `${p.startX}vw`,
            width: theme === 'sakura' ? `${p.size}px` : 'auto',
            height: theme === 'sakura' ? `${p.size}px` : 'auto',
            fontSize: theme === 'natal' ? `${p.size}px` : undefined,
            animationDuration: `${p.duration}s`,
            animationDelay: `-${p.delay}s`,
            '--end-x': p.endX,
            '--end-rot': p.endRot,
          }}
        />
      ))}
    </div>
  );
}
