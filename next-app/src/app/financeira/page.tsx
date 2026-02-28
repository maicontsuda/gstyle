'use client';

import { useState } from 'react';
import { api } from '@/contexts/AuthContext';
import './Financeira.css';

export default function Financeira() {
  const [valorDoVeiculo, setValorDoVeiculo] = useState<number | ''>('');
  const [valorDaEntrada, setValorDaEntrada] = useState<number | ''>('');
  const [numeroDeParcelas, setNumeroDeParcelas] = useState(60);
  const [taxaAnual, setTaxaAnual] = useState(4.9);
  
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const formatJPY = (val: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);
  };

  const handleSimular = async (e: any) => {
    e.preventDefault();
    if (!valorDoVeiculo || !numeroDeParcelas) return;

    setLoading(true);
    try {
      // Simulação Front-End Direta (Para evitar sobrecarga na API Serverless)
      const principal = Number(valorDoVeiculo) - Number(valorDaEntrada || 0);
      const taxaMensalDecimal = (taxaAnual / 100) / 12;
      let valorParcelaMensal;

      if (taxaMensalDecimal === 0) {
        valorParcelaMensal = principal / numeroDeParcelas;
      } else {
        valorParcelaMensal = principal * (taxaMensalDecimal * Math.pow(1 + taxaMensalDecimal, numeroDeParcelas)) / 
                             (Math.pow(1 + taxaMensalDecimal, numeroDeParcelas) - 1);
      }

      setResultado({
        valorFinanciado: principal,
        parcelaMensal: Math.round(valorParcelaMensal),
        totalPagoJuros: Math.round((valorParcelaMensal * numeroDeParcelas) - principal)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter financeira-page">
      <div className="container section">
        <h1 className="section-title">Financiamento <span>G-Style Japão</span></h1>
        <p className="section-sub">Solução especializada em crédito automotivo para estrangeiros no Japão.</p>
        
        <div className="financeira-layout" style={{marginTop:'30px'}}>
          <div className="card form-card">
             <h2>Simulador Online (¥)</h2>
             <form onSubmit={handleSimular} className="financeira-form">
               <div className="form-group">
                 <label>Valor do Veículo (¥)</label>
                 <input type="number" placeholder="Ex: 1500000" value={valorDoVeiculo} 
                        onChange={e => setValorDoVeiculo(Number(e.target.value))} required />
               </div>
               <div className="form-group">
                 <label>Entrada (Opcional - ¥)</label>
                 <input type="number" placeholder="Ex: 300000" value={valorDaEntrada} 
                        onChange={e => setValorDaEntrada(Number(e.target.value))} />
               </div>
               <div className="form-group">
                 <label>Parcelas (Meses)</label>
                 <select value={numeroDeParcelas} onChange={e => setNumeroDeParcelas(Number(e.target.value))}>
                    <option value={24}>24x (2 Anos)</option>
                    <option value={36}>36x (3 Anos)</option>
                    <option value={48}>48x (4 Anos)</option>
                    <option value={60}>60x (5 Anos)</option>
                    <option value={72}>72x (6 Anos)</option>
                    <option value={84}>84x (7 Anos)</option>
                    <option value={96}>96x (8 Anos)</option>
                    <option value={120}>120x (10 Anos)</option>
                 </select>
               </div>
               <div className="form-group">
                 <label>Taxa de Juros (APR % Opcional)</label>
                 <input type="number" step="0.1" value={taxaAnual} 
                        onChange={e => setTaxaAnual(Number(e.target.value))} />
               </div>
               <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
                 {loading ? 'Calculando...' : 'Calcular Parcela'}
               </button>
             </form>
          </div>

          {resultado && (
            <div className="card result-card slide-in">
              <h2>Resultado Estimado</h2>
              <div className="result-metric">
                <span>Valor Financiado:</span>
                <strong>{formatJPY(resultado.valorFinanciado)}</strong>
              </div>
              <div className="result-metric highlight">
                <span>Parcela Mensal:</span>
                <strong>{formatJPY(resultado.parcelaMensal)}</strong>
              </div>
              <div className="result-metric text-muted">
                <span>Total de Juros Previsto:</span>
                <strong>{formatJPY(resultado.totalPagoJuros)}</strong>
              </div>
              <p className="muted-text text-sm center" style={{marginTop:'15px'}}>
                * Valores baseados em método de Tabela Price Japonesa pura (Moto利息). O valor real da parceira financeira pode variar minimamente.
              </p>
              <button className="btn btn-outline center" style={{width:'100%', marginTop:'20px'}}>
                Baixar Pré-Proposta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
