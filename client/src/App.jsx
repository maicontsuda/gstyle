import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Estoque from './pages/Estoque';
import ZeroKm from './pages/ZeroKm';
import Veiculo from './pages/Veiculo';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import AuthCallback from './pages/AuthCallback';
import Servicos from './pages/Servicos';
import Financeira from './pages/Financeira';
import Contato from './pages/Contato';
import AdminDashboard from './pages/AdminDashboard';
import Comunidade from './pages/Comunidade';
import RolDeClientes from './pages/RolDeClientes';
import './index.css';
import './App.css';

function Layout() {
  const location = useLocation();
  const hideLayout = ['/login'].includes(location.pathname);
  return (
    <div className="app-container">
      {!hideLayout && <Sidebar />}
      <main className={`main-content ${hideLayout ? 'full-width' : ''}`}>
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/estoque"        element={<Estoque />} />
          <Route path="/zero-km"        element={<ZeroKm />} />
          <Route path="/veiculo/:id"    element={<Veiculo />} />
          <Route path="/servicos"       element={<Servicos />} />
          <Route path="/financeira"     element={<Financeira />} />
          <Route path="/contato"        element={<Contato />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/perfil"         element={<Perfil />} />
          <Route path="/auth/callback"  element={<AuthCallback />} />
          
          <Route path="/admin"          element={<AdminDashboard />} />
          <Route path="/comunidade"     element={<Comunidade />} />
          <Route path="/rol-de-clientes" element={<RolDeClientes />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}
