import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Estoque from './pages/Estoque';
import Veiculo from './pages/Veiculo';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import AuthCallback from './pages/AuthCallback';
import Servicos from './pages/Servicos';
import Financeira from './pages/Financeira';
import Aparencia from './pages/Aparencia';
import ZeroKmHome from './pages/ZeroKmHome';
import ZeroKmCars from './pages/ZeroKmCars';
import AddZeroKm from './pages/AddZeroKm';
import AddEstoque from './pages/AddEstoque';
import AdminDashboard from './pages/AdminDashboard';
import GerenciarClientes from './pages/GerenciarClientes';
import RolDeClientes from './pages/RolDeClientes';
import Comunidade from './pages/Comunidade';
import AdminAddPublicacao from './pages/AdminAddPublicacao';
import AdminCarrosPage from './pages/AdminCarrosPage';
import EditCarro from './pages/EditCarro';
import Contato from './pages/Contato';
import ThemeEffects from './components/ThemeEffects';
import './index.css';

function Layout() {
  const { } = useTheme(); // Just calling it to subscribe if needed, though not strictly used in this closure. Actually I don't need useTheme here anymore.
  const location = useLocation();
  const hideLayout = ['/login'].includes(location.pathname);
  return (
    <>
      <ThemeEffects />
      {!hideLayout && <Navbar />}
      <main>
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/zero-km"        element={<ZeroKmHome />} />
          <Route path="/zero-km/:brand" element={<ZeroKmCars />} />
          <Route path="/estoque"        element={<Estoque />} />
          <Route path="/financeira"     element={<Financeira />} />
          <Route path="/seguro"         element={<div className="page-enter container section" style={{paddingTop: 120}}><h1 className="section-title">Seguro <span>Automotivo</span></h1><p>Em breve.</p></div>} />
          <Route path="/veiculo/:id"    element={<Veiculo />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/perfil"         element={<Perfil />} />
          <Route path="/auth/callback"  element={<AuthCallback />} />
          <Route path="/servicos"       element={<Servicos />} />
          <Route path="/contato"         element={<Contato />} />
          <Route path="/site"           element={<Aparencia />} />
          <Route path="/admin"          element={<AdminDashboard />} />
          <Route path="/admin/add-zerokm" element={<AddZeroKm />} />
          <Route path="/admin/add-estoque" element={<AddEstoque />} />
          <Route path="/admin/carros" element={<AdminCarrosPage />} />
          <Route path="/admin/clientes" element={<GerenciarClientes />} />
          <Route path="/admin/publicacoes" element={<AdminAddPublicacao />} />
          <Route path="/admin/publicacoes/edit/:id" element={<AdminAddPublicacao />} />
          <Route path="/rol-clientes" element={<RolDeClientes />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/admin/carros/edit/:id" element={<EditCarro />} />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
