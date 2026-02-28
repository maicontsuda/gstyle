'use client';

import { useState, useEffect } from 'react';
import { api } from '@/contexts/AuthContext';
import { Car, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ConfiguratorClient({ initialBrands }: { initialBrands: any[] }) {
  const [marcaId, setMarcaId] = useState('');
  const [modelos, setModelos] = useState<any[]>([]);
  const [modeloId, setModeloId] = useState('');
  
  const [versoes, setVersoes] = useState<any[]>([]);
  const [versaoId, setVersaoId] = useState('');
  const [versaoDetail, setVersaoDetail] = useState<any>(null);

  const [opcionais, setOpcionais] = useState<any[]>([]);
  const [opcionaisSelecionados, setOpcionaisSelecionados] = useState<any[]>([]);

  const [precoTotal, setPrecoTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1. Busca Modelos ao selecionar Marca
  useEffect(() => {
    if (!marcaId) return;
    setLoading(true);
    api.get(`/catalog/models?manufacturerId=${marcaId}`)
       .then(res => { setModelos(res.data); setModeloId(''); setVersoes([]); setPrecoTotal(0); })
       .finally(() => setLoading(false));
  }, [marcaId]);

  // 2. Busca Versões ao selecionar Modelo
  useEffect(() => {
    if (!modeloId) return;
    setLoading(true);
    const modDb = modelos.find(m => m._id === modeloId);
    if(modDb) setPrecoTotal(modDb.basePriceJapan);

    api.get(`/catalog/versions?modelId=${modeloId}`)
       .then(res => { setVersoes(res.data); setVersaoId(''); })
       .finally(() => setLoading(false));
  }, [modeloId]);

  // 3. Busca Opcionais e set Preco Base da Versao ao selecionar versão
  useEffect(() => {
    if (!versaoId) return;
    setLoading(true);
    
    // Calcula Preco Base + Versao
    const verDb = versoes.find(v => v._id === versaoId);
    setVersaoDetail(verDb);
    const modDb = modelos.find(m => m._id === modeloId);
    if(verDb && modDb) {
      setPrecoTotal(modDb.basePriceJapan + verDb.basePrice);
    }

    setOpcionaisSelecionados([]); // Reseta escolhas

    api.get(`/catalog/options?versionId=${versaoId}`)
       .then(res => setOpcionais(res.data))
       .finally(() => setLoading(false));
  }, [versaoId]);

  const toggleOption = (opt: any) => {
    const isSelected = opcionaisSelecionados.find(o => o._id === opt._id);
    if (isSelected) {
      setOpcionaisSelecionados(prev => prev.filter(o => o._id !== opt._id));
      setPrecoTotal(prev => prev - opt.additionalPrice);
    } else {
      setOpcionaisSelecionados(prev => [...prev, opt]);
      setPrecoTotal(prev => prev + opt.additionalPrice);
    }
  };

  const formatJPY = (val: number) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);

  return (
    <div className="configurator-wrapper">
      
      {/* CASCATA DE SELEÇÃO */}
      <div className="card form-card p-6 configurator-steps">
        <div className="form-group">
          <label>1. Selecione a Montadora</label>
          <select value={marcaId} onChange={e => setMarcaId(e.target.value)}>
            <option value="">-- Escolher Marca --</option>
            {initialBrands.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>

        {marcaId && (
          <div className="form-group slide-in">
            <label>2. Selecione o Modelo</label>
            <select value={modeloId} onChange={e => setModeloId(e.target.value)} disabled={loading}>
              <option value="">-- Escolher Modelo --</option>
              {modelos.map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.category})</option>
              ))}
            </select>
          </div>
        )}

        {modeloId && (
          <div className="form-group slide-in">
            <label>3. Selecione a Versão/Configuração Motor</label>
            <select value={versaoId} onChange={e => setVersaoId(e.target.value)} disabled={loading}>
              <option value="">-- Escolher Versão --</option>
              {versoes.map(v => (
                <option key={v._id} value={v._id}>
                  {v.name} | {v.engine} | {v.transmission} (+{formatJPY(v.basePrice)})
                </option>
              ))}
            </select>
          </div>
        )}

        {versaoId && opcionais.length > 0 && (
          <div className="form-group slide-in select-options-grid">
            <label>4. Personalizar Opcionais Fixos G-Style</label>
            <div className="options-grid" style={{ display: 'grid', gap: '10px' }}>
               {opcionais.map(o => {
                 const selected = opcionaisSelecionados.find(s => s._id === o._id);
                 return (
                   <div 
                     key={o._id} 
                     onClick={() => toggleOption(o)}
                     style={{
                        padding: '10px', 
                        border: selected ? '2px solid var(--accent)' : '1px solid #444',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: selected ? 'var(--bg-card)' : 'transparent'
                     }}
                   >
                     <span>{o.name} <small style={{color:'var(--text-muted)'}}>({o.type})</small></span>
                     <strong>+{formatJPY(o.additionalPrice)}</strong>
                   </div>
                 );
               })}
            </div>
          </div>
        )}
      </div>

      {/* PAINEL FLUTUANTE DE FECHAMENTO (STICKY) */}
      <div className="configurator-sidebar">
        <div className="card result-card sticky-box">
           <h3>Resumo da Configuração</h3>
           
           {!modeloId ? (
             <p className="muted-text">Selecione um carro para ver o preço japonês estimado.</p>
           ) : (
             <div className="summary-list fade-in">
                <p><strong>Veículo:</strong> {modelos.find(m => m._id === modeloId)?.name}</p>
                {versaoDetail && <p><strong>Motor:</strong> {versaoDetail.engine} {versaoDetail.transmission}</p>}
                
                {opcionaisSelecionados.length > 0 && (
                  <div className="summary-options" style={{margin:'15px 0', fontSize:'0.9rem', color:'var(--text-muted)'}}>
                    <strong>Packs Addons:</strong>
                    <ul style={{paddingLeft:'15px'}}>
                      {opcionaisSelecionados.map(o => <li key={o._id}>{o.name}</li>)}
                    </ul>
                  </div>
                )}

                <hr style={{borderColor: '#333', margin: '20px 0'}} />
                
                <div className="result-metric highlight">
                  <span>Preço Total Estimado:</span>
                  <strong>{formatJPY(precoTotal)}</strong>
                </div>

                <div className="configurator-actions" style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'20px'}}>
                  <button className="btn btn-primary"><CheckCircle2 size={18}/> Solicitar Cotação Final</button>
                  <button className="btn btn-outline" onClick={() => window.location.href='/financeira'}><Car size={18}/> Simular Financiamento</button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
