import { useState } from 'react';
import api from '../api';
import './Financeira.css';

export default function Financeira() {
  const [form, setForm] = useState({
    valorVeiculo: '',
    entrada: '',
    parcelas: '72',
    taxaAnual: '4.9',
    
    // Proposta details
    nomeCompleto: '',
    telefone: '',
    email: '',
    tipoVisto: 'Permanente',
    tipoEmprego: 'Seishain (Efetivo)'
  });
  
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const VISTOS = ['Permanente', 'Cônjuge de Japonês', 'Residente de Longo Prazo', 'Visto de Trabalho (Engenheiro/Humanas)', 'Dependente (Kajoku Taizai)', 'Estudante', 'Outro'];
  const EMPREGOS = ['Seishain (Efetivo)', 'Keiyaku (Contrato Empreiteira / Hakken)', 'Keiyaku (Contrato Direto)', 'Arubaito / Part-time', 'Autônomo (Kojin Jigyo)', 'Desempregado', 'Outro'];

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function simular() {
    setErrorMsg(null);
    try {
      const payload = {
        valorVeiculo: parseFloat(form.valorVeiculo) || 0,
        entrada: parseFloat(form.entrada) || 0,
        prazo: parseInt(form.parcelas) || 72,
        taxaAnual: parseFloat(form.taxaAnual) || 4.9
      };
      
      const res = await api.post('/financiamento/simular', payload);
      setResultado(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro na simulação.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const payload = {
        valorDesejado: parseFloat(form.valorVeiculo) || 0,
        entrada: parseFloat(form.entrada) || 0,
        parcelas: parseInt(form.parcelas) || 72,
        nomeCompleto: form.nomeCompleto,
        telefone: form.telefone,
        email: form.email,
        tipoVisto: form.tipoVisto,
        tipoEmprego: form.tipoEmprego
      };
      await api.post('/financiamento/proposta', payload);
      setEnviado(true);
    } catch(err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao enviar proposta. Preencha todos os campos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-enter financeira-page">
      <div className="container section">
        <div className="accent-line" />
        <h1 className="section-title">Simulação de <span>Financiamento JPN</span></h1>
        <p className="section-sub">Calcule as parcelas em Ienes (¥) e envie sua proposta para pré-aprovação de crédito no Japão.</p>

        {errorMsg && <div className="msg-alert error">{errorMsg}</div>}

        <div className="financeira-grid">
          {/* Simulador */}
          <div className="financeira-card">
            <h2>Simulador Automotivo</h2>
            <div className="form-group">
              <label>Valor do Veículo (¥)</label>
              <input name="valorVeiculo" type="number" placeholder="Ex: 1500000" value={form.valorVeiculo} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Valor da Entrada (¥)</label>
              <input name="entrada" type="number" placeholder="Ex: 300000" value={form.entrada} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Número de Parcelas</label>
              <select name="parcelas" value={form.parcelas} onChange={handleChange}>
                {[12, 24, 36, 48, 60, 72, 84, 96, 108, 120].map(n => <option key={n} value={n}>{n}x meses</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Taxa de Juros Anual (APR %)</label>
              <select name="taxaAnual" value={form.taxaAnual} onChange={handleChange}>
                <option value="2.9">2.9% a.a</option>
                <option value="3.9">3.9% a.a</option>
                <option value="4.9">4.9% a.a</option>
                <option value="5.9">5.9% a.a</option>
                <option value="6.9">6.9% a.a</option>
                <option value="7.9">7.9% a.a</option>
                <option value="8.9">8.9% a.a</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={simular}>
              Simular Parcelas
            </button>

            {resultado && (
              <div className="resultado-card">
                <div className="resultado-item">
                  <span>Valor Financiado</span>
                  <strong>¥ {resultado.valorFinanciado.toLocaleString('ja-JP')}</strong>
                </div>
                <div className="resultado-item">
                  <span>Juros Estimado Tot.</span>
                  <strong>¥ {resultado.totalJuros.toLocaleString('ja-JP')}</strong>
                </div>
                <div className="resultado-item resultado-destaque">
                  <span>Parcela Mensal Estimada</span>
                  <strong>¥ {resultado.parcelaMensal.toLocaleString('ja-JP')} /mês</strong>
                </div>
                <p className="resultado-aviso" style={{ fontSize: '0.8rem', color: '#ff4a4a', marginTop: '10px' }}>* Simulação aproximada baseada na {resultado.taxaAnual}% APR. A taxa e parcela exatas dependem inteiramente da análise de crédito da financeira nipônica.</p>
              </div>
            )}
          </div>

          {/* Formulário de proposta */}
          <div className="financeira-card">
            <h2>Pré-Aprovação de Crédito JPN</h2>
            {enviado ? (
              <div className="enviado-msg">
                <p style={{fontSize: '3rem'}}>✅</p>
                <h3>Proposta enviada!</h3>
                <p>Recebemos o seu perfil de crédito. Nossa equipe fará a pré-análise e entrará em contato telefone ou e-mail com os próximos passos.</p>
                <button className="btn btn-outline" style={{marginTop: '20px'}} onClick={() => { setEnviado(false); setResultado(null); }}>Fazer nova simulação</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nome Completo (Romaji)</label>
                  <input name="nomeCompleto" placeholder="Ex: CARLOS SILVA" value={form.nomeCompleto} onChange={handleChange} required />
                </div>
                <div className="form-row" style={{display: 'flex', gap: '16px'}}>
                   <div className="form-group" style={{flex: 1}}>
                     <label>Telefone (Celular preferencial)</label>
                     <input name="telefone" placeholder="090-XXXX-XXXX" value={form.telefone} onChange={handleChange} required />
                   </div>
                   <div className="form-group" style={{flex: 1}}>
                     <label>E-mail (Opcional)</label>
                     <input type="email" name="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} />
                   </div>
                </div>
                
                <div className="form-group">
                  <label>Status do Visto (Zairyu Card)</label>
                  <select name="tipoVisto" value={form.tipoVisto} onChange={handleChange} required>
                    {VISTOS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Situação Empregatícia</label>
                  <select name="tipoEmprego" value={form.tipoEmprego} onChange={handleChange} required>
                    {EMPREGOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} type="submit" disabled={loading}>
                  {loading ? 'Enviando...' : 'Pedir Pré-Aprovação'}
                </button>
                <p className="resultado-aviso" style={{ fontSize: '0.75rem', marginTop: '10px' }}>Ao enviar, seu perfil será transferido com segurança para as financeiras japonesas parceiras da G-Style.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
