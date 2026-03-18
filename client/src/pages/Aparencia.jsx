import { useTheme } from '../context/ThemeContext';
import './Aparencia.css';

const THEMES = [
  { id: 'theme-original', name: 'Original', desc: 'Prata Cromado e Fundo Escuro.', icon: '✨', colors: ['#080808', '#c8cdd4', '#181818'] },
  { id: 'theme-dark-chrome', name: 'Dark Chrome', desc: 'Minimalista, fundo preto absoluto.', icon: '🖤', colors: ['#000000', '#ffffff', '#111111'] },
  { id: 'theme-natal', name: 'Natal', desc: 'Clima Natalino com flocos de neve.', icon: '🎄', colors: ['#0b1610', '#a21e21', '#122a1c'] },
  { id: 'theme-sakura', name: 'Sakura', desc: 'Petalas caindo, tons de rosa.', icon: '🌸', colors: ['#170b12', '#ff8ebf', '#2b1824'] },
  { id: 'theme-ano-novo', name: 'Ano Novo', desc: 'Vibes brancas e fogos de artifício.', icon: '🎆', colors: ['#0c0c0c', '#ffd700', '#1c1c1c'] },
  { id: 'theme-halloween', name: 'Halloween', desc: 'Laranja escuro e abóboras.', icon: '🎃', colors: ['#050200', '#ff6a00', '#160a00'] },
  { id: 'theme-namorados', name: 'Namorados', desc: 'Corações mágicos no mouse.', icon: '💖', colors: ['#1a050b', '#ff3366', '#32111d'] },
  { id: 'theme-pascoa', name: 'Páscoa', desc: 'Ovo de páscoa e coelhinho do mouse.', icon: '🐰', colors: ['#0a141a', '#89cff0', '#12232e'] },
  { id: 'theme-aniversario', name: 'Aniversário', desc: 'Festa com presentes e balões.', icon: '🎁', colors: ['#12081c', '#00e5ff', '#241038'] }
];

export default function Aparencia() {
  const { theme, baseTheme, themeMode, randomInterval, updateSettings } = useTheme();

  return (
    <div className="aparencia-page page-enter">
      <div className="container">
        <div className="accent-line" style={{ marginTop: 120 }} />
        <h1 className="section-title">Estilo do <span>Site</span></h1>
        
        {/* --- Theme Mode Selector --- */}
        <div className="theme-modes-section" style={{ marginBottom: 40, padding: 20, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: 15, fontSize: '1.2rem' }}>Modo de Exibição</h2>
          <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
            <button 
              className={`btn ${themeMode === 'fixed' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => updateSettings('fixed', baseTheme, randomInterval)}
            >
              📌 Fixo (Apenas o tema padrão)
            </button>
            <button 
              className={`btn ${themeMode === 'seasonal' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => updateSettings('seasonal', baseTheme, randomInterval)}
            >
              📅 Data Comemorativa (Automático)
            </button>
            <button 
              className={`btn ${themeMode === 'random' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => updateSettings('random', baseTheme, randomInterval)}
            >
              🎲 Aleatório (Troca sozinho)
            </button>
          </div>

          {themeMode === 'random' && (
            <div style={{ marginTop: 20 }}>
              <label>⏱️ Intervalo de troca:</label>
              <select 
                value={randomInterval} 
                onChange={(e) => updateSettings('random', baseTheme, Number(e.target.value))}
                style={{ width: 200, display: 'block', marginTop: 8 }}
              >
                <option value={10000}>Teste Rápido (10s)</option>
                <option value={60000}>1 Minuto</option>
                <option value={300000}>5 Minutos</option>
                <option value={3600000}>1 Hora</option>
                <option value={86400000}>1 Dia</option>
              </select>
            </div>
          )}
          
          {themeMode === 'seasonal' && (
            <p style={{ marginTop: 15, fontSize:'0.85rem', color: 'var(--text-muted)' }}>
              No modo "Data Comemorativa", o sistema identificará datas como Natal, Ano Novo, Páscoa, Halloween, etc., e aplicará o visual temporariamente. Após a data, ele volta para o tema que você selecionar abaixo como Padrão.
            </p>
          )}
        </div>

        <h2 style={{ marginBottom: 20, fontSize: '1.2rem' }}>Escolha o Tema Padrão</h2>
        <div className="themes-grid">
          {THEMES.map((t) => {
             // If random mode, show which one is currently active by pseudo-chance.
             const isBase = baseTheme === t.id;
             const isActual = theme === t.id;
             return (
              <div 
                key={t.id} 
                className={`theme-card ${isBase ? 'active' : ''} ${isActual && themeMode !== 'fixed' ? 'actually-rendered' : ''}`}
                onClick={() => updateSettings(themeMode, t.id, randomInterval)}
                style={{ border: isActual && themeMode !== 'fixed' ? '2px solid var(--chrome)' : '' }}
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

                {isBase && (
                  <div className="theme-active-badge">
                    ✓ {themeMode === 'fixed' ? 'Ativo' : 'Base/Padrão'}
                  </div>
                )}
                {isActual && !isBase && (
                  <div className="theme-active-badge" style={{background:'var(--chrome-dark)', top: 40}}>
                    ✨ Sendo Exibido Agora
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
