import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Perfil.css';

// Prefeituras reais do Japão
const PREFEITURAS_JAPAO = [
  "Aichi", "Akita", "Aomori", "Chiba", "Ehime", "Fukui", "Fukuoka", "Fukushima", "Gifu", "Gunma", 
  "Hiroshima", "Hokkaido", "Hyogo", "Ibaraki", "Ishikawa", "Iwate", "Kagawa", "Kagoshima", "Kanagawa", 
  "Kochi", "Kumamoto", "Kyoto", "Mie", "Miyagi", "Miyazaki", "Nagano", "Nagasaki", "Nara", "Niigata", 
  "Oita", "Okayama", "Okinawa", "Osaka", "Saga", "Saitama", "Shiga", "Shimane", "Shizuoka", "Tochigi", 
  "Tokushima", "Tokyo", "Tottori", "Toyama", "Wakayama", "Yamagata", "Yamaguchi", "Yamanashi"
];

function formatPrice(v) {
  return v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}
function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function Perfil() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('compras'); 
  
  // States para Compras
  const [compras, setCompras] = useState([]);
  const [loadingCompras, setLoadingCompras] = useState(true);

  // States para Formulário Dados Pessoais e Rol
  const [formData, setFormData] = useState({
    telefone: '', pais: 'Japão', prefeitura: '', cidade: '', bairro: '', cep: ''
  });
  const [rolVisivel, setRolVisivel] = useState(false);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [msgPerfil, setMsgPerfil] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) {
      // Preencher formulário de dados e rol
      setFormData({
        telefone: user.telefone || '',
        pais: user.endereco?.pais || 'Japão',
        prefeitura: user.endereco?.prefeitura || '',
        cidade: user.endereco?.cidade || '',
        bairro: user.endereco?.bairro || '',
        cep: user.endereco?.cep || ''
      });
      setRolVisivel(user.rolCliente?.visivel || false);

      // Carregar histórico de compras
      api.get('/compras/minhas')
        .then(r => setCompras(r.data))
        .catch(err => console.error("Erro ao puxar compras", err))
        .finally(() => setLoadingCompras(false));
    }
  }, [user, authLoading, navigate]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSavePerfil = async (e) => {
    e.preventDefault();
    setSavingPerfil(true);
    setMsgPerfil(null);
    try {
      const payload = {
        telefone: formData.telefone,
        endereco: {
          pais: formData.pais,
          prefeitura: formData.prefeitura,
          cidade: formData.cidade,
          bairro: formData.bairro,
          cep: formData.cep
        }
      };
      
      // Update basic info
      await api.patch('/auth/me', payload);
      
      // Update rol settings
      await api.patch('/auth/me/rol', { visivel: rolVisivel });

      setMsgPerfil({ type: 'success', text: 'Dados atualizados com sucesso!' });
      // Atualiza o user global silenciosamente chamando /auth/me novamente (reaproveita logica do AuthContext)
      // Passar o mesmo token q ja esta lá
      const token = localStorage.getItem('gstyle_token');
      if (token) login(token); 
    } catch {
      setMsgPerfil({ type: 'error', text: 'Erro ao salvar. Tente novamente.' });
    } finally {
      setSavingPerfil(false);
    }
  };

  if (authLoading) return <div className="spinner" style={{ marginTop: 140 }} />;
  if (!user) return null;

  return (
    <div className="perfil-page page-enter">
      <div className="container">

        {/* Header do perfil */}
        <div className="perfil-header">
          <div className="perfil-avatar-wrap">
            <img src={user.thumbnail || 'https://via.placeholder.com/150'} alt={user.username} className="perfil-avatar" />
          </div>
          <div className="perfil-info">
            <div className={`perfil-badge badge ${user.tipo_usuario !== 'cliente' ? 'badge-primary' : 'badge-gold'}`}>
              {user.tipo_usuario === 'admin' ? 'Administrador' : user.tipo_usuario === 'dono' ? 'Proprietário' : user.tipo_usuario === 'funcionario' ? 'Funcionário' : 'Cliente G-Style'}
            </div>
            <h1 className="perfil-name">{(user.username || user.nome || 'Usuário').split(' ')[0]}</h1>
            <p className="perfil-email">{user.email}</p>
            <p className="perfil-since">Membro desde {formatDate(user.createdAt)}</p>
          </div>
          <button onClick={logout} className="btn btn-ghost perfil-logout">Sair da conta</button>
        </div>

        <div className="divider" />

        <div className="perfil-tabs">
          <button className={`tab-btn ${activeTab === 'compras' ? 'active' : ''}`} onClick={() => setActiveTab('compras')}>
            Histórico de Compras
          </button>
          <button className={`tab-btn ${activeTab === 'favoritos' ? 'active' : ''}`} onClick={() => setActiveTab('favoritos')}>
            Meus Favoritos
          </button>
          <button className={`tab-btn ${activeTab === 'dados' ? 'active' : ''}`} onClick={() => setActiveTab('dados')}>
            Dados Pessoais
          </button>
        </div>

        <div className="perfil-content">
          
          {/* TAB: COMPRAS */}
          {activeTab === 'compras' && (
            <div className="tab-pane active slide-in">
              <h2 className="section-title">Histórico de <span>Compras</span></h2>
              <p className="section-sub">Acompanhe seus contratos e informações de parcelas.</p>

              {loadingCompras ? (
                <div className="spinner" />
              ) : compras.length === 0 ? (
                <div className="perfil-empty">
                  <p>📜</p>
                  <p>Ainda não há histórico de compras registrado na sua conta.</p>
                  <Link to="/estoque" className="btn btn-outline" style={{ marginTop: 16 }}>Explorar estoque</Link>
                </div>
              ) : (
                <div className="compras-list">
                  {compras.map(c => (
                    <div key={c._id} className="compra-card card">
                      <div className="compra-header">
                        <div>
                          <span className={`badge badge-status ${c.status === 'quitado' ? 'badge-green' : c.status === 'em_atraso' ? 'badge-red' : 'badge-gold'}`}>
                            {c.status === 'quitado' ? '✅ Quitado' : c.status === 'em_atraso' ? '⚠️ Em Atraso' : '💳 Em dia'}
                          </span>
                          <span className="compra-data">Comprado em {formatDate(c.dataCompra)}</span>
                        </div>
                        <h3>{c.carro ? `${c.carro.marca} ${c.carro.modelo}` : 'Veículo Removido'}</h3>
                      </div>
                      
                      <div className="compra-body">
                        {c.carro && c.carro.imagens && c.carro.imagens[0] && (
                          <div className="compra-img">
                            <img src={c.carro.imagens[0]} alt="Carro" />
                          </div>
                        )}
                        <div className="compra-stats">
                          <div className="stat-box">
                            <span className="label">Valor Total</span>
                            <span className="value">{formatPrice(c.valor)}</span>
                          </div>
                          <div className="stat-box">
                            <span className="label">Entrada</span>
                            <span className="value">{formatPrice(c.entrada)}</span>
                          </div>
                          <div className="stat-box destaque">
                            <span className="label">Parcela</span>
                            <span className="value">{formatPrice(c.valorParcela)}</span>
                          </div>
                        </div>

                        <div className="compra-progress">
                          <div className="progress-text">
                            <span>Progresso do pagamento</span>
                            <strong>{c.parcelasPagas} de {c.parcelas} parcelas</strong>
                          </div>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar" style={{ width: `${(c.parcelasPagas / c.parcelas) * 100}%` }}></div>
                          </div>
                          {c.parcelas - c.parcelasPagas > 0 && (
                            <p className="parcelas-restantes">Faltam <strong>{c.parcelas - c.parcelasPagas}</strong> parcelas para quitar o veículo.</p>
                          )}
                        </div>

                        {c.contratoImagem && (
                          <div className="compra-contrato">
                            <a href={c.contratoImagem} target="_blank" rel="noreferrer" className="btn btn-outline btn-small">
                              📄 Ver Contrato Assinado
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: FAVORITOS */}
          {activeTab === 'favoritos' && (
            <div className="tab-pane active slide-in">
              <h2 className="section-title">Meus <span>Favoritos</span></h2>
              <p className="section-sub">Veículos que você marcou para acompanhar.</p>
              
              <div className="perfil-empty">
                <p>⭐</p>
                <p>Nenhum carro favoritado.</p>
                <p className="muted-text">Em breve você poderá favoritar carros pelo estoque.</p>
                <Link to="/estoque" className="btn btn-outline" style={{ marginTop: 16 }}>Explorar estoque</Link>
              </div>
            </div>
          )}

          {/* TAB: DADOS PESSOAIS */}
          {activeTab === 'dados' && (
            <div className="tab-pane active slide-in">
              <h2 className="section-title">Dados <span>Pessoais</span></h2>
              <p className="section-sub">Mantenha seu contato e endereço no Japão atualizados.</p>
              <div className="perfil-alert">
                ℹ️ Estes dados são visíveis apenas para você e a equipe G-Style, e são usados para acelerar o processo de compra do seu veículo.
              </div>

              <form className="perfil-form" onSubmit={handleSavePerfil}>
                <div className="form-group">
                  <label>Telefone / Celular</label>
                  <input type="text" name="telefone" value={formData.telefone} onChange={handleFormChange} placeholder="Ex: 090-1234-5678" />
                </div>
                
                <h3 className="form-section-title">Endereço no Japão</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>País</label>
                    <input type="text" name="pais" value={formData.pais} disabled className="input-disabled" />
                  </div>
                  
                  <div className="form-group">
                    <label>Prefeitura (Ken/Fu/To/Do)</label>
                    <select name="prefeitura" value={formData.prefeitura} onChange={handleFormChange}>
                      <option value="">Selecione...</option>
                      {PREFEITURAS_JAPAO.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Cidade (Shi/Ku/Gun)</label>
                    <input type="text" name="cidade" value={formData.cidade} onChange={handleFormChange} placeholder="Ex: Hamamatsu-shi" />
                  </div>
                  <div className="form-group">
                    <label>Bairro e Chome</label>
                    <input type="text" name="bairro" value={formData.bairro} onChange={handleFormChange} placeholder="Ex: Naka-ku, 1-2-3" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Código Postal (CEP/Zip)</label>
                  <input type="text" name="cep" value={formData.cep} onChange={handleFormChange} placeholder="Ex: 430-0934" />
                </div>
                
                <h3 className="form-section-title">Galeria: Rol de Clientes</h3>
                <div className="perfil-alert" style={{ background: 'rgba(255,165,0,0.1)', borderLeftColor: 'orange' }}>
                  Queremos celebrar a sua conquista! Marque abaixo se deseja que sua foto de perfil (ou foto da entrega anexada pela loja) apareça na nossa galeria pública "Rol de Clientes".
                </div>
                
                <div className="form-row" style={{ alignItems: 'center' }}>
                  <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="checkbox" 
                      id="rolVisivel"
                      style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                      checked={rolVisivel} 
                      onChange={e => setRolVisivel(e.target.checked)} 
                    />
                    <label htmlFor="rolVisivel" style={{ margin: 0, cursor: 'pointer', fontSize: '1rem' }}>
                      Mostrar meu perfil no Rol de Clientes público
                    </label>
                  </div>
                </div>

                {msgPerfil && (
                  <div className={`msg-alert ${msgPerfil.type}`}>
                    {msgPerfil.text}
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-save-perfil" disabled={savingPerfil}>
                  {savingPerfil ? 'Salvando...' : '💾 Salvar Alterações'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
