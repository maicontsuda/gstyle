'use client';

import { useState, useEffect } from 'react';
import { api } from '@/contexts/AuthContext';
import { Search, MapPin, JapaneseYen, ShieldCheck, Car } from 'lucide-react';

export default function UsedCarClient({ initialBrands }: { initialBrands: any[] }) {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States de Filtro
  const [marca, setMarca] = useState('');
  const [regiao, setRegiao] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [anoMinimo, setAnoMinimo] = useState('');
  const [financiamento, setFinanciamento] = useState(false);

  const fetchSeminovos = async () => {
    setLoading(true);
    try {
      let query = `/catalog/used-cars?`;
      if (marca) query += `manufacturerId=${marca}&`;
      if (regiao) query += `region=${regiao}&`;
      if (precoMax) query += `maxPrice=${precoMax}&`;
      if (anoMinimo) query += `minYear=${anoMinimo}&`;
      if (financiamento) query += `financingAvailable=true`;

      const res = await api.get(query);
      setCars(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Run inicial e quando o filtro pesado ("Aplicar") for clicado (para evitar calls excessivos)
  useEffect(() => {
    fetchSeminovos();
  }, []);

  const formatJPY = (val: number) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);

  return (
    <div className="marketplace-layout" style={{display:'flex', gap:'30px', marginTop:'30px', alignItems: 'flex-start'}}>
      
      {/* SIDEBAR DE FILTROS */}
      <div className="card filters-sidebar sticky-box" style={{flex: '0 0 280px'}}>
         <h3 style={{display:'flex', alignItems:'center', gap:'8px'}}><Search size={20}/> Filtros</h3>
         <hr style={{borderColor: '#333', margin: '15px 0'}} />
         
         <div className="form-group">
            <label>Montadora</label>
            <select value={marca} onChange={e => setMarca(e.target.value)}>
              <option value="">Todas as Marcas</option>
              {initialBrands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
         </div>

         <div className="form-group">
            <label>Região no Japão (Ken)</label>
            <select value={regiao} onChange={e => setRegiao(e.target.value)}>
              <option value="">Todo o Japão</option>
              <option value="Aichi">Aichi</option>
              <option value="Shizuoka">Shizuoka</option>
              <option value="Mie">Mie</option>
              <option value="Gifu">Gifu</option>
              <option value="Gunma">Gunma</option>
              <option value="Tokyo">Tokyo</option>
            </select>
         </div>

         <div className="form-group">
            <label>Preço Máximo (¥)</label>
            <input type="number" placeholder="Até..." value={precoMax} onChange={e => setPrecoMax(e.target.value)} />
         </div>

         <div className="form-group">
            <label>Ano Mínimo</label>
            <input type="number" placeholder="Ex: 2018" value={anoMinimo} onChange={e => setAnoMinimo(e.target.value)} />
         </div>

         <label className="switch" style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'20px'}}>
            <input type="checkbox" checked={financiamento} onChange={() => setFinanciamento(!financiamento)}/>
            <span className="slider round" style={{position:'relative', display:'inline-block'}}></span>
            <span style={{fontSize:'0.9rem'}}>Aceita Financiamento</span>
         </label>

         <button className="btn btn-primary" style={{width:'100%', marginTop:'25px'}} onClick={fetchSeminovos}>
            Buscar Veículos
         </button>
      </div>


      {/* GRID DE RESULTADOS */}
      <div className="marketplace-results" style={{flex: 1}}>
         {loading ? (
             <div className="spinner"></div>
         ) : (
             <>
               <p className="muted-text" style={{marginBottom: '20px'}}>
                 {cars.length} veículos encontrados batendo com a sua pesquisa.
               </p>
               <div className="grid">
                 {cars.map((car: any) => (
                    <div key={car._id} className="card p-4 hover-lift">
                      <div style={{height:'180px', backgroundColor:'#222', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                         {car.images?.length > 0 ? (
                            <img src={car.images[0]} alt={car.model} style={{maxWidth:'100%', maxHeight:'100%', objectFit:'cover', borderRadius:'8px'}}/>
                         ) : (
                            <Car size={40} color="#555"/>
                         )}
                      </div>
                      <h3 style={{marginTop:'15px'}}>{car.manufacturerId?.name} {car.model}</h3>
                      
                      <div style={{display:'flex', justifyContent:'space-between', marginTop:'10px', color:'var(--text-muted)', fontSize:'0.9rem'}}>
                         <span>Ano {car.year}</span>
                         <span>{car.mileage.toLocaleString('ja-JP')} km</span>
                      </div>

                      <div style={{display:'flex', alignItems:'center', gap:'5px', marginTop:'10px', color:'var(--text-muted)', fontSize:'0.9rem'}}>
                         <MapPin size={14}/> {car.region}
                      </div>

                      <h2 className="highlight" style={{marginTop:'15px', color:'var(--accent)'}}>
                         {formatJPY(car.price)}
                      </h2>

                      {car.financingAvailable && (
                        <div style={{display:'flex', alignItems:'center', gap:'5px', marginTop:'5px', color:'#4CAF50', fontSize:'0.85rem'}}>
                           <ShieldCheck size={14}/> 100% Financiável G-Style
                        </div>
                      )}

                      <button className="btn btn-outline" style={{width:'100%', marginTop:'20px'}}>
                        Agendar Visita
                      </button>
                    </div>
                 ))}
                 
                 {cars.length === 0 && (
                   <div style={{gridColumn:'1/-1', textAlign:'center', padding:'50px', background:'var(--bg-card)', borderRadius:'12px'}}>
                      <h3 className="muted-text">Nenhum carro encontrado.</h3>
                      <p>Tente remover alguns filtros da busca lateral.</p>
                   </div>
                 )}
               </div>
             </>
         )}
      </div>
      
    </div>
  );
}
