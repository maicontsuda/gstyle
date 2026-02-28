import './Contato.css';

export default function Contato() {
  return (
    <div className="page-enter contato-page">
      <div className="container section">
        <div className="accent-line" />
        <h1 className="section-title">Entre em <span>Contato</span></h1>
        <p className="section-sub">Estamos aqui para ajudar. Fale conosco!</p>

        <div className="contato-grid">
          {/* Informações */}
          <div className="contato-info">
            <div className="info-card">
              <div className="info-icon">📍</div>
              <div>
                <h3>Endereço</h3>
                <p>Rua Exemplo, 1234 – Bairro<br />Cidade, Estado – CEP 00000-000</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">📞</div>
              <div>
                <h3>Telefone / WhatsApp</h3>
                <p>
                  <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">
                    (11) 99999-9999
                  </a>
                </p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">🕐</div>
              <div>
                <h3>Horário de Funcionamento</h3>
                <p>Segunda a Sexta: 9h – 18h<br />Sábado: 9h – 13h</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">📱</div>
              <div>
                <h3>Redes Sociais</h3>
                <div className="social-links">
                  <a href="https://instagram.com" target="_blank" rel="noreferrer">📸 Instagram</a>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer">📘 Facebook</a>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa placeholder */}
          <div className="contato-mapa">
            <div className="mapa-placeholder">
              <p>🗺️</p>
              <h3>Localização</h3>
              <p>Em breve o mapa interativo será integrado aqui.</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{ marginTop: 20 }}
              >
                Ver no Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
