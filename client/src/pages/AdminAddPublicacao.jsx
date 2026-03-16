import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function AdminAddPublicacao() {
  const navigate = useNavigate();
  const { id } = useParams(); // If present, implies Edit Mode
  const [loading, setLoading] = useState(false);
  const [parceiros, setParceiros] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    tipo: 'social',
    titulo: '',
    descricao: '',
    linkDestino: '',
    imagemUrl: '',
    dataInicio: '',
    dataFim: '',
    parceiroVinculado: '',
    ativo: true
  });

  useEffect(() => {
    // Fetch users to populate the partner dropdown
    api.get('/auth/users')
      .then(r => setParceiros(r.data))
      .catch(e => console.error('Erro ao buscar clientes/parceiros', e));

    if (id) {
      // Edit mode: fetch the post data
      api.get('/publicacoes/admin')
        .then(r => {
          const pub = r.data.find(p => p._id === id);
          if (pub) {
            setFormData({
              tipo: pub.tipo || 'social',
              titulo: pub.titulo || '',
              descricao: pub.descricao || '',
              linkDestino: pub.linkDestino || '',
              imagemUrl: pub.imagemUrl || '',
              ativo: pub.ativo,
              dataInicio: pub.dataInicio ? pub.dataInicio.substring(0, 10) : '',
              dataFim: pub.dataFim ? pub.dataFim.substring(0, 10) : '',
              parceiroVinculado: pub.parceiroVinculado?._id || pub.parceiroVinculado || ''
            });
          }
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Clear the text URL if user explicitly selected a file
      setFormData({ ...formData, imagemUrl: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = formData.imagemUrl;

      // Se tiver arquivo local, envia para o Cloudinary
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('images', imageFile);
        const uploadRes = await api.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data && uploadRes.data.urls && uploadRes.data.urls.length > 0) {
          finalImageUrl = uploadRes.data.urls[0];
        }
      }

      const payload = { ...formData, imagemUrl: finalImageUrl };

      if (id) {
        await api.patch(`/publicacoes/${id}`, payload);
        alert('Publicação editada com sucesso!');
      } else {
        await api.post('/publicacoes', formData);
        alert('Publicação criada com sucesso!');
      }
      navigate('/comunidade'); 
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar publicação.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
      <div className="container max-w-2xl mx-auto bg-[var(--bg-deep)] p-8 rounded-2xl border border-[var(--border)] shadow-xl">
        <h1 className="text-3xl font-playfair font-bold text-[var(--chrome-light)] mb-2">
          {id ? 'Editar Publicação' : 'Compartilhar na Comunidade'}
        </h1>
        <p className="text-[var(--text-muted)] mb-8">
          {id ? 'Altere as informações desta publicação ou defina quem pode editá-la.' : 'Adicione um post de rede social, um evento ou novidade no portal.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--chrome-light)] mb-1">Tipo</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full p-3 bg-black/40 border border-[var(--border)] rounded text-white focus:border-[var(--chrome)] focus:outline-none"
              >
                <option value="social">Postagem de Rede Social (Instagram/TikTok)</option>
                <option value="evento">Evento Automotivo</option>
                <option value="parceiro">Parceiro / Patrocinador</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[var(--chrome-light)] mb-1">Vincular Parceiro/Autor</label>
              <select
                name="parceiroVinculado"
                value={formData.parceiroVinculado}
                onChange={handleChange}
                className="w-full p-3 bg-black/40 border border-[var(--border)] rounded text-white focus:border-[var(--chrome)] focus:outline-none"
              >
                <option value="">Nenhum (Somente Admins)</option>
                {parceiros.map(p => (
                  <option key={p._id} value={p._id}>{p.username} ({p.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--chrome-light)] mb-1">Título / Descrição Curta</label>
            <input
              required
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full p-3 bg-black/40 border border-[var(--border)] rounded text-white focus:border-[var(--chrome)] focus:outline-none"
              placeholder="Ex: Novo skyline chegou na loja!"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--chrome-light)] mb-1">Descrição Detalhada (Opcional)</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 bg-black/40 border border-[var(--border)] rounded text-white focus:border-[var(--chrome)] focus:outline-none resize-none"
              placeholder="Digite mais detalhes do post ou evento..."
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--chrome-light)] mb-1">Link de Destino / URL do Post Original</label>
            <input
              type="url"
              name="linkDestino"
              value={formData.linkDestino}
              onChange={handleChange}
              className="w-full p-3 bg-black/40 border border-[var(--border)] rounded text-white focus:border-[var(--chrome)] focus:outline-none"
              placeholder="https://instagram.com/p/..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--chrome-light)] mb-2">Imagem / Mídia da Publicação</label>
            
            <div className="flex flex-col gap-4 border border-[var(--border)] p-4 rounded bg-black/20">
              {/* Preview Block */}
              {(imagePreview || formData.imagemUrl) && (
                <div className="relative w-full max-w-sm h-48 bg-black rounded border border-[var(--border)] overflow-hidden">
                  {(imagePreview || formData.imagemUrl).toLowerCase().match(/\.(mp4|webm|mov)(\?|$)/) || (imageFile && imageFile.type.startsWith('video/')) ? (
                    <video src={imagePreview || formData.imagemUrl} className="w-full h-full object-cover" muted autoPlay loop />
                  ) : (
                    <img 
                      src={imagePreview || formData.imagemUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={e => { e.currentTarget.style.display='none'; }}
                    />
                  )}
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setFormData({...formData, imagemUrl: ''}); }}
                    className="absolute top-2 right-2 bg-red-600/90 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                    ×
                  </button>
                </div>
              )}

              {/* Upload Button & URL field */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <label className="text-xs text-[var(--text-muted)] mb-1 block">Fazer Upload de Foto/Vídeo</label>
                  <label className="cursor-pointer bg-[var(--bg-card2)] border border-[var(--border)] hover:border-[var(--chrome)] transition-colors px-4 py-3 rounded text-sm text-[var(--text-muted)] hover:text-white flex justify-center items-center text-center h-[52px]">
                    <span>📁 Escolher Arquivo...</span>
                    <input type="file" accept="image/*,video/mp4,video/mov,video/webm" className="hidden" onChange={handleImageFileChange} />
                  </label>
                </div>
                
                <div className="flex justify-center items-center mt-4 sm:mt-0">
                  <span className="text-[var(--text-muted)] text-sm font-bold">OU</span>
                </div>

                <div className="flex-1">
                  <label className="text-xs text-[var(--text-muted)] mb-1 block">Colar Link Direto</label>
                  <input
                    type="url"
                    name="imagemUrl"
                    value={formData.imagemUrl}
                    onChange={(e) => { 
                      handleChange(e); 
                      if(imageFile) { setImageFile(null); setImagePreview(null); } 
                    }}
                    className="w-full p-3 bg-black/40 border border-[var(--border)] rounded text-white focus:border-[var(--chrome)] focus:outline-none"
                    placeholder="https://site.com/foto.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[var(--border)] p-4 rounded bg-black/20">
            <div className="col-span-1 md:col-span-2">
              <p className="text-sm font-semibold text-[var(--chrome-light)]">Visibilidade Automatizada</p>
              <p className="text-xs text-[var(--text-muted)] mb-2">Se deixar as datas vazias, o post ficará visível para sempre até ser desativado.</p>
            </div>
            
            <div>
              <label className="block text-sm text-[var(--chrome-light)] mb-1">Data Início (Opcional)</label>
              <input
                type="date"
                name="dataInicio"
                value={formData.dataInicio}
                onChange={handleChange}
                className="w-full p-3 bg-black/40 border border-[var(--border)] rounded text-[#fff] focus:border-[var(--chrome)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--chrome-light)] mb-1">Data Fim (Opcional)</label>
              <input
                type="date"
                name="dataFim"
                value={formData.dataFim}
                onChange={handleChange}
                className="w-full p-3 bg-black/40 border border-[var(--border)] rounded text-[#fff] focus:border-[var(--chrome)] focus:outline-none"
              />
            </div>
          </div>

          {id && (
            <div className="flex items-center gap-3 border border-[var(--border)] p-4 rounded bg-black/20">
              <input
                type="checkbox"
                id="ativo"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
                className="w-5 h-5 accent-[var(--chrome)]"
              />
              <label htmlFor="ativo" className="text-sm font-semibold cursor-pointer select-none text-[var(--chrome-light)]">
                Publicação Ativa no Site
              </label>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/comunidade')}
              className="flex-1 btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary"
            >
              {loading ? 'Salvando...' : 'Salvar Publicação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
