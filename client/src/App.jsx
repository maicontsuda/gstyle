import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
import './index.css';

function Layout() {
  const location = useLocation();
  const hideLayout = ['/login'].includes(location.pathname);
  return (
    <>
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
          <Route path="/site"           element={<Aparencia />} />
          <Route path="/admin/add-zerokm" element={<AddZeroKm />} />
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
