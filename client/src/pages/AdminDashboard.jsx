import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('clientes');
  
  // States - Geral
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // States - Clientes
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  
  // Novo State para Anexos
  const [anexoCategoria, setAnexoCategoria] = useState('upload'); // 'upload' ou 'social'
  const [anexosFiles, setAnexosFiles] = useState([]); 
  const [anexoTipoBase, setAnexoTipoBase] = useState('foto'); // 'foto' ou 'documento'
  const [socialForm, setSocialForm] = useState({ tipo: 'post_social', titulo: '', url: '', descricao: '' });

  // Novo State para Registrar Compra inline
  const [estoque, setEstoque] = useState([]);
  const [showCompraForm, setShowCompraForm] = useState(false);
  const [compraForm, setCompraForm] = useState({ carroId: '', valor: '', entrada: '', parcelas: '1', valorParcela: '' });

  // States - Carros (Novo Formulário Avançado)
  const [carroForm, setCarroForm] = useState({
    marca: '', modelo: '', ano: new Date().getFullYear(), preco: '', cor: '', 
    transmissao: 'Automático', tipoCombustivel: 'Gasolina', km: '', garantia: '3 meses', shakenVencimento: ''
  });
  
  // States - Comunidade
  const [pubForm, setPubForm] = useState({ tipo: 'social', titulo: '', imagemUrl: '', linkDestino: '', descricao: '' });

  // States - Propostas de Financiamento (Japão)
  const [propostas, setPropostas] = useState([]);

  // Listas predefinidas para os selects
  const MARCAS = ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Daihatsu', 'Lexus', 'Outra'];
  const ANOS = Array.from({length: 30}, (_, i) => new Date().getFullYear() - i);
  const CORES = ['Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Outra'];

  useEffect(() => {
    if (!authLoading) {
      if (!user || !['admin', 'dono', 'funcionario'].includes(user.tipo_usuario)) {
        navigate('/');
      } else {
        fetchClientes();
        fetchEstoque();
      }
    }
  }, [user, authLoading, navigate]);

  const fetchEstoque = async () => {
    try {
      // Buscar apenas carros disponíveis para vender
      const res = await api.get('/carros?status=disponivel&limit=100');
      setEstoque(res.data.carros || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users').catch(() => ({ data: [] })); 
      setClientes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropostas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/financiamento/propostas');
      setPropostas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS: CLIENTES ---
  // Converter arquivo para Base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAnexosFiles(files);
  };

  const handleAddAnexosMultiplos = async (e) => {
    e.preventDefault();
    if (!selectedCliente) return;

    try {
      setLoading(true);
      let payloadAnexos = [];

      if (anexoCategoria === 'upload') {
        if (anexosFiles.length === 0) {
          setMsg({ type: 'error', text: 'Selecione as imagens/arquivos primeiro.' });
          setLoading(false);
          return;
        }

        // Converte cada file em base64 e monta o objeto do banco
        for (let i = 0; i < anexosFiles.length; i++) {
          const file = anexosFiles[i];
          const base64Str = await toBase64(file);
          payloadAnexos.push({
            tipo: anexoTipoBase,
            titulo: `${file.name}`,
            url: base64Str,
            descricao: `Upload automático do Admin`
          });
        }
      } else {
        // Envio tipo social (1 link)
        if (!socialForm.url) {
           setMsg({ type: 'error', text: 'Informe a URL do post.' });
           setLoading(false);
           return;
        }
        payloadAnexos.push(socialForm);
      }

      await api.patch(`/auth/users/${selectedCliente._id}/anexos`, { anexos: payloadAnexos });
      
      setMsg({ type: 'success', text: `${payloadAnexos.length} anexo(s) salvo(s) com sucesso no cliente!` });
      // Reset forms
      setAnexosFiles([]);
      e.target.reset(); // reset do DOM file input
      if (anexoCategoria === 'social') {
        setSocialForm({ tipo: 'post_social', titulo: '', url: '', descricao: '' });
      }
      
      fetchClientes();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 413) {
         setMsg({ type: 'error', text: 'Erro: Arquivos grandes demais para salvar direto no MongoDB Payload.' });
      } else {
         setMsg({ type: 'error', text: 'Erro ao adicionar anexos.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompra = async (e) => {
    e.preventDefault();
    if (!selectedCliente || !compraForm.carroId) return;
    try {
      setLoading(true);
      const payload = {
        usuario: selectedCliente._id,
        carro: compraForm.carroId,
        valor: parseFloat(compraForm.valor),
        entrada: parseFloat(compraForm.entrada || 0),
        parcelas: parseInt(compraForm.parcelas),
        valorParcela: parseFloat(compraForm.valorParcela)
      };
      await api.post('/compras', payload);
      
      // Opcional: Atualizar o status do carro para "vendido"
      await api.put(`/carros/${compraForm.carroId}`, { status: 'vendido' }).catch(()=>null);

      setMsg({ type: 'success', text: 'Compra registrada com sucesso para este cliente!' });
      setShowCompraForm(false);
      setCompraForm({ carroId: '', valor: '', entrada: '', parcelas: '1', valorParcela: '' });
      fetchEstoque(); // Remove o carro vendido da lista
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Erro ao registrar compra.' });
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS: CARROS ---
  const handleAddCarro = async (e) => {
    e.preventDefault();
    try {
      // Formata os dados para bater com o CarroSchema
      const payload = {
        marca: carroForm.marca,
        modelo: carroForm.modelo,
        ano: parseInt(carroForm.ano),
        valor: parseFloat(carroForm.preco),
        cor: carroForm.cor,
        km: carroForm.km ? parseFloat(carroForm.km) : 0,
        tipoCombustivel: carroForm.tipoCombustivel,
        transmissao: carroForm.transmissao,
        garantia: carroForm.garantia,
        shakenVencimento: carroForm.shakenVencimento ? new Date(carroForm.shakenVencimento) : undefined,
        imagens: [], // Requerer upload separado ou links inseridos posteriormente
        descricao: `Carro adicionado via Admin Dashboard`,
        status: 'disponivel'
      };
      await api.post('/carros', payload);
      setMsg({ type: 'success', text: 'Veículo cadastrado com sucesso!' });
      // Reset form
      setCarroForm({...carroForm, preco: '', modelo: '', km: ''});
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Erro ao cadastrar carro.' });
    }
  };

  // --- HANDLERS: COMUNIDADE ---
  const handleAddPublicacao = async (e) => {
    e.preventDefault();
    try {
      await api.post('/publicacoes', pubForm);
      setMsg({ type: 'success', text: 'Publicação de Comunidade adicionada!' });
      setPubForm({ tipo: 'social', titulo: '', imagemUrl: '', linkDestino: '', descricao: '' });
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Erro ao postar na comunidade.' });
    }
  };

  // --- HANDLERS: PROPOSTAS ---
  const handleUpdateProposta = async (id, novoStatus) => {
    try {
      await api.patch(`/financiamento/propostas/${id}`, { status: novoStatus });
      setMsg({ type: 'success', text: `Status da proposta atualizado para ${novoStatus}.` });
      fetchPropostas();
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Erro ao atualizar status da proposta.' });
    }
  };

  if (authLoading || !user) return <div className="spinner" style={{marginTop: 100}}/>;

  return (
    <div className="admin-page page-enter">
      <div className="container">
        
        <div className="admin-header">
          <h1 className="section-title">Painel de <span>Administração</span></h1>
          <p className="section-sub">Gestão de clientes, veículos do estoque e publicações gerais do site.</p>
        </div>

        {msg && <div className={`msg-alert ${msg.type}`}>{msg.text}</div>}

        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'clientes' ? 'active' : ''}`} onClick={() => { setActiveTab('clientes'); fetchClientes(); }}>
            Gestão de Clientes
          </button>
          <button className={`tab-btn ${activeTab === 'carros' ? 'active' : ''}`} onClick={() => setActiveTab('carros')}>
            Adicionar Veículo
          </button>
          <button className={`tab-btn ${activeTab === 'comunidade' ? 'active' : ''}`} onClick={() => setActiveTab('comunidade')}>
            Gerir Comunidade
          </button>
          <button className={`tab-btn ${activeTab === 'propostas' ? 'active' : ''}`} onClick={() => { setActiveTab('propostas'); fetchPropostas(); }}>
            Propostas de Crédito
          </button>
        </div>

        <div className="admin-content card">
          
          {/* ABA 1: CLIENTES */}
          {activeTab === 'clientes' && (
            <div className="slide-in">
              <h3>Clientes Cadastrados</h3>
              <p className="muted-text">Selecione um cliente para anexar contratos, fotos ou links de redes sociais vinculados a ele.</p>
              
              <div className="admin-clientes-layout">
                <div className="clientes-list-col">
                  {loading ? <div className="spinner small"/> : (
                    <ul className="clientes-list">
                      {clientes.length === 0 ? <li>Nenhum cliente encontrado. (Crie a rota GET /api/auth/users no backend)</li> : null}
                      {clientes.map(c => (
                        <li key={c._id} className={selectedCliente?._id === c._id ? 'active' : ''} onClick={() => setSelectedCliente(c)}>
                          <strong>{c.username}</strong>
                          <span>{c.email}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="cliente-detail-col">
                  {selectedCliente ? (
                    <div className="cliente-form-wrapper">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <h4>Gerenciar Cliente: {selectedCliente.username}</h4>
                         <button className="btn btn-outline" onClick={() => setShowCompraForm(!showCompraForm)}>
                           {showCompraForm ? 'Voltar para Anexos' : '➕ Registrar Compra'}
                         </button>
                      </div>
                      
                      {showCompraForm ? (
                        <div className="compra-inline-wrapper" style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-card2)', borderRadius: '8px' }}>
                          <h5 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Registrar Nova Venda</h5>
                          <form className="admin-form" onSubmit={handleAddCompra}>
                            <div className="form-group">
                              <label>Veículo (Estoque Disponível)</label>
                              <select required value={compraForm.carroId} onChange={e => setCompraForm({...compraForm, carroId: e.target.value})}>
                                <option value="">Selecione o carro vendido...</option>
                                {estoque.map(car => (
                                  <option key={car._id} value={car._id}>
                                    {car.marca} {car.modelo} - Ano {car.ano} (¥{car.valor})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Valor Acordado (¥)</label>
                                <input type="number" required placeholder="Ex: 800000" value={compraForm.valor} onChange={e => setCompraForm({...compraForm, valor: e.target.value})} />
                              </div>
                              <div className="form-group">
                                <label>Entrada (¥)</label>
                                <input type="number" placeholder="Ex: 200000" value={compraForm.entrada} onChange={e => setCompraForm({...compraForm, entrada: e.target.value})} />
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Qtd. Parcelas</label>
                                <input type="number" required min="1" max="120" placeholder="Ex: 24" value={compraForm.parcelas} onChange={e => setCompraForm({...compraForm, parcelas: e.target.value})} />
                              </div>
                              <div className="form-group">
                                <label>Valor da Parcela (¥)</label>
                                <input type="number" required placeholder="Ex: 25000" value={compraForm.valorParcela} onChange={e => setCompraForm({...compraForm, valorParcela: e.target.value})} />
                              </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }} disabled={loading}>
                              {loading ? 'Registrando...' : 'Confirmar Venda e Atrelar ao Cliente'}
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div style={{ marginTop: '20px' }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                             <button type="button" className={`btn ${anexoCategoria === 'upload' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAnexoCategoria('upload')}>Múltiplos Uploads (Fotos/PDF)</button>
                             <button type="button" className={`btn ${anexoCategoria === 'social' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAnexoCategoria('social')}>Vincular Rede Social</button>
                          </div>

                          <form className="admin-form" onSubmit={handleAddAnexosMultiplos}>
                            {anexoCategoria === 'upload' ? (
                              <>
                                <div className="form-group">
                                  <label>Tipo dos Arquivos Selecionados</label>
                                  <select value={anexoTipoBase} onChange={e => setAnexoTipoBase(e.target.value)}>
                                    <option value="foto">Fotos (Registros de Entrega)</option>
                                    <option value="documento">Documentos (Contrato/Recibo PDF)</option>
                                  </select>
                                </div>
                                <div className="form-group">
                                  <label>Selecionar Múltiplos Arquivos</label>
                                  <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*,application/pdf" 
                                    onChange={handleFileSelect} 
                                    style={{ padding: '10px 0' }}
                                  />
                                  <small className="muted-text">Selecione vários arquivos de uma vez segurando CTRL (ou CMD).</small>
                                  {anexosFiles.length > 0 && (
                                    <div style={{marginTop: '10px', fontSize: '0.9rem', color: 'var(--primary)'}}>
                                      {anexosFiles.length} arquivo(s) preparado(s) para upload. Limitado pelo Vercel 4.5MB Payload, prefira enviar poucas fotos por vez.
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="form-group">
                                  <label>Título / Referência</label>
                                  <input type="text" required placeholder="Ex: Entrega do Prius no Instagram" value={socialForm.titulo} onChange={e => setSocialForm({...socialForm, titulo: e.target.value})} />
                                </div>
                                <div className="form-group">
                                  <label>URL / Link do Post</label>
                                  <input type="url" required placeholder="https://instagram.com/..." value={socialForm.url} onChange={e => setSocialForm({...socialForm, url: e.target.value})} />
                                </div>
                                <div className="form-group">
                                  <label>Descrição Opcional</label>
                                  <textarea placeholder="Observações..." value={socialForm.descricao} onChange={e => setSocialForm({...socialForm, descricao: e.target.value})}></textarea>
                                </div>
                              </>
                            )}
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                              {loading ? 'Enviando...' : 'Salvar no Perfil do Cliente'}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="empty-selection">
                      Selecione um cliente na lista à esquerda para gerenciar.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: CARROS (Avançado) */}
          {activeTab === 'carros' && (
            <div className="slide-in">
              <h3>Adicionar Carro ao Estoque</h3>
              <p className="muted-text">Preencha os dados do veículo selecionando as opções para garantir padronização.</p>
              
              <form className="admin-form carro-form" onSubmit={handleAddCarro}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Marca</label>
                    <select required value={carroForm.marca} onChange={e => setCarroForm({...carroForm, marca: e.target.value})}>
                      <option value="">Selecione...</option>
                      {MARCAS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Modelo</label>
                    <input type="text" required placeholder="Ex: Prius L" value={carroForm.modelo} onChange={e => setCarroForm({...carroForm, modelo: e.target.value})} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ano de Fabricação</label>
                    <select value={carroForm.ano} onChange={e => setCarroForm({...carroForm, ano: e.target.value})}>
                      {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Cor Predominante</label>
                    <select value={carroForm.cor} onChange={e => setCarroForm({...carroForm, cor: e.target.value})}>
                      <option value="">Selecione...</option>
                      {CORES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Valor (¥)</label>
                    <input type="number" required placeholder="Ex: 850000" value={carroForm.preco} onChange={e => setCarroForm({...carroForm, preco: e.target.value})} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Transmissão</label>
                    <select value={carroForm.transmissao} onChange={e => setCarroForm({...carroForm, transmissao: e.target.value})}>
                      <option value="Automático">Automático</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Combustível</label>
                    <select value={carroForm.tipoCombustivel} onChange={e => setCarroForm({...carroForm, tipoCombustivel: e.target.value})}>
                      <option value="Gasolina">Gasolina</option>
                      <option value="Híbrido">Híbrido</option>
                      <option value="Elétrico">Elétrico</option>
                      <option value="Diesel">Diesel</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quilometragem (KM)</label>
                    <input type="number" required placeholder="Ex: 45000" value={carroForm.km} onChange={e => setCarroForm({...carroForm, km: e.target.value})} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Vencimento do Shaken (Data)</label>
                    <input type="date" value={carroForm.shakenVencimento} onChange={e => setCarroForm({...carroForm, shakenVencimento: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Garantia G-Style</label>
                    <select value={carroForm.garantia} onChange={e => setCarroForm({...carroForm, garantia: e.target.value})}>
                      <option value="Sem Garantia">Sem Garantia</option>
                      <option value="1 mês">1 Mês</option>
                      <option value="3 meses">3 Meses</option>
                      <option value="6 meses">6 Meses</option>
                      <option value="1 ano">1 Ano</option>
                      <option value="2 anos">2 Anos</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">➕ Salvar e Publicar Veículo</button>
                </div>
              </form>
            </div>
          )}

          {/* ABA 3: COMUNIDADE */}
          {activeTab === 'comunidade' && (
            <div className="slide-in">
              <h3>Adicionar Publicação / Parceiro</h3>
              <p className="muted-text">Alimente a página da comunidade com eventos futuros, parceiros da loja e links de redes sociais de destaque.</p>

              <form className="admin-form max-form" onSubmit={handleAddPublicacao}>
                <div className="form-group">
                  <label>Tipo de Publicação</label>
                  <select value={pubForm.tipo} onChange={e => setPubForm({...pubForm, tipo: e.target.value})}>
                    <option value="evento">Evento Automotivo</option>
                    <option value="parceiro">Novo Parceiro de Negócios</option>
                    <option value="social">Destaque de Rede Social (TikTok/Insta)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Título Curto</label>
                  <input type="text" required placeholder="Ex: Parceria com Oficina XYZ" value={pubForm.titulo} onChange={e => setPubForm({...pubForm, titulo: e.target.value})} />
                </div>
                {pubForm.tipo !== 'social' && (
                  <div className="form-group">
                    <label>Capa/Logo (URL da Imagem)</label>
                    <input type="text" placeholder="https://..." value={pubForm.imagemUrl} onChange={e => setPubForm({...pubForm, imagemUrl: e.target.value})} />
                  </div>
                )}
                <div className="form-group">
                  <label>Link Destino (Opcional)</label>
                  <input type="text" placeholder={pubForm.tipo === 'social' ? 'Obrigatório: https://instagram.com/p/...' : 'Opcional. Ex: site do evento'} required={pubForm.tipo === 'social'} value={pubForm.linkDestino} onChange={e => setPubForm({...pubForm, linkDestino: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Descrição Breve</label>
                  <textarea placeholder="Fale um pouco sobre o parceiro ou evento..." value={pubForm.descricao} onChange={e => setPubForm({...pubForm, descricao: e.target.value})}></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Publicar na Comunidade</button>
              </form>
            </div>
          )}

          {/* ABA 4: PROPOSTAS DE CRÉDITO */}
          {activeTab === 'propostas' && (
            <div className="slide-in">
              <h3>Propostas de Financiamento / Pré-Aprovação</h3>
              <p className="muted-text">Pedidos enviados através da tela de Simulação da Financeira (Público).</p>
              
              {loading ? <div className="spinner"/> : (
                <div className="propostas-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                  {propostas.length === 0 ? <p>Nenhuma proposta de crédito recebida até o momento.</p> : null}
                  {propostas.map(p => (
                    <div key={p._id} className="proposta-card card" style={{ padding: '20px', borderLeft: p.status === 'pendente' ? '4px solid #f59e0b' : p.status === 'aprovada' ? '4px solid #10b981' : '4px solid #ef4444' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>{p.nomeCompleto}</h4>
                          <p><strong>Telefone:</strong> {p.telefone}</p>
                          <p><strong>E-mail:</strong> {p.email || 'Não informado'}</p>
                          <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '12px 0' }}/>
                          <p><strong>Status do Visto:</strong> {p.tipoVisto}</p>
                          <p><strong>Situação:</strong> {p.tipoEmprego}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ 
                            display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase',
                            background: p.status === 'pendente' ? 'rgba(245, 158, 11, 0.2)' : p.status === 'aprovada' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: p.status === 'pendente' ? '#f59e0b' : p.status === 'aprovada' ? '#10b981' : '#ef4444'
                          }}>{p.status}</span>
                          <div style={{ marginTop: '16px' }}>
                            <p style={{ fontSize: '1.2rem', fontWeight: '800' }}>¥ {p.valorDesejado.toLocaleString('ja-JP')} <span style={{fontSize:'0.8rem',fontWeight:'normal',color:'var(--text-muted)'}}>Pedido</span></p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Entrada: ¥ {p.entrada.toLocaleString('ja-JP')}</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Prazo: {p.parcelas}x</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="proposta-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                        {p.status === 'pendente' && (
                          <>
                            <button className="btn" style={{ background: '#10b981', color: '#fff' }} onClick={() => handleUpdateProposta(p._id, 'aprovada')}>Marcar como Aprovada</button>
                            <button className="btn" style={{ background: '#ef4444', color: '#fff' }} onClick={() => handleUpdateProposta(p._id, 'recusada')}>Marcar como Recusada</button>
                          </>
                        )}
                        {p.status !== 'pendente' && (
                           <button className="btn btn-outline" onClick={() => handleUpdateProposta(p._id, 'pendente')}>Voltar para Pendente</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
