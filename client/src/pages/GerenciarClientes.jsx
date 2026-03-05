import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ADMIN_ROLES = ['admin', 'dono', 'gerente', 'funcionario'];
const TIPO_MANUTENCAO = { oleo:'Troca de Óleo', filtro_oleo:'Filtro de Óleo', filtro_ar:'Filtro de Ar', filtro_combustivel:'Filtro Combustível', shaken:'Shaken', revisao:'Revisão Geral', pneu:'Pneu', freio:'Freio', outro:'Outro' };
const TIPO_LEMBRETE = { shaken:'Shaken', revisao:'Revisão', parcela:'Parcela', documentos:'Documentos', outro:'Outro' };

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ja-JP');
}
function formatYen(v) {
  if (!v) return '—';
  return '¥ ' + Number(v).toLocaleString('ja-JP');
}

// ── Abas do Drawer ─────────────────────────────────────────────────────────
const TABS = ['Geral','Financiamento','Manutenção','Documentos','Rol de Clientes','Lembretes'];

export default function GerenciarClientes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Formulários locais
  const [formVeiculo, setFormVeiculo] = useState({});
  const [formFin, setFormFin] = useState({});
  const [formManutencao, setFormManutencao] = useState({ tipo:'oleo', data:'', kmAtual:'', kmProxima:'', dataProxima:'', observacoes:'' });
  const [formLembrete, setFormLembrete] = useState({ tipo:'shaken', mensagem:'' });
  const [fotoEntregaPreview, setFotoEntregaPreview] = useState('');
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const isAdmin = user && ADMIN_ROLES.includes(user.tipo_usuario);

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    api.get('/auth/users').then(r => setClientes(r.data)).finally(() => setLoading(false));
  }, [isAdmin, navigate]);

  const abrirCliente = useCallback((c) => {
    setSelecionado(c);
    setTab(0);
    setFormVeiculo(c.veiculo || {});
    setFormFin(c.financiamento || {});
    setFotoEntregaPreview(c.rolCliente?.fotoEntrega || '');
    setMsg('');
  }, []);

  const refreshCliente = async (id) => {
    const { data } = await api.get(`/auth/users/${id}`);
    setSelecionado(data);
    setClientes(prev => prev.map(c => c._id === id ? data : c));
    return data;
  };

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  // ── Salvar Veículo ────────
  const salvarVeiculo = async () => {
    setSaving(true);
    try {
      await api.patch(`/auth/users/${selecionado._id}/veiculo`, formVeiculo);
      await refreshCliente(selecionado._id);
      showMsg('✅ Dados do veículo salvos!');
    } catch { showMsg('❌ Erro ao salvar.'); }
    setSaving(false);
  };

  // ── Salvar Financiamento ──
  const salvarFin = async () => {
    setSaving(true);
    try {
      await api.patch(`/auth/users/${selecionado._id}/financiamento`, formFin);
      await refreshCliente(selecionado._id);
      showMsg('✅ Financiamento salvo!');
    } catch { showMsg('❌ Erro ao salvar.'); }
    setSaving(false);
  };

  // ── Adicionar Manutenção ──
  const addManutencao = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.post(`/auth/users/${selecionado._id}/manutencao`, formManutencao);
      setSelecionado(updated.data);
      setClientes(prev => prev.map(c => c._id === updated.data._id ? updated.data : c));
      setFormManutencao({ tipo:'oleo', data:'', kmAtual:'', kmProxima:'', dataProxima:'', observacoes:'' });
      showMsg('✅ Registro adicionado!');
    } catch { showMsg('❌ Erro ao adicionar.'); }
    setSaving(false);
  };

  const delManutencao = async (mid) => {
    if (!window.confirm('Remover este registro?')) return;
    const updated = await api.delete(`/auth/users/${selecionado._id}/manutencao/${mid}`);
    setSelecionado(updated.data);
  };

  // ── Upload foto de entrega ──
  const handleFotoEntrega = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFoto(true);
    const formData = new FormData();
    formData.append('imagens', file);
    try {
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = data.urls[0];
      setFotoEntregaPreview(url);
      await api.patch(`/auth/users/${selecionado._id}/rol-foto`, { fotoEntrega: url });
      await refreshCliente(selecionado._id);
      showMsg('✅ Foto de entrega salva!');
    } catch { showMsg('❌ Erro ao fazer upload.'); }
    setUploadingFoto(false);
  };


  // ── Adicionar lembrete ──
  const addLembrete = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.post(`/auth/users/${selecionado._id}/lembrete`, formLembrete);
      setSelecionado(updated.data);
      setFormLembrete({ tipo:'shaken', mensagem:'' });
      showMsg('✅ Lembrete adicionado!');
    } catch { showMsg('❌ Erro.'); }
    setSaving(false);
  };

  // ── Financiamento: contador ──
  const parcelasRestantes = selecionado
    ? Math.max(0, (selecionado.financiamento?.totalParcelas||0) - (selecionado.financiamento?.parcelasPagas||0))
    : 0;
  const pct = selecionado && selecionado.financiamento?.totalParcelas > 0
    ? Math.round((selecionado.financiamento.parcelasPagas / selecionado.financiamento.totalParcelas) * 100)
    : 0;

  const clientesFiltrados = clientes.filter(c =>
    c.username?.toLowerCase().includes(busca.toLowerCase()) ||
    c.email?.toLowerCase().includes(busca.toLowerCase())
  );

  if (!isAdmin) return null;

  return (
    <div className="page-enter bg-[var(--bg-deep)] min-h-screen pt-28 pb-16">
      <div className="container">
        {/* Header */}
        <div className="mb-8 border-b border-[var(--border)] pb-6">
          <span className="badge badge-gold mb-3">Admin</span>
          <h1 className="text-4xl font-playfair font-bold text-[var(--chrome-light)]">Gerenciar Clientes</h1>
          <p className="text-[var(--text-muted)] mt-2">{clientes.length} clientes cadastrados</p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Lista de clientes */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <input
              value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="🔍 Buscar cliente..."
              className="w-full mb-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--chrome)]"
            />
            {loading ? <div className="spinner" /> : (
              <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
                {clientesFiltrados.map(c => (
                  <button
                    key={c._id}
                    onClick={() => abrirCliente(c)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${selecionado?._id === c._id ? 'border-[var(--chrome)] bg-[var(--chrome)]/10' : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--chrome-dark)]'}`}
                  >
                    <img src={c.thumbnail || `https://api.dicebear.com/7.x/initials/svg?seed=${c.username}`} className="w-9 h-9 rounded-full object-cover" alt="" />
                    <div className="overflow-hidden">
                      <div className="font-semibold text-sm text-[var(--chrome-light)] truncate">{c.username}</div>
                      <div className="text-xs text-[var(--text-muted)] truncate">{c.tipo_usuario}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* Painel do cliente */}
          {selecionado ? (
            <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden min-h-[75vh]">
              {/* Topo do drawer */}
              <div className="p-5 border-b border-[var(--border)] flex items-center gap-4 bg-black/20">
                <img src={selecionado.thumbnail || `https://api.dicebear.com/7.x/initials/svg?seed=${selecionado.username}`} className="w-12 h-12 rounded-full ring-2 ring-[var(--chrome)]" alt="" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">{selecionado.username}</h2>
                  <p className="text-sm text-[var(--text-muted)] mb-2">{selecionado.email}</p>
                  <select
                    value={selecionado.tipo_usuario}
                    onChange={async (e) => {
                      try {
                        const { data } = await api.patch(`/auth/users/${selecionado._id}/tipo`, { tipo_usuario: e.target.value });
                        setSelecionado(data);
                        setClientes(prev => prev.map(c => c._id === data._id ? data : c));
                        showMsg('✅ Papel atualizado!');
                      } catch { showMsg('❌ Erro ao atualizar.'); }
                    }}
                    className="bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-white outline-none cursor-pointer focus:border-[var(--chrome)] capitalize"
                  >
                    <option value="cliente">👤 Cliente</option>
                    <option value="funcionario">🧑‍💼 Funcionário</option>
                    <option value="gerente">📋 Gerente</option>
                    <option value="dono">👑 Dono</option>
                    <option value="admin">🔒 Admin</option>
                  </select>
                </div>
                {msg && <span className="ml-auto text-sm font-semibold text-[var(--chrome-light)] shrink-0">{msg}</span>}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[var(--border)] overflow-x-auto">
                {TABS.map((t, i) => (
                  <button key={i} onClick={() => setTab(i)}
                    className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${tab === i ? 'text-[var(--chrome-light)] border-b-2 border-[var(--chrome-light)]' : 'text-[var(--text-muted)] hover:text-white'}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">

                {/* ── Aba Geral ── */}
                {tab === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[var(--chrome-light)] mb-4">🚘 Informações do Veículo</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[['Marca','marca'],['Modelo','modelo'],['Cor','cor'],['Placa','placa'],['Chassi','chassi']].map(([label, key]) => (
                        <div key={key}>
                          <label className="text-xs text-[var(--text-muted)] uppercase font-semibold mb-1 block">{label}</label>
                          <input value={formVeiculo[key]||''} onChange={e => setFormVeiculo(p=>({...p,[key]:e.target.value}))}
                            className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[var(--chrome)]" />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs text-[var(--text-muted)] uppercase font-semibold mb-1 block">Ano</label>
                        <input type="number" value={formVeiculo.ano||''} onChange={e => setFormVeiculo(p=>({...p,ano:e.target.value}))}
                          className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[var(--chrome)]" />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--text-muted)] uppercase font-semibold mb-1 block">Shaken Vencimento</label>
                        <input type="date" value={formVeiculo.shakenVencimento ? formVeiculo.shakenVencimento.slice(0,10) : ''} onChange={e => setFormVeiculo(p=>({...p,shakenVencimento:e.target.value}))}
                          className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[var(--chrome)]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)] uppercase font-semibold mb-1 block">Observações</label>
                      <textarea rows={3} value={formVeiculo.observacoes||''} onChange={e => setFormVeiculo(p=>({...p,observacoes:e.target.value}))}
                        className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[var(--chrome)] resize-none" />
                    </div>
                    <button onClick={salvarVeiculo} disabled={saving} className="btn btn-primary">
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                )}

                {/* ── Aba Financiamento ── */}
                {tab === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-[var(--chrome-light)]">💳 Financiamento</h3>

                    {/* Contador regressivo */}
                    {selecionado.financiamento?.totalParcelas > 0 && (
                      <div className="bg-black/30 rounded-2xl p-5 border border-[var(--border)]">
                        <p className="text-sm text-[var(--text-muted)] mb-2">Progresso das Parcelas</p>
                        <div className="flex items-end gap-4 mb-3">
                          <span className="text-5xl font-bold text-[var(--chrome-light)]">{parcelasRestantes}</span>
                          <span className="text-[var(--text-muted)] mb-2">/ {selecionado.financiamento.totalParcelas} restantes</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3">
                          <div className="bg-gradient-to-r from-[var(--chrome-dark)] to-[var(--chrome-light)] h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-2">{pct}% pago · Valor parcela: {formatYen(selecionado.financiamento.valorParcela)}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-[var(--text-muted)] uppercase font-semibold mb-1 block">Total de Parcelas</label>
                        <input type="number" value={formFin.totalParcelas||''} onChange={e=>setFormFin(p=>({...p,totalParcelas:e.target.value}))}
                          className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[var(--chrome)]" />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--text-muted)] uppercase font-semibold mb-1 block">Parcelas Pagas</label>
                        <input type="number" value={formFin.parcelasPagas||''} onChange={e=>setFormFin(p=>({...p,parcelasPagas:e.target.value}))}
                          className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[var(--chrome)]" />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--text-muted)] uppercase font-semibold mb-1 block">Valor da Parcela (¥)</label>
                        <input type="number" value={formFin.valorParcela||''} onChange={e=>setFormFin(p=>({...p,valorParcela:e.target.value}))}
                          className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[var(--chrome)]" />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--text-muted)] uppercase font-semibold mb-1 block">Data de Início</label>
                        <input type="date" value={formFin.dataInicio ? formFin.dataInicio.slice(0,10) : ''} onChange={e=>setFormFin(p=>({...p,dataInicio:e.target.value}))}
                          className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[var(--chrome)]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)] uppercase font-semibold mb-1 block">Observações</label>
                      <textarea rows={2} value={formFin.observacoes||''} onChange={e=>setFormFin(p=>({...p,observacoes:e.target.value}))}
                        className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[var(--chrome)] resize-none" />
                    </div>
                    <button onClick={salvarFin} disabled={saving} className="btn btn-primary">
                      {saving ? 'Salvando...' : 'Salvar Financiamento'}
                    </button>
                  </div>
                )}

                {/* ── Aba Manutenção ── */}
                {tab === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-[var(--chrome-light)]">🔧 Histórico de Manutenção</h3>

                    {/* Histórico */}
                    {selecionado.manutencao?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-[var(--text-muted)] text-xs uppercase border-b border-[var(--border)]">
                              <th className="pb-2">Tipo</th><th className="pb-2">Data</th><th className="pb-2">KM</th><th className="pb-2">Próx. KM</th><th className="pb-2">Próx. Data</th><th className="pb-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...selecionado.manutencao].reverse().map(m => (
                              <tr key={m._id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-2 pr-3 font-medium text-[var(--chrome-light)]">{TIPO_MANUTENCAO[m.tipo] || m.tipo}</td>
                                <td className="py-2 pr-3 text-[var(--text-muted)]">{formatDate(m.data)}</td>
                                <td className="py-2 pr-3">{m.kmAtual ? m.kmAtual.toLocaleString()+'km' : '—'}</td>
                                <td className="py-2 pr-3">{m.kmProxima ? m.kmProxima.toLocaleString()+'km' : '—'}</td>
                                <td className="py-2 pr-3 text-[var(--text-muted)]">{formatDate(m.dataProxima)}</td>
                                <td className="py-2"><button onClick={() => delManutencao(m._id)} className="text-red-400 hover:text-red-300 text-xs">✕</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <p className="text-[var(--text-muted)] text-sm">Nenhum registro ainda.</p>}

                    {/* Adicionar */}
                    <form onSubmit={addManutencao} className="border border-[var(--border)] rounded-xl p-4 space-y-3 bg-black/20">
                      <p className="font-semibold text-sm text-white mb-2">+ Adicionar Registro</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-[var(--text-muted)] block mb-1">Tipo</label>
                          <select value={formManutencao.tipo} onChange={e=>setFormManutencao(p=>({...p,tipo:e.target.value}))}
                            className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer">
                            {Object.entries(TIPO_MANUTENCAO).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] block mb-1">Data</label>
                          <input type="date" value={formManutencao.data} onChange={e=>setFormManutencao(p=>({...p,data:e.target.value}))}
                            className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] block mb-1">KM Atual</label>
                          <input type="number" placeholder="ex: 52000" value={formManutencao.kmAtual} onChange={e=>setFormManutencao(p=>({...p,kmAtual:e.target.value}))}
                            className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] block mb-1">Próxima Troca (KM)</label>
                          <input type="number" placeholder="ex: 57000" value={formManutencao.kmProxima} onChange={e=>setFormManutencao(p=>({...p,kmProxima:e.target.value}))}
                            className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] block mb-1">Próxima Troca (Data)</label>
                          <input type="date" value={formManutencao.dataProxima} onChange={e=>setFormManutencao(p=>({...p,dataProxima:e.target.value}))}
                            className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--text-muted)] block mb-1">Observações</label>
                          <input value={formManutencao.observacoes} onChange={e=>setFormManutencao(p=>({...p,observacoes:e.target.value}))}
                            className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none" />
                        </div>
                      </div>
                      <button disabled={saving} className="btn btn-primary text-sm">{saving ? 'Salvando...' : '+ Adicionar'}</button>
                    </form>
                  </div>
                )}

                {/* ── Aba Documentos ── */}
                {tab === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[var(--chrome-light)]">📎 Documentos e Fotos</h3>
                    <p className="text-[var(--text-muted)] text-sm">Use o formulário abaixo para adicionar fotos ou documentos ao perfil do cliente.</p>
                    <AddAnexoForm clienteId={selecionado._id} onSaved={data => { setSelecionado(data); setClientes(prev => prev.map(c => c._id === data._id ? data : c)); }} showMsg={showMsg} />

                    {selecionado.anexos?.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                        {selecionado.anexos.map(a => (
                          <div key={a._id} className="bg-black/30 rounded-xl overflow-hidden border border-[var(--border)]">
                            {(a.tipo === 'foto' || a.tipo === 'video') && <img src={a.url} alt={a.titulo} className="w-full h-28 object-cover" />}
                            <div className="p-2">
                              <p className="text-xs font-semibold text-white truncate">{a.titulo}</p>
                              <p className="text-xs text-[var(--text-muted)]">{a.tipo} · {formatDate(a.dataAdicao)}</p>
                              <button onClick={async () => {
                                await api.delete(`/auth/users/${selecionado._id}/anexos/${a._id}`);
                                const u = await refreshCliente(selecionado._id);
                                setSelecionado(u);
                              }} className="text-red-400 text-xs mt-1 hover:text-red-300">Remover</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Aba Rol de Clientes ── */}
                {tab === 4 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-[var(--chrome-light)]">🤝 Foto de Entrega das Chaves</h3>
                    <p className="text-sm text-[var(--text-muted)]">Suba a foto da entrega. Depois, o cliente pode torná-la pública no Rol de Clientes.</p>

                    <div className="flex gap-4 items-start flex-wrap">
                      {fotoEntregaPreview && (
                        <img src={fotoEntregaPreview} alt="Entrega" className="w-48 h-32 object-cover rounded-xl border-2 border-[var(--chrome)]" />
                      )}
                      <div className="space-y-2">
                        <label className="cursor-pointer btn btn-outline text-sm flex items-center gap-2">
                          {uploadingFoto ? 'Enviando...' : '📷 Selecionar Foto'}
                          <input type="file" accept="image/*" onChange={handleFotoEntrega} className="hidden" disabled={uploadingFoto} />
                        </label>
                        {fotoEntregaPreview && (
                          <p className="text-xs text-green-400">✅ Foto salva no perfil do cliente.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-[var(--text-muted)] uppercase font-semibold mb-1 block">Depoimento do cliente</label>
                      <textarea rows={3} defaultValue={selecionado.rolCliente?.depoimento || ''} id="dep-txt"
                        className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[var(--chrome)] resize-none" />
                      <button onClick={async () => {
                        const dep = document.getElementById('dep-txt')?.value;
                        await api.patch(`/auth/users/${selecionado._id}/rol-foto`, { depoimento: dep });
                        await refreshCliente(selecionado._id);
                        showMsg('✅ Depoimento salvo!');
                      }} className="btn btn-outline text-sm mt-2">Salvar Depoimento</button>
                    </div>

                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${selecionado.rolCliente?.visivel ? 'border-green-500/50 bg-green-500/10' : 'border-[var(--border)] bg-black/20'}`}>
                      <div>
                        <p className="font-semibold text-sm text-white">Visível no Rol de Clientes</p>
                        <p className="text-xs text-[var(--text-muted)]">O cliente também pode controlar isso no próprio perfil.</p>
                      </div>
                      <button onClick={async () => {
                        const novo = !selecionado.rolCliente?.visivel;
                        await api.patch(`/auth/users/${selecionado._id}/rol-foto`, {});
                        await refreshCliente(selecionado._id);
                        showMsg(novo ? '✅ Aparece no Rol!' : 'Removido do Rol.');
                      }} className={`ml-auto px-4 py-2 rounded-lg text-sm font-bold transition-all ${selecionado.rolCliente?.visivel ? 'bg-green-500 text-white' : 'bg-white/10 text-[var(--text-muted)] hover:bg-white/20'}`}>
                        {selecionado.rolCliente?.visivel ? '✅ Visível' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Aba Lembretes ── */}
                {tab === 5 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-[var(--chrome-light)]">🔔 Lembretes</h3>

                    {selecionado.lembretes?.length > 0 ? (
                      <div className="space-y-2">
                        {[...selecionado.lembretes].reverse().map(l => (
                          <div key={l._id} className="flex items-start gap-3 p-3 bg-black/20 border border-[var(--border)] rounded-xl">
                            <span className="text-xl">{l.tipo === 'shaken' ? '🔑' : l.tipo === 'revisao' ? '🔧' : l.tipo === 'parcela' ? '💳' : '📋'}</span>
                            <div className="flex-1">
                              <p className="text-sm text-white">{l.mensagem}</p>
                              <p className="text-xs text-[var(--text-muted)] mt-1">{TIPO_LEMBRETE[l.tipo] || l.tipo} · {formatDate(l.dataEnvio)}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${l.enviado ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {l.enviado ? 'Enviado' : 'Pendente'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-[var(--text-muted)] text-sm">Nenhum lembrete cadastrado.</p>}

                    <form onSubmit={addLembrete} className="border border-[var(--border)] rounded-xl p-4 space-y-3 bg-black/20">
                      <p className="font-semibold text-sm text-white">+ Novo Lembrete</p>
                      <select value={formLembrete.tipo} onChange={e=>setFormLembrete(p=>({...p,tipo:e.target.value}))}
                        className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer">
                        {Object.entries(TIPO_LEMBRETE).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <textarea rows={3} placeholder="Mensagem para o cliente... ex: Seu shaken vence em Maio/2026!"
                        value={formLembrete.mensagem} onChange={e=>setFormLembrete(p=>({...p,mensagem:e.target.value}))} required
                        className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[var(--chrome)] resize-none" />
                      <button disabled={saving} className="btn btn-primary text-sm">{saving ? 'Salvando...' : '+ Adicionar Lembrete'}</button>
                    </form>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-center py-32">
              <div>
                <div className="text-6xl mb-4 opacity-30">👥</div>
                <p>Selecione um cliente para ver os detalhes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-componente: AddAnexoForm ──────────────────────────────────────────
function AddAnexoForm({ clienteId, onSaved, showMsg }) {
  const [form, setForm] = useState({ tipo: 'documento', titulo: '', url: '', descricao: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let url = form.url;
      if (file) {
        const fd = new FormData();
        fd.append('imagens', file);
        const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        url = data.urls[0];
      }
      if (!url) { showMsg('❌ Adicione uma URL ou selecione um arquivo.'); setSaving(false); return; }
      const { data: userData } = await api.patch(`/auth/users/${clienteId}/anexos`, { tipo: form.tipo, titulo: form.titulo, url, descricao: form.descricao });
      onSaved(userData);
      setForm({ tipo: 'documento', titulo: '', url: '', descricao: '' });
      setFile(null);
      showMsg('✅ Anexo adicionado!');
    } catch { showMsg('❌ Erro ao adicionar.'); }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-[var(--border)] rounded-xl p-4 space-y-3 bg-black/20">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Tipo</label>
          <select value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))}
            className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer">
            <option value="documento">📄 Documento</option>
            <option value="foto">📷 Foto</option>
            <option value="video">🎥 Vídeo</option>
            <option value="post_social">📱 Post Social</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Título</label>
          <input required value={form.titulo} onChange={e=>setForm(p=>({...p,titulo:e.target.value}))} placeholder="Nome do arquivo"
            className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none" />
        </div>
      </div>
      <div>
        <label className="text-xs text-[var(--text-muted)] block mb-1">Arquivo (ou cole uma URL abaixo)</label>
        <label className="cursor-pointer btn btn-outline text-sm flex items-center gap-2 w-fit">
          {file ? `📎 ${file.name}` : '📁 Selecionar arquivo'}
          <input type="file" className="hidden" onChange={e=>setFile(e.target.files[0])} />
        </label>
      </div>
      {!file && <input value={form.url} onChange={e=>setForm(p=>({...p,url:e.target.value}))} placeholder="Ou cole o link aqui..."
        className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none" />}
      <input value={form.descricao} onChange={e=>setForm(p=>({...p,descricao:e.target.value}))} placeholder="Descrição (opcional)"
        className="w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white outline-none" />
      <button disabled={saving} className="btn btn-primary text-sm">{saving ? 'Enviando...' : '+ Adicionar Anexo'}</button>
    </form>
  );
}
