import { useTheme } from '../context/ThemeContext';
import './Aparencia.css';

const THEMES = [
  {
    id: 'theme-original',
    name: 'Original',
    desc: 'O design atual de linha da G-Style, equilibrado em Prata Cromado e Fundo Escuro.',
    icon: '✨',
    colors: ['#080808', '#c8cdd4', '#181818']
  },
  {
    id: 'theme-dark-chrome',
    name: 'Dark Chrome',
    desc: 'Minimalista, fundo preto absoluto, máximo contraste nas fotos dos veículos.',
    icon: '🖤',
    colors: ['#000000', '#ffffff', '#111111']
  }
];

export default function Aparencia() {
  const { theme, changeTheme } = useTheme();

  return (
    <div className="aparencia-page page-enter">
      <div className="container">
        <div className="accent-line" style={{ marginTop: 120 }} />
        <h1 className="section-title">
          Estilo do <span>Site</span>
        </h1>
        <p className="section-sub">
          Escolha o visual que melhor combina com a vibração da sua Custom Shop. Esta preferência é salva automaticamente.
        </p>

        <div className="themes-grid">
          {THEMES.map((t) => (
            <div 
              key={t.id} 
              className={`theme-card ${theme === t.id ? 'active' : ''}`}
              onClick={() => changeTheme(t.id)}
            >
              <div className="theme-preview" style={{ background: t.colors[0] }}>
                <div className="preview-nav" style={{ borderBottom: `1px solid ${t.colors[2]}` }}>
                  <div className="dot" style={{ background: t.colors[1] }} />
                  <div className="line" style={{ background: t.colors[2] }} />
                </div>
                <div className="preview-body">
                  <div className="preview-card" style={{ background: t.colors[2] }}>
                    <div className="preview-img" style={{ background: '#333' }} />
                    <div className="preview-text" style={{ background: t.colors[1] }} />
                  </div>
                </div>
              </div>

              <div className="theme-info">
                <div className="theme-header">
                  <span className="theme-icon">{t.icon}</span>
                  <h3>{t.name}</h3>
                </div>
                <p>{t.desc}</p>
              </div>

              {theme === t.id && (
                <div className="theme-active-badge">
                  ✓ Tema Atual
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
