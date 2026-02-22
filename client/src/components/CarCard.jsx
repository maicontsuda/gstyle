import { Link } from 'react-router-dom';
import './CarCard.css';

const TIPO_LABELS = { sedan: 'Sedan', suv: 'SUV', hatch: 'Hatch', pickup: 'Pickup', esportivo: 'Esportivo', van: 'Van', outro: 'Outro' };
const COMB_LABELS = { gasolina: '⛽ Gasolina', etanol: '⛽ Etanol', flex: '⛽ Flex', diesel: '⛽ Diesel', eletrico: '⚡ Elétrico', hibrido: '⚡ Híbrido' };

function formatPrice(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function formatKm(km) {
  if (km === 0) return 'Zero km';
  return km.toLocaleString('pt-BR') + ' km';
}

export default function CarCard({ carro }) {
  const img = carro.imagens?.[0] ||
    `https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=600&q=80`;

  return (
    <Link to={`/veiculo/${carro._id}`} className="car-card card">
      <div className="car-card-img-wrap">
        <img src={img} alt={`${carro.marca} ${carro.modelo}`} className="car-card-img" loading="lazy" />
        {carro.destaque && <span className="car-card-badge-destaque">⭐ Destaque</span>}
        <span className={`car-card-status ${carro.status === 'zero_km' ? 'status-new' : 'status-used'}`}>
          {carro.status === 'zero_km' ? 'Zero KM' : 'Semi-novo'}
        </span>
      </div>

      <div className="car-card-body">
        <div className="car-card-tipo">{TIPO_LABELS[carro.tipo] || carro.tipo}</div>
        <h3 className="car-card-name">{carro.marca} {carro.modelo}</h3>
        <div className="car-card-meta">
          <span>📅 {carro.ano}</span>
          <span>🛣️ {formatKm(carro.km)}</span>
          <span>{COMB_LABELS[carro.combustivel] || carro.combustivel}</span>
        </div>
        <div className="car-card-footer">
          <div className="car-card-price">{formatPrice(carro.valor)}</div>
          <span className="car-card-cta">Ver detalhes →</span>
        </div>
      </div>
    </Link>
  );
}
