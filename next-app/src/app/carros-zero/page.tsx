import dbConnect from '@/lib/mongoose';
import Manufacturer from '@/models/Manufacturer';
import ConfiguratorClient from './ConfiguratorClient';
import './CarrosZero.css';

export const dynamic = 'force-dynamic';

// Server Component Real para SEO Máximo
export default async function CarrosZeroPage() {
  await dbConnect();
  
  // SSG/SSR: Buscar marcas base direto do MongoDB
  const brands = await Manufacturer.find({ active: true }).sort({ name: 1 }).lean();

  return (
    <div className="page-enter">
      <div className="container section">
        <h1 className="section-title">Configurador Oficial <span>Zero KM</span></h1>
        <p className="section-sub">
          Monte seu importado oficial com a <strong>G-Style</strong>. 
          Escolha a montadora e descubra os pacotes disponíveis em todo o Japão.
        </p>

        {/* Client Component Lida com os seletores em cascata sem recarregar a tela */}
        <ConfiguratorClient initialBrands={JSON.parse(JSON.stringify(brands))} />
        
      </div>
    </div>
  );
}
