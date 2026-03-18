import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="contato">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h2 className="footer-logo">G<span>-</span>Style <em>Motors</em></h2>
            <p>A melhor experiência em compra e venda de veículos premium. Qualidade e elegância em cada detalhe.</p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram" className="social-btn">IG</a>
              <a href="#" aria-label="Facebook"  className="social-btn">FB</a>
              <a href="#" aria-label="WhatsApp"  className="social-btn">WA</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Links Rápidos</h4>
            <ul>
              <li><Link to="/">Início</Link></li>
              <li><Link to="/estoque">Semi Novo</Link></li>
              <li><a href="/#servicos">Serviços</a></li>
              <li><Link to="/rol-clientes">Rol de Clientes</Link></li>
              <li><Link to="/comunidade">Comunidade</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contato</h4>
            <ul>
              <li>📍 5 Chome-14-2 Showabashitori<br/>Nakagawa Ward, Nagoya, Aichi 454-0852</li>
              <li>📞 (11) 9 9999-9999</li>
              <li>✉️ contato@gstyle.com.br</li>
              <li>🕒 Seg–Sáb: 10h–19h</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} G-Style Motors. Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
