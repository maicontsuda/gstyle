import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './ZeroKmHome.css';

// Mockup de Logos de marcas para ilustrar o grid de marcas automotivas
// Numa aplicação real, você teria imagens reais salvas ou na collection de Brands
const BRAND_LOGOS = {
  // Japonesas
  'Toyota': 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Toyota.svg',
  'Honda': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg',
  'Nissan': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Nissan_logo.png',
  'Subaru': 'https://upload.wikimedia.org/wikipedia/de/3/30/Subaru_Logo_V2.svg',
  'Mazda': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Mazda_logo_with_emblem.svg',
  'Lexus': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Lexus_logo.svg',
  'Suzuki': 'https://upload.wikimedia.org/wikipedia/commons/1/12/Suzuki_logo_2.svg',
  'Daihatsu':'https://upload.wikimedia.org/wikipedia/commons/d/de/Daihatsu_red_logo.svg',
  
  // Importadas
  'BMW': 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
  'Mercedes-Benz': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg',
  'Audi': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg',
  'Jeep': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Jeep_logo.svg',
  'Volkswagen': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg',
  'Porsche': 'https://upload.wikimedia.org/wikipedia/en/e/e4/Porsche_Logo.svg'
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
                        <img src={BRAND_LOGOS[brand]} alt={brand} className="max-h-16 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110 opacity-70 group-hover:opacity-100" />
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
                        <img src={BRAND_LOGOS[brand]} alt={brand} className="max-h-16 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110 opacity-70 group-hover:opacity-100" />
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
