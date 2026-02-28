import dbConnect from '@/lib/mongoose';
import Manufacturer from '@/models/Manufacturer';
import UsedCarClient from './UsedCarClient';
import './Seminovos.css';

export const dynamic = 'force-dynamic';

export default async function SeminovosPage() {
  await dbConnect();
  
  // Buscar montadoras ativas para abastecer o Select do Filtro no Client Component de forma super rápida via DB SSR
  const brands = await Manufacturer.find({ active: true }).sort({ name: 1 }).lean();

  return (
    <div className="page-enter">
      <div className="container section">
        <h1 className="section-title">Marketplace <span>Seminovos</span></h1>
        <p className="section-sub">Encontre o carro ideal para a sua garagem no Japão. Qualidade premium G-Style garantida.</p>

        {/* Componente interativo que carrega a grid e chama as serverless APIs */}
        <UsedCarClient initialBrands={JSON.parse(JSON.stringify(brands))} />

      </div>
    </div>
  );
}
