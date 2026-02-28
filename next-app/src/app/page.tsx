import Link from 'next/link';
import { Car, Search, Award } from 'lucide-react';
import './Home.css';

export default function Home() {
  return (
    <div className="page-enter home-page">
      <div className="container section">
        
        <div className="hero-banner card p-6" style={{textAlign:'center', background:'linear-gradient(145deg, #111, var(--bg-card))'}}>
          <h1 className="section-title" style={{fontSize: '2.5rem', marginBottom:'15px'}}>G-Style <span>Motors</span></h1>
          <p className="section-sub text-lg" style={{maxWidth:'800px', margin:'0 auto'}}>
             A principal plataforma especializada em crédito, importação zero KM e seminovos de excelência no Japão. Sua liberdade sobre 4 rodas.
          </p>

          <div style={{display:'flex', justifyContent:'center', gap:'20px', marginTop:'40px', flexWrap:'wrap'}}>
             <Link href="/carros-zero" className="btn btn-primary btn-lg" style={{display:'flex', alignItems:'center', gap:'10px'}}>
               <Car size={20} /> Configurador Zero KM Oficial
             </Link>
             <Link href="/seminovos" className="btn btn-outline btn-lg" style={{display:'flex', alignItems:'center', gap:'10px'}}>
               <Search size={20} /> Marketplace de Seminovos Premium
             </Link>
          </div>
        </div>

        <div className="grid" style={{marginTop:'50px'}}>
          <div className="card form-card p-6" style={{textAlign:'center'}}>
            <Award size={40} color="var(--accent)" style={{marginBottom:'20px'}}/>
            <h3>Financiamento Garantido</h3>
            <p className="muted-text mt-2">Aprovação relâmpago para estrangeiros com base no Zairyu Card e Visto Permanente ou Temporário.</p>
          </div>
          
          <div className="card form-card p-6" style={{textAlign:'center'}}>
            <Car size={40} color="var(--accent)" style={{marginBottom:'20px'}}/>
            <h3>Acesso Global (Zero KM)</h3>
            <p className="muted-text mt-2">Monte seu carro do jeito que quiser, importamos direto da fábrica sob encomenda especial.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
