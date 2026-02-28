import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Permissões
  const authorizedRoles = ['admin', 'dono', 'gerente', 'funcionario'];
  const isAuthorized = user && authorizedRoles.includes(user.tipo_usuario);

  if (!isAuthorized) {
    return (
      <div className="pt-32 container text-center min-h-screen">
        <h1 className="text-3xl text-red-500 mb-4">Acesso Negado</h1>
        <p className="text-[var(--text-muted)]">Você não tem permissão para acessar o Painel Administrativo.</p>
        <button onClick={() => navigate('/')} className="mt-8 btn btn-primary">Voltar para a Home</button>
      </div>
    );
  }

  // Cards de funcionalidades
  const adminModules = [
    {
      title: 'Carros 0KM',
      description: 'Adicionar ou gerenciar o catálogo de veículos 0KM.',
      link: '/admin/add-zerokm',
      icon: '🚗'
    },
    {
      title: 'Estoque (Seminovos)',
      description: 'Gerenciar os carros do estoque atual.',
      link: '#', // Placeholder
      icon: '📋'
    },
    {
      title: 'Reservas & Test Drive',
      description: 'Visualizar agendamentos e solicitações dos clientes.',
      link: '#', // Placeholder
      icon: '📅'
    },
    {
      title: 'Financiamentos',
      description: 'Avaliar pedidos de simulação de financiamento.',
      link: '#', // Placeholder
      icon: '💰'
    },
    {
      title: 'Colaboradores',
      description: 'Gerenciar contas da equipe e acessos.',
      link: '#', // Placeholder
      icon: '👥'
    }
  ];

  return (
    <div className="page-enter bg-[var(--bg-deep)] min-h-screen pt-32 pb-16">
      <div className="container">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-[var(--border)] pb-6">
          <div>
            <span className="badge badge-gold mb-3">Administração Central</span>
            <h1 className="text-4xl font-playfair font-bold text-[var(--chrome-light)]">Painel Admin</h1>
            <p className="text-[var(--text-muted)] mt-2">
              Bem-vindo(a), <strong className="text-white">{user.username}</strong>. O que você deseja gerenciar hoje?
            </p>
          </div>
          <div className="mt-6 md:mt-0 text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--chrome-dark)] block mb-1">Seu Nível de Acesso</span>
            <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm font-bold text-white capitalize">
              {user.tipo_usuario}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((modulo, idx) => (
            <Link 
              key={idx} 
              to={modulo.link} 
              className={`card p-6 flex items-start gap-4 transition-all duration-300 ${modulo.link === '#' ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none hover:border-[var(--border)] relative' : 'hover:-translate-y-2 hover:border-[var(--chrome-light)] hover:shadow-[0_10px_30px_rgba(255,255,255,0.1)]'}`}
              onClick={(e) => modulo.link === '#' && e.preventDefault()}
            >
              <div className="text-4xl bg-[var(--bg-card2)] w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 border border-[var(--border)]">
                {modulo.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--chrome-light)] mb-1">{modulo.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{modulo.description}</p>
              </div>

              {modulo.link === '#' && (
                <div className="absolute top-4 right-4 text-[0.65rem] font-bold uppercase tracking-widest bg-black/50 text-[var(--text-muted)] px-2 py-1 rounded">
                  Em Breve
                </div>
              )}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
