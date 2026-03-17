import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './ZeroKmHome.css';

// Mockup de Logos de marcas para ilustrar o grid de marcas automotivas
// Numa aplicação real, você teria imagens reais salvas ou na collection de Brands
const BRAND_LOGOS = {
  // Japonesas
  'Toyota':   'https://static.cdnlogo.com/logos/t/76/toyota.svg',
  'Honda':    'https://static.cdnlogo.com/logos/h/57/honda.svg',
  'Nissan':   'https://static.cdnlogo.com/logos/n/18/nissan.svg',
  'Subaru':   'https://static.cdnlogo.com/logos/s/39/subaru.svg',
  'Mazda':    'https://static.cdnlogo.com/logos/m/31/mazda.svg',
  'Lexus':    'https://static.cdnlogo.com/logos/l/31/lexus.svg',
  'Suzuki':   'https://static.cdnlogo.com/logos/s/42/suzuki.svg',
  'Daihatsu': 'https://cdn.worldvectorlogo.com/logos/daihatsu.svg',
  
  // Importadas
  'BMW':          'https://static.cdnlogo.com/logos/b/66/bmw.svg',
  'Mercedes-Benz':'https://static.cdnlogo.com/logos/m/32/mercedes-benz.svg',
  'Audi':         'https://static.cdnlogo.com/logos/a/34/audi.svg',
  'Jeep':         'https://static.cdnlogo.com/logos/j/8/jeep.svg',
  'Volkswagen':   'https://static.cdnlogo.com/logos/v/52/volkswagen.svg',
  'Porsche':      'https://static.cdnlogo.com/logos/p/53/porsche.svg',
};

function BrandLogo({ brand }) {
  const src = BRAND_LOGOS[brand];
  if (!src) return <span className="text-xl font-bold text-[var(--chrome)] uppercase tracking-wider">{brand}</span>;
  return (
    <img
      src={src}
      alt={brand}
      className="max-h-16 max-w-full object-contain filter grayscale-[50%] group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110 opacity-90 group-hover:opacity-100 brightness-125 group-hover:brightness-150"
      onError={e => {
        e.target.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.textContent = brand;
        fallback.style.cssText = 'font-size:1.1rem;font-weight:700;color:var(--chrome-light);letter-spacing:0.1em;text-transform:uppercase;';
        e.target.parentNode.appendChild(fallback);
      }}
    />
  );
}

export default function ZeroKmHome() {
  const [marcas, setMarcas] = useState({ Japonesa: [], Importada: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const DEFAULT_MARCAS = {
    Japonesa: ['Toyota', 'Honda', 'Nissan', 'Subaru', 'Mazda', 'Lexus', 'Suzuki', 'Daihatsu'],
    Importada: ['BMW', 'Mercedes-Benz', 'Audi', 'Jeep', 'Volkswagen', 'Porsche']
  };

  useEffect(() => {
    api.get('/zerokm/marcas')
      .then(r => {
        const data = r.data || {};
        // Se a API retornou arrays vazios, usa a lista padrão
        const japonesa = data.Japonesa?.length > 0 ? data.Japonesa : DEFAULT_MARCAS.Japonesa;
        const importada = data.Importada?.length > 0 ? data.Importada : DEFAULT_MARCAS.Importada;
        setMarcas({ Japonesa: japonesa, Importada: importada });
      })
      .catch(() => {
        setMarcas(DEFAULT_MARCAS);
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
                      <BrandLogo brand={brand} />
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
                      <BrandLogo brand={brand} />
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
