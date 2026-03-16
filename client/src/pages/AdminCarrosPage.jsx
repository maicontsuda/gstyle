import AdminCarrosList from '../components/AdminCarrosList';

export default function AdminCarrosPage() {
  return (
    <div className="page-enter bg-[var(--bg-deep)] min-h-screen pt-32 pb-16">
      <div className="container">
        {/* Adicionei título / navegação simples se ele precisar voltar ou ter contexto */}
        <div className="mb-6">
          <a href="/admin" className="text-sm text-[var(--chrome-light)] hover:text-white mb-2 inline-block">← Voltar ao Painel Admin</a>
        </div>
        <AdminCarrosList />
      </div>
    </div>
  );
}
