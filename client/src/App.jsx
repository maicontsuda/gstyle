import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Estoque from './pages/Estoque';
import Veiculo from './pages/Veiculo';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import AuthCallback from './pages/AuthCallback';
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
          <Route path="/estoque"        element={<Estoque />} />
          <Route path="/veiculo/:id"    element={<Veiculo />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/perfil"         element={<Perfil />} />
          <Route path="/auth/callback"  element={<AuthCallback />} />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </>
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
