import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import 'swiper/css';
import 'swiper/css/effect-fade';
import './CarCard.css';

const TIPO_LABELS = { sedan: 'Sedan', suv: 'SUV', hatch: 'Hatch', pickup: 'Pickup', esportivo: 'Esportivo', van: 'Van', outro: 'Outro' };
const COMB_LABELS = { gasolina: '⛽ Gasolina', etanol: '⛽ Etanol', flex: '⛽ Flex', diesel: '⛽ Diesel', eletrico: '⚡ Elétrico', hibrido: '⚡ Híbrido' };

function formatPrice(v) {
  if (!v && v !== 0) return '—';
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(v);
}

function formatKm(km) {
  if (km === 0) return 'Zero km';
  return km.toLocaleString('ja-JP') + ' km';
}

const MediaRender = ({ src, alt }) => {
  if (typeof src === 'string' && src.toLowerCase().match(/\.(mp4|webm|mov)(\?|$)/)) {
    return <video src={src} className="car-card-img" autoPlay muted loop playsInline />;
  }
  return <img src={src} alt={alt} className="car-card-img" loading="lazy" />;
};

export default function CarCard({ carro }) {
  const { user, setUser } = useAuth();
  
  const isFavorite = Boolean(
    user && user.favoritosCarros && user.favoritosCarros.some(c => 
      (typeof c === 'object' ? c._id : c) === carro._id
    )
  );

  const toggleFavorite = async (e) => {
    e.preventDefault(); // Impede de abrir a tela do carro
    e.stopPropagation();
    if (!user) {
      alert("Por favor, faça login para favoritar veículos.");
      return;
    }
    
    try {
      await api.post(`/auth/favoritos/carros/${carro._id}`);
      // Atualiza o contexto do usuário sutilmente
      if (setUser) {
         api.get('/auth/me').then(r => setUser(r.data));
      }
    } catch (err) {
      console.error('Erro ao favoritar', err);
    }
  };

  const imagens = carro.imagens && carro.imagens.length > 0
    ? carro.imagens
    : [`https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=600&q=80`];

  return (
    <Link to={`/veiculo/${carro._id}`} className="car-card card relative block hover:-translate-y-1 hover:shadow-xl transition-all h-full flex flex-col">
      <div className="car-card-img-wrap relative">
        <button 
          onClick={toggleFavorite}
          className={`absolute top-2 right-2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-black/60 shadow-lg ${isFavorite ? 'text-red-500 scale-110' : 'text-white hover:text-red-400'}`}
          aria-label="Favoritar carro"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFavorite ? "0" : "2"} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {imagens.length > 1 ? (
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop={true}
            allowTouchMove={false} // Disable swiping on the card itself so it doesn't interfere with scrolling
            className="w-full h-full"
          >
            {imagens.map((imgSrc, idx) => (
              <SwiperSlide key={idx}>
                <MediaRender src={imgSrc} alt={`${carro.marca} ${carro.modelo} ${idx}`} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <MediaRender src={imagens[0]} alt={`${carro.marca} ${carro.modelo}`} />
        )}
        {carro.destaque && <span className="car-card-badge-destaque">⭐ Destaque</span>}
        <span className={`car-card-status ${carro.status === 'zero_km' ? 'status-new' : 'status-used'}`}>
          {carro.status === 'zero_km' ? 'Zero KM' : 'Semi-novo'}
        </span>
      </div>

      <div className="car-card-body flex-1">
        <div className="car-card-tipo">{TIPO_LABELS[carro.tipo] || carro.tipo}</div>
        <h3 className="car-card-name">{carro.marca} {carro.modelo}</h3>
        <div className="car-card-meta">
          <span>📅 {carro.ano}</span>
          <span>🛣️ {formatKm(carro.km)}</span>
          <span>{COMB_LABELS[carro.combustivel] || carro.combustivel}</span>
        </div>
        <div className="car-card-footer mt-auto">
          <div className="car-card-price">{formatPrice(carro.valor)}</div>
          <span className="car-card-cta">Ver detalhes →</span>
        </div>
      </div>
    </Link>
  );
}
