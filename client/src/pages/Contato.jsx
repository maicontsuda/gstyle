import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Contato.css';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function toLocalDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export default function Contato() {
  const { user } = useAuth();
  const [config, setConfig] = useState({ fotoContato: '', telefones: [], diasEspeciais: [], diasSemanaFolga: [], enderecoLink: 'https://maps.google.com' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [novoTelefone, setNovoTelefone] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null); // { dateStr, tipo, descricao }
  const [showDayModal, setShowDayModal] = useState(false);
  const fileInputRef = useRef(null);

  const isStaff = user && ['admin', 'dono', 'gerente'].includes(user.tipo_usuario);

  useEffect(() => {
    api.get('/config')
      .then(res => setConfig(res.data || {}))
      .catch(err => console.error('Erro ao carregar config:', err));
  }, []);

  const saveConfig = async (patch) => {
    setSaving(true);
    try {
      // Enviar apenas os campos de dados, sem _id, __v, timestamps
      const payload = {
        fotoContato: config.fotoContato || '',
        telefones: config.telefones || [],
        enderecoLink: config.enderecoLink || '',
        diasSemanaFolga: config.diasSemanaFolga || [],
        diasEspeciais: (config.diasEspeciais || []).map(d => ({
          data: d.data,
          tipo: d.tipo,
          descricao: d.descricao || '',
        })),
        ...patch,
        ...(patch.diasEspeciais ? {
          diasEspeciais: patch.diasEspeciais.map(d => ({
            data: d.data,
            tipo: d.tipo,
            descricao: d.descricao || '',
          }))
        } : {}),
      };
      const res = await api.post('/config', payload);
      setConfig(res.data);
    } catch (err) {
      console.error('Erro ao salvar config:', err);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // ── Foto ─────────────────────────────────────────────
  const handleImageClick = () => isStaff && fileInputRef.current?.click();
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('images', file);
    try {
      const resUpload = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const newUrl = resUpload.data.urls?.[0];
      if (!newUrl) throw new Error('URL inválida');
      await saveConfig({ fotoContato: newUrl });
    } catch (err) {
      console.error('Erro no upload:', err);
      alert('Erro ao enviar imagem.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ── Telefones ────────────────────────────────────────
  const addTelefone = () => {
    const num = novoTelefone.trim();
    if (!num) return;
    const novos = [...(config.telefones || []), num];
    setNovoTelefone('');
    saveConfig({ telefones: novos });
  };
  const removeTelefone = (i) => {
    const novos = (config.telefones || []).filter((_, idx) => idx !== i);
    saveConfig({ telefones: novos });
  };

  // ── Calendário ───────────────────────────────────────
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const diasMapa = {};
  (config.diasEspeciais || []).forEach(d => { diasMapa[d.data] = d; });
  const diasSemanaFolga = config.diasSemanaFolga || [];

  const toggleDiaSemana = (dayIdx) => {
    const novos = diasSemanaFolga.includes(dayIdx)
      ? diasSemanaFolga.filter(d => d !== dayIdx)
      : [...diasSemanaFolga, dayIdx];
    saveConfig({ diasSemanaFolga: novos });
  };

  const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));

  const openDayModal = (dayNum) => {
    if (!isStaff) return;
    const dateStr = toLocalDateStr(new Date(year, month, dayNum));
    const existing = diasMapa[dateStr];
    setSelectedDay({ dateStr, tipo: existing?.tipo || 'folga', descricao: existing?.descricao || '' });
    setShowDayModal(true);
  };

  const saveDia = async () => {
    if (!selectedDay) return;
    const outros = (config.diasEspeciais || []).filter(d => d.data !== selectedDay.dateStr);
    const novos = [...outros, { data: selectedDay.dateStr, tipo: selectedDay.tipo, descricao: selectedDay.descricao }];
    await saveConfig({ diasEspeciais: novos });
    setShowDayModal(false);
  };

  const removeDia = async () => {
    if (!selectedDay) return;
    const novos = (config.diasEspeciais || []).filter(d => d.data !== selectedDay.dateStr);
    await saveConfig({ diasEspeciais: novos });
    setShowDayModal(false);
  };

  const hoje = toLocalDateStr(new Date());

  return (
    <div className="page-enter contato-page">
      <div className="container section">
        <div className="accent-line" />
        <h1 className="section-title">Entre em <span>Contato</span></h1>
        <p className="section-sub">Estamos aqui para ajudar. Fale conosco!</p>

        <div className="contato-grid">
          {/* ── Informações ── */}
          <div className="contato-info">

            {/* Endereço */}
            <div className="info-card">
              <div className="info-icon">📍</div>
              <div style={{flex:1}}>
                <h3>Endereço</h3>
                <p>Av. das Nações, 1200 – São Paulo, SP</p>
                <a
                  href={config.enderecoLink || 'https://maps.google.com'}
                  target="_blank" rel="noreferrer"
                  className="info-link-btn"
                >
                  📌 Ver no Google Maps
                </a>
              </div>
            </div>

            {/* Telefone */}
            <div className="info-card">
              <div className="info-icon">📞</div>
              <div style={{flex:1}}>
                <h3>Telefone / WhatsApp</h3>
                {(config.telefones || []).length === 0 && <p className="text-muted-sm">Nenhum telefone cadastrado.</p>}
                <ul className="telefone-lista">
                  {(config.telefones || []).map((tel, i) => (
                    <li key={i} className="telefone-item">
                      <a href={`https://wa.me/55${tel.replace(/\D/g,'')}`} target="_blank" rel="noreferrer">
                        {tel}
                      </a>
                      {isStaff && (
                        <button onClick={() => removeTelefone(i)} className="btn-icon-danger" title="Remover">✕</button>
                      )}
                    </li>
                  ))}
                </ul>
                {isStaff && (
                  <div className="add-telefone-row">
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={novoTelefone}
                      onChange={e => setNovoTelefone(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTelefone()}
                      className="input-ghost"
                    />
                    <button onClick={addTelefone} className="btn btn-sm" disabled={saving}>＋ Adicionar</button>
                  </div>
                )}
              </div>
            </div>

            {/* Horário */}
            <div className="info-card">
              <div className="info-icon">🕐</div>
              <div style={{flex:1}}>
                <h3>Horário de Funcionamento</h3>
                <p>Segunda a Sábado: <strong>10h – 19h</strong></p>
                <p style={{fontSize:'0.82rem', color:'var(--text-muted)', marginTop:4}}>Domingos e feriados: consulte pelo WhatsApp</p>

                {/* Legenda e Controles de Dias da Semana (Admin) */}
                <div className="cal-legenda" style={{flexDirection: 'column', alignItems: 'flex-start', gap: 12}}>
                  <div style={{display:'flex', gap: 10, alignItems: 'center', width: '100%', flexWrap: 'wrap'}}>
                    <span className="cal-tag folga">🚫 Folga</span>
                    <span className="cal-tag evento">🎉 Evento</span>
                    {isStaff && <span style={{fontSize:'0.75rem', color:'var(--text-muted)', marginLeft:'auto'}}>Clique no número para marcar exceção</span>}
                  </div>
                  
                  {isStaff && (
                    <div style={{background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', width: '100%'}}>
                      <div style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5}}>
                        Dias Semanais de Folga Fixos
                      </div>
                      <div style={{display:'flex', gap: 6, flexWrap: 'wrap'}}>
                        {DIAS_SEMANA.map((dia, idx) => (
                          <button
                            key={idx}
                            onClick={() => toggleDiaSemana(idx)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: diasSemanaFolga.includes(idx) ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                              color: diasSemanaFolga.includes(idx) ? '#fca5a5' : 'var(--text-muted)',
                              border: `1px solid ${diasSemanaFolga.includes(idx) ? 'rgba(239,68,68,0.4)' : 'transparent'}`,
                              borderRadius: 4,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {dia}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mini-Calendário */}
                <div className="mini-cal">
                  <div className="cal-nav">
                    <button onClick={prevMonth} className="cal-nav-btn">‹</button>
                    <span className="cal-mes">{MESES[month]} {year}</span>
                    <button onClick={nextMonth} className="cal-nav-btn">›</button>
                  </div>
                  <div className="cal-grid">
                    {DIAS_SEMANA.map(d => <div key={d} className="cal-header">{d}</div>)}
                    {Array.from({length: firstDay}).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({length: daysInMonth}).map((_, i) => {
                      const day = i + 1;
                      const dayDate = new Date(year, month, day);
                      const diaSemana = dayDate.getDay();
                      const dateStr = toLocalDateStr(dayDate);
                      const especial = diasMapa[dateStr];
                      const isHoje = dateStr === hoje;
                      
                      // Verifica se é folga semanal
                      const isFolgaSemanal = !especial && diasSemanaFolga.includes(diaSemana);
                      
                      const cssClass = `cal-day ${especial ? `especial-${especial.tipo}` : (isFolgaSemanal ? 'especial-folga' : '')} ${isHoje ? 'cal-hoje' : ''} ${isStaff ? 'cal-clickable' : ''}`;
                      let tooltip = '';
                      if (especial) {
                        tooltip = `${especial.tipo === 'folga' ? '🚫 Folga' : '🎉 Evento'}${especial.descricao ? ': ' + especial.descricao : ''}`;
                      } else if (isFolgaSemanal) {
                        tooltip = '🚫 Folga Semanal';
                      }

                      return (
                        <div
                          key={day}
                          className={cssClass}
                          onClick={() => openDayModal(day)}
                          title={tooltip}
                        >
                          {day}
                          {(especial || isFolgaSemanal) && <span className="cal-dot">{(!especial && isFolgaSemanal) || (especial && especial.tipo === 'folga') ? '🚫' : '🎉'}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
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

          {/* ── Área da Foto ── */}
          <div className="contato-mapa">
            <div
              className={`contato-imagem-container ${isStaff ? 'clickable' : ''}`}
              onClick={handleImageClick}
              style={{ position:'relative', overflow:'hidden', borderRadius:'var(--radius-md)', height:'100%', minHeight:'300px', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-card)', border: config.fotoContato ? 'none' : '1px dashed var(--border)' }}
            >
              {uploading ? (
                <div className="spinner" />
              ) : config.fotoContato ? (
                <img src={config.fotoContato} alt="Contato" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              ) : (
                <div style={{textAlign:'center', color:'var(--text-muted)'}}>
                  <p style={{fontSize:'3rem', marginBottom:10}}>📸</p>
                  <p>{isStaff ? 'Clique para adicionar uma imagem' : 'Imagem não disponível'}</p>
                </div>
              )}
              {isStaff && !uploading && config.fotoContato && (
                <div className="imagem-edit-overlay" style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',opacity:0,transition:'opacity 0.2s',cursor:'pointer'}}>
                  <span style={{backgroundColor:'var(--chrome)',color:'#000',padding:'8px 16px',borderRadius:'var(--radius-sm)',fontWeight:'bold'}}>Alterar Imagem</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} style={{display:'none'}} onChange={handleFileChange} />
          </div>
        </div>
      </div>

      {/* ── Modal de Dia Especial ── */}
      {showDayModal && selectedDay && (
        <div className="modal-overlay" onClick={() => setShowDayModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">📅 {selectedDay.dateStr}</h3>
            <label className="modal-label">Tipo do dia:</label>
            <div className="modal-radio-group">
              <label className={`modal-radio ${selectedDay.tipo === 'folga' ? 'active' : ''}`}>
                <input type="radio" value="folga" checked={selectedDay.tipo === 'folga'} onChange={() => setSelectedDay(s => ({...s, tipo:'folga'}))} />
                🚫 Dia de Folga
              </label>
              <label className={`modal-radio ${selectedDay.tipo === 'evento' ? 'active' : ''}`}>
                <input type="radio" value="evento" checked={selectedDay.tipo === 'evento'} onChange={() => setSelectedDay(s => ({...s, tipo:'evento'}))} />
                🎉 Evento
              </label>
            </div>
            <label className="modal-label">Descrição (opcional):</label>
            <input
              className="input-ghost"
              style={{width:'100%', marginBottom:16}}
              placeholder="Ex: Feriado Nacional, Lançamento..."
              value={selectedDay.descricao}
              onChange={e => setSelectedDay(s => ({...s, descricao: e.target.value}))}
            />
            <div className="modal-actions">
              {diasMapa[selectedDay.dateStr] && (
                <button onClick={removeDia} className="btn-cancel" disabled={saving}>🗑️ Remover</button>
              )}
              <button onClick={() => setShowDayModal(false)} className="btn btn-ghost" style={{marginLeft:'auto'}}>Cancelar</button>
              <button onClick={saveDia} className="btn" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
