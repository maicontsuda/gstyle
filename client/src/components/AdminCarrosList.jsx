import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AdminCarrosList() {
  const navigate = useNavigate();
  const [carros, setCarros] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCar, setEditingCar] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCarros, resClientes] = await Promise.all([
        api.get('/carros/admin?limit=100'),
        api.get('/users')
      ]);
      setCarros(resCarros.data.carros || []);
      // Handle both array and {users:[]} shaped responses
      const usersData = Array.isArray(resClientes.data)
        ? resClientes.data
        : (resClientes.data?.users || resClientes.data?.clientes || []);
      setClientes(usersData.filter(u => u.tipo_usuario === 'cliente'));
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (carro) => {
    setEditingCar({ ...carro, comprador: carro.comprador?._id || '' });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingCar(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        isVendido: editingCar.isVendido,
        vinculoPublico: editingCar.vinculoPublico,
        comprador: editingCar.comprador || null
      };
      await api.put(`/carros/${editingCar._id}`, payload);
      setEditingCar(null);
      fetchData(); // reload list
      alert('Veículo atualizado com sucesso!');
    } catch (err) {
      alert('Erro ao atualizar veículo.');
      console.error(err);
    }
  };

  const handleDelete = async (carro) => {
    if (window.confirm(`Tem certeza que deseja DELETAR o veículo ${carro.marca} ${carro.modelo}? Esta ação não pode ser desfeita.`)) {
      try {
        await api.delete(`/carros/${carro._id}`);
        fetchData(); // Recarrega a lista
        alert('Veículo deletado com sucesso!');
      } catch (err) {
        alert('Erro ao deletar veículo.');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="spinner my-12 mx-auto" />;

  return (
    <div className="bg-[var(--bg-deep)] p-6 rounded-xl border border-[var(--border)] mt-8">
      <h2 className="text-2xl font-playfair font-bold text-[var(--chrome-light)] mb-6">Controle de Frota / Vendas</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-sm uppercase tracking-wider">
              <th className="p-3">Veículo</th>
              <th className="p-3">Status</th>
              <th className="p-3">Vendido?</th>
              <th className="p-3">Cliente Vinculado</th>
              <th className="p-3">Privacidade</th>
              <th className="p-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {carros.map(carro => (
              <tr key={carro._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-card)]/50 transition-colors">
                <td className="p-3">
                  <div className="font-bold text-white">{carro.marca} {carro.modelo}</div>
                  <div className="text-xs text-[var(--text-muted)]">{carro.ano} • {carro.cor}</div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs px-2 py-1 ${carro.status === 'zero_km' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>
                    {carro.status === 'zero_km' ? '0KM' : 'Seminovo'}
                  </span>
                </td>
                <td className="p-3">
                  {carro.isVendido ? (
                    <span className="text-green-400 font-semibold text-sm">✓ Vendido</span>
                  ) : (
                    <span className="text-yellow-400 text-sm">Disponível</span>
                  )}
                </td>
                <td className="p-3 text-sm text-[var(--chrome-dark)]">
                  {carro.comprador ? carro.comprador.username : '-'}
                </td>
                <td className="p-3 text-sm">
                  {carro.isVendido && carro.comprador ? (
                    carro.vinculoPublico ? <span className="text-blue-400">Público</span> : <span className="text-[var(--text-muted)]">Privado</span>
                  ) : '-'}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/admin/carros/edit/${carro._id}`)}
                      className="btn btn-outline text-xs py-1 px-3"
                      title="Editar todas as informações do veículo"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleEdit(carro)}
                      className="text-xs py-1 px-3 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--chrome-dark)] hover:text-white transition-all"
                      title="Editar relação de venda"
                    >
                      💰 Venda
                    </button>
                    <button
                      onClick={() => handleDelete(carro)}
                      className="text-xs py-1 px-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                      title="Deletar veículo permanentemente"
                    >
                      🗑️ Deletar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {carros.length === 0 && (
              <tr><td colSpan="6" className="text-center p-6 text-[var(--text-muted)]">Nenhum veículo encontrado no sistema.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-xl w-full max-w-md relative">
            <button onClick={() => setEditingCar(null)} className="absolute top-4 right-4 text-2xl text-[var(--text-muted)] hover:text-white">&times;</button>
            <h3 className="text-xl font-bold text-[var(--chrome-light)] mb-4">
              Venda: {editingCar.marca} {editingCar.modelo}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/5 rounded-lg border border-white/10">
                <input 
                  type="checkbox" 
                  name="isVendido" 
                  checked={editingCar.isVendido} 
                  onChange={handleChange} 
                  className="w-5 h-5 accent-[var(--primary)]"
                />
                <span className="text-white font-medium">Veículo Vendido</span>
              </label>

              {editingCar.isVendido && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm text-[var(--text-muted)] block">Vincular Cliente Comprador</label>
                    <select 
                      name="comprador" 
                      value={editingCar.comprador || ''} 
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-deep)] border border-[var(--border)] text-white p-2 text-sm rounded focus:border-[var(--primary)] focus:outline-none"
                    >
                      <option value="">Nenhum (Cliente Avulso/Fora do Sistema)</option>
                      {clientes.map(cli => (
                        <option key={cli._id} value={cli._id}>{cli.username} ({cli.email})</option>
                      ))}
                    </select>
                  </div>

                  {editingCar.comprador && (
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <input 
                        type="checkbox" 
                        name="vinculoPublico" 
                        checked={editingCar.vinculoPublico} 
                        onChange={handleChange} 
                        className="w-5 h-5 accent-blue-500"
                      />
                      <div>
                        <span className="text-blue-100 font-medium block">Tornar Vínculo Público</span>
                        <span className="text-xs text-blue-300">Apenas admins/gerentes ou o próprio cliente podem alterar isso depois. Exibe a foto do cliente junto ao carro na Home.</span>
                      </div>
                    </label>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingCar(null)} className="flex-1 btn btn-ghost">Cancelar</button>
                <button type="submit" className="flex-1 btn btn-primary">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
