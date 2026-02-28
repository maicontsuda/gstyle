import './Servicos.css';

const SERVICOS = [
  {
    emoji: '🔧',
    titulo: 'Personalização Completa',
    desc: 'Transformamos o seu veículo com kits de carroceria, spoilers, diffusers e acabamentos exclusivos no estilo G-Style.',
  },
  {
    emoji: '🎨',
    titulo: 'Pintura & Envelopamento',
    desc: 'Pintura automotiva profissional, envelopamento Total e parcial, wrap cromado, fosco, satin e texturas exclusivas.',
  },
  {
    emoji: '💡',
    titulo: 'Iluminação LED & DRL',
    desc: 'Instalação de faróis full-LED, faixas DRL, iluminação interna e externa com efeitos personalizados.',
  },
  {
    emoji: '🛞',
    titulo: 'Rodas & Suspensão',
    desc: 'Venda e instalação de rodas importadas, rebaixamento, suspensão a ar e alinhamento de alta precisão.',
  },
  {
    emoji: '🔊',
    titulo: 'Som Automotivo',
    desc: 'Centrais multimídia, subwoofers, amplificadores e sistemas de áudio premium com instalação certificada.',
  },
  {
    emoji: '🛡️',
    titulo: 'Proteção & Polimento',
    desc: 'PPF (película protetora de pintura), vitrificação cerâmica, polimento técnico e restauração de lataria.',
  },
];

export default function Servicos() {
  return (
    <div className="servicos-page page-enter">
      <div className="servicos-hero">
        <div className="accent-line" />
        <h1 className="section-title">
          Nossos <span>Serviços</span>
        </h1>
        <p className="section-sub">
          Especialistas em customização automotiva desde 2016. Qualidade G-Style em cada detalhe.
        </p>
      </div>

      <div className="container">
        <div className="servicos-grid">
          {SERVICOS.map((s) => (
            <div key={s.titulo} className="servico-card card">
              <div className="servico-icon">{s.emoji}</div>
              <h3 className="servico-titulo">{s.titulo}</h3>
              <p className="servico-desc">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="servicos-cta">
          <h2>Pronto para transformar seu carro?</h2>
          <p>Entre em contato e solicite um orçamento sem compromisso.</p>
          <a
            href="https://wa.me/551199999999"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            💬 Chamar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
