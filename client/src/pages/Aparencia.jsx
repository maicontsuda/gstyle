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
  },
  {
    id: 'theme-cyberpunk',
    name: 'Cyberpunk Neon',
    desc: 'Cores agressivas, estilo Tokyo Drift, asfalto escuro com neons.',
    icon: '🌃',
    colors: ['#0d1117', '#00f0ff', '#161b22']
  },
  {
    id: 'theme-titanium',
    name: 'Titanium Trust',
    desc: 'Visual corporativo, matte cinza fosco com elementos que lembram vidro e segurança.',
    icon: '🛡️',
    colors: ['#1e1e24', '#e2e8f0', '#2d2d35']
  },
  {
    id: 'theme-natal',
    name: 'Edição de Natal',
    desc: 'Espírito festivo! Verde escuro profundo com detalhes em vermelho e ouro brilhante.',
    icon: '🎄',
    colors: ['#0b1610', '#ffd56b', '#122a1c']
  },
  {
    id: 'theme-halloween',
    name: 'Halloween Assombrado',
    desc: 'Clima de travessuras com fundo negro absoluto, roxo e neon laranja da abóbora.',
    icon: '🎃',
    colors: ['#0d0812', '#ff6a00', '#1f102e']
  },
  {
    id: 'theme-ano-novo',
    name: 'Virada de Ano',
    desc: 'Elegância, prosperidade e muito Ouro com Branco para o Ano Novo.',
    icon: '🎆',
    colors: ['#0c0c0c', '#ffffff', '#1c1c1c']
  },
  {
    id: 'theme-black-friday',
    name: 'Black Friday',
    desc: 'Visual agressivo de liquidação, escuridão total com destaques em amarelo puro.',
    icon: '🔥',
    colors: ['#000000', '#ffe600', '#0a0a0a']
  },
  {
    id: 'theme-aniversario',
    name: 'Aniversário da Loja',
    desc: 'Clima de festa! Fundo roxo noturno com detalhes em Rosa Neon, tons de balão metálico e confetes.',
    icon: '🎈',
    colors: ['#12081c', '#ff49aa', '#241038']
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
