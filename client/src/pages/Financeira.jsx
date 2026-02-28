import { useState } from 'react';
import './Financeira.css';

export default function Financeira() {
  const [valorVeiculo, setValorVeiculo] = useState(1500000);
  const [entrada, setEntrada] = useState(0);
  const [taxaJuros, setTaxaJuros] = useState(1.9); // Taxa típica no Japão (1.5% - 3.5%)
  const [meses, setMeses] = useState(60);

  // Cálculo da prestação (Tabela Price)
  const calcularPrestacao = () => {
    const principal = valorVeiculo - entrada;
    if (principal <= 0) return 0;
    
    // Taxa mensal
    const i = (taxaJuros / 100) / 12;
    // Fórmula: PMT = PV * [i * (1 + i)^n] / [(1 + i)^n - 1]
    const pmt = principal * (i * Math.pow(1 + i, meses)) / (Math.pow(1 + i, meses) - 1);
    
    return Math.round(pmt);
  };

  const prestacaoMensal = calcularPrestacao();
  const formatJPY = (val) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);

  return (
    <div className="financeira-page page-enter">
      <div className="financeira-hero">
        <div className="accent-line" />
        <h1 className="section-title">
          Financiamento <span>Automotivo</span>
        </h1>
        <p className="section-sub">
          Aprovação rápida e as melhores taxas do mercado japonês.
        </p>
      </div>

      <div className="container">
        <div className="financeira-content">
          
          {/* SIMULADOR */}
          <div className="card simulador-card">
            <h2>Simulador de Financiamento</h2>
            <p className="text-muted" style={{ marginBottom: 24, fontSize: '0.9rem' }}>
              Simule as parcelas do seu próximo veículo G-Style.
            </p>

            <div className="form-group">
              <label>Valor do Veículo (¥)</label>
              <input 
                type="number" 
                value={valorVeiculo} 
                onChange={e => setValorVeiculo(Number(e.target.value))}
                step="10000"
              />
            </div>

            <div className="form-group">
              <label>Entrada (¥) - Opcional</label>
              <input 
                type="number" 
                value={entrada} 
                onChange={e => setEntrada(Number(e.target.value))}
                step="10000"
              />
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Taxa de Juros Anual (%)</label>
                <input 
                  type="number" 
                  value={taxaJuros} 
                  onChange={e => setTaxaJuros(Number(e.target.value))}
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Prazos (Meses)</label>
                <select value={meses} onChange={e => setMeses(Number(e.target.value))}>
                  <option value={12}>12 vezes (1 ano)</option>
                  <option value={24}>24 vezes (2 anos)</option>
                  <option value={36}>36 vezes (3 anos)</option>
                  <option value={48}>48 vezes (4 anos)</option>
                  <option value={60}>60 vezes (5 anos)</option>
                  <option value={72}>72 vezes (6 anos)</option>
                  <option value={84}>84 vezes (7 anos)</option>
                  <option value={96}>96 vezes (8 anos)</option>
                  <option value={120}>120 vezes (10 anos)</option>
                </select>
              </div>
            </div>

            <div className="simulador-resultado">
              <div className="resultado-item">
                <span className="resultado-label">Valor Financiado:</span>
                <span className="resultado-valor">{formatJPY(Math.max(0, valorVeiculo - entrada))}</span>
              </div>
              <div className="resultado-item destaque">
                <span className="resultado-label">Parcela Mensal Estimada:</span>
                <span className="resultado-valor highlight">{formatJPY(prestacaoMensal)}<span>/mês</span></span>
              </div>
              <p className="aviso-rodape">* Valores estimados. A taxa real pode variar conforme a análise de crédito da financeira.</p>
            </div>
          </div>

          {/* REQUISITOS E FORMULÁRIO */}
          <div className="documentos-section">
            <h2 style={{ marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>Pedido de Avaliação de Financiamento</h2>
            <p className="text-muted" style={{ marginBottom: 30 }}>
              Quer saber se o seu financiamento será aprovado? Reúna os documentos abaixo e nos envie para uma pré-avaliação sem compromisso.
            </p>

            <div className="card requisitos-card">
              <h3>📄 Documentos Necessários (Para Brasileiros/Estrangeiros no Japão)</h3>
              <ul className="docs-lista">
                <li><span className="check">✓</span> <strong>Zairyu Card</strong> (Frente e Verso) - Dentro da validade</li>
                <li><span className="check">✓</span> <strong>Carteira de Motorista Japonesa</strong> (Untensha Menkyosho) ou Internacional válida</li>
                <li><span className="check">✓</span> <strong>Gensen Choshuhyo</strong> (Comprovante de rendimento do último ano) ou os 3 últimos Holerites (Kyuyo Meisai)</li>
                <li><span className="check">✓</span> <strong>Hoken-sho</strong> (Cartão do Seguro de Saúde) Shakai Hoken ou Kokumin Kenko Hoken</li>
                <li><span className="check">✓</span> <strong>Inkan</strong> (Carimbo pessoal registrado na prefeitura - opcional na pré-análise)</li>
                <li><span className="check">✓</span> Comprovante de Residência (Juminhyo) emitido há menos de 3 meses</li>
              </ul>
            </div>

            <div className="cta-avalsiacao" style={{ marginTop: 40 }}>
              <h3>Como solicitar a pré-avaliação?</h3>
              <p>Envie fotos nítidas dos documentos acima pelo nosso WhatsApp oficial. Um gerente de financiamento cuidará do seu caso com total sigilo e segurança.</p>
              
              <a 
                href="https://wa.me/551199999999" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
                style={{ marginTop: 20, display: 'inline-flex' }}
              >
                📱 Enviar Documentos por WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
