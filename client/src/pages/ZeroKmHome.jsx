import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './ZeroKmHome.css';

// Mockup de Logos de marcas para ilustrar o grid de marcas automotivas
// Numa aplicação real, você teria imagens reais salvas ou na collection de Brands
const BRAND_LOGOS = {
  // Japonesas - usando URLs confiáveis de CDNs públicos
  'Toyota':   'https://cdn.worldvectorlogo.com/logos/toyota-1.svg',
  'Honda':    'https://cdn.worldvectorlogo.com/logos/honda-6.svg',
  'Nissan':   'https://cdn.worldvectorlogo.com/logos/nissan-6.svg',
  'Subaru':   'https://cdn.worldvectorlogo.com/logos/subaru-2.svg',
  'Mazda':    'https://cdn.worldvectorlogo.com/logos/mazda-4.svg',
  'Lexus':    'https://cdn.worldvectorlogo.com/logos/lexus-2.svg',
  'Suzuki':   'https://cdn.worldvectorlogo.com/logos/suzuki-3.svg',
  'Daihatsu': 'https://cdn.worldvectorlogo.com/logos/daihatsu.svg',
  
  // Importadas
  'BMW':          'https://cdn.worldvectorlogo.com/logos/bmw.svg',
  'Mercedes-Benz':'https://cdn.worldvectorlogo.com/logos/mercedes-benz-9.svg',
  'Audi':         'https://cdn.worldvectorlogo.com/logos/audi-13.svg',
  'Jeep':         'https://cdn.worldvectorlogo.com/logos/jeep-1.svg',
  'Volkswagen':   'https://cdn.worldvectorlogo.com/logos/volkswagen-2.svg',
  'Porsche':      'https://cdn.worldvectorlogo.com/logos/porsche-3.svg',
};

export default function ZeroKmHome() {
  const [marcas, setMarcas] = useState({ Japonesa: [], Importada: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca as marcas distintas na base que têm carros 0KM
    api.get('/zerokm/marcas')
      .then(r => setMarcas(r.data))
      .catch(err => {
        console.error("Erro ao buscar marcas:", err);
        // Exemplo de fallback caso a base ainda não tenha dados
        setMarcas({
          Japonesa: ['Toyota', 'Honda', 'Nissan', 'Subaru', 'Mazda', 'Lexus', 'Suzuki', 'Daihatsu'],
          Importada: ['BMW', 'Mercedes-Benz', 'Audi', 'Jeep', 'Volkswagen', 'Porsche']
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const selectBrand = (brand) => {
    navigate(`/zero-km/${encodeURIComponent(brand)}`);
  };

  return (
    <div className="zerokm-home-page page-enter">
      <div className="zerokm-hero pt-32 pb-16 text-center">
        <div className="container">
          <div className="hero-badge badge badge-gold mx-auto mb-6">✦ Catálogo 0KM</div>
          <h1 className="section-title text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Escolha sua <span>Montadora</span>
          </h1>
          <p className="section-sub mx-auto max-w-2xl text-lg opacity-80">
            Trabalhamos em parceria com as maiores montadoras japonesas e importadores para garantir o melhor negócio no seu veículo 0KM.
          </p>
        </div>
      </div>

      <div className="container py-12">
        {loading ? (
          <div className="spinner mx-auto" style={{ borderTopColor: 'var(--chrome-light)' }} />
        ) : (
          <div className="brands-sections space-y-24">
            
            {/* JAPONESAS */}
            <section className="brand-section">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px bg-[var(--border)] flex-1 hidden md:block"></div>
                <h2 className="text-3xl font-playfair font-semibold text-[var(--chrome-light)] tracking-wide uppercase">
                  Domésticas (Japão)
                </h2>
                <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent flex-1"></div>
              </div>
              
              <div className="brands-grid">
                {marcas.Japonesa.map(brand => (
                  <div key={brand} className="brand-card card cursor-pointer group" onClick={() => selectBrand(brand)}>
                    <div className="h-24 flex items-center justify-center p-4">
                      {BRAND_LOGOS[brand] ? (
                        <img src={BRAND_LOGOS[brand]} alt={brand} className="max-h-16 max-w-full object-contain filter grayscale-[60%] group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110 opacity-90 group-hover:opacity-100 brightness-110 group-hover:brightness-125" />
                      ) : (
                        <span className="text-xl font-bold text-[var(--chrome)] uppercase tracking-wider">{brand}</span>
                      )}
                    </div>
                    <div className="bg-[var(--border)] h-px w-full opacity-50"></div>
                    <div className="p-3 text-center">
                      <span className="text-sm font-medium text-[var(--text-muted)] group-hover:text-[var(--chrome-light)] transition-colors">
                        Ver Modelos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* IMPORTADAS */}
            <section className="brand-section pb-24">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px bg-[var(--border)] flex-1 hidden md:block"></div>
                <h2 className="text-3xl font-playfair font-semibold text-[var(--chrome-light)] tracking-wide uppercase">
                  Importadas
                </h2>
                <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent flex-1"></div>
              </div>
              
              <div className="brands-grid">
                {marcas.Importada.map(brand => (
                  <div key={brand} className="brand-card card cursor-pointer group" onClick={() => selectBrand(brand)}>
                    <div className="h-24 flex items-center justify-center p-4">
                      {BRAND_LOGOS[brand] ? (
                        <img src={BRAND_LOGOS[brand]} alt={brand} className="max-h-16 max-w-full object-contain filter grayscale-[60%] group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110 opacity-90 group-hover:opacity-100 brightness-110 group-hover:brightness-125" />
                      ) : (
                        <span className="text-xl font-bold text-[var(--chrome)] uppercase tracking-wider">{brand}</span>
                      )}
                    </div>
                    <div className="bg-[var(--border)] h-px w-full opacity-50"></div>
                    <div className="p-3 text-center">
                      <span className="text-sm font-medium text-[var(--text-muted)] group-hover:text-[var(--chrome-light)] transition-colors">
                        Ver Modelos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}
