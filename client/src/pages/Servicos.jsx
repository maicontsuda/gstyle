import './Servicos.css';

const SERVICOS = [
  { icone: '🔧', nome: 'Revisão Completa', descricao: 'Verificação total do veículo com laudo técnico detalhado. Motor, freios, suspensão e elétrica.' },
  { icone: '🎨', nome: 'Funilaria & Pintura', descricao: 'Acabamento profissional com tintas automotivas de alta qualidade e proteção cerâmica.' },
  { icone: '🔊', nome: 'Som & Multimídia', descricao: 'Instalação de centrais, alto-falantes, subwoofers e módulos com as melhores marcas do mercado.' },
  { icone: '💡', nome: 'Iluminação LED', descricao: 'Retrofit LED, faróis de projeção e iluminação interna personalizada para o seu veículo.' },
  { icone: '🛞', nome: 'Rodas & Pneus', descricao: 'Venda e montagem de rodas liga leve e pneus de performance, alinhamento e balanceamento.' },
  { icone: '📋', nome: 'Documentação', descricao: 'Nossa equipe cuida de toda a burocracia de transferência, DETRAN e emplacamento.' },
];

export default function Servicos() {
  return (
    <div className="page-enter servicos-page">
      <section className="section">
        <div className="container">
          <div className="accent-line" />
          <h1 className="section-title">Nossos <span>Serviços</span></h1>
          <p className="section-sub">A G-Style Custom Shop cuida do seu carro do início ao fim.</p>

          <div className="servicos-grid">
            {SERVICOS.map((s, i) => (
              <div key={i} className="servico-card">
                <div className="servico-icon">{s.icone}</div>
                <h3>{s.nome}</h3>
                <p>{s.descricao}</p>
              </div>
            ))}
          </div>

          <div className="servicos-cta">
            <h2>Agende uma visita</h2>
            <p>Entre em contato pelo WhatsApp ou preencha o formulário para falarmos sobre o que seu carro precisa.</p>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              💬 Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
