import { Link } from 'react-router-dom';

const formatPriceJPY = (val) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);

export default function ZeroKmCard({ car }) {
  // Imagem mockada se não tiver
  const imagem = car.images && car.images.length > 0 
    ? car.images[0] 
    : 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  const isHybrid = car.fuel_type?.toLowerCase().includes('hybrid') || car.fuel_type?.toLowerCase().includes('híbrido');
  const isEV = car.fuel_type?.toLowerCase().includes('elétrico') || car.fuel_type?.toLowerCase() === 'ev';

  return (
    <div className="card car-card group relative">
      <div className="car-card-img-wrap">
        <img src={imagem} alt={car.model} className="car-card-img" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-bold text-[var(--chrome-light)] border border-white/10 shadow-lg">
          0KM
        </div>

        {isHybrid && (
          <div className="absolute top-3 right-3 flex px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full text-xs font-bold text-blue-400 border border-blue-500/30">
            HYBRID
          </div>
        )}
        {isEV && (
          <div className="absolute top-3 right-3 flex px-3 py-1 bg-green-500/20 backdrop-blur-md rounded-full text-xs font-bold text-green-400 border border-green-500/30">
            100% EV
          </div>
        )}
      </div>

      <div className="car-card-body flex flex-col p-5 h-full">
        <div className="text-[0.75rem] text-[var(--chrome-light)] font-semibold uppercase tracking-wider mb-1">
          {car.brand} • {car.category}
        </div>
        
        <h3 className="font-playfair text-xl text-[var(--text)] mb-3 leading-tight group-hover:text-[var(--chrome-light)] transition-colors">
          {car.model}
        </h3>

        {/* Specs */}
        <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)] mb-4">
          <span className="bg-white/5 px-2 py-1 rounded">{car.year}</span>
          <span className="bg-white/5 px-2 py-1 rounded">{car.transmission}</span>
          <span className="bg-white/5 px-2 py-1 rounded">{car.fuel_type}</span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
          <div className="text-xl font-bold text-[var(--chrome-light)]">
            {formatPriceJPY(car.price)}
          </div>
          
          <Link to={`/veiculo-0km/${car._id}`} className="text-sm font-medium text-[var(--text-muted)] group-hover:text-[var(--chrome-light)] transition-colors flex items-center gap-1">
            Ver Detalhes <span className="text-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
