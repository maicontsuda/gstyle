import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gstyle_token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch((err) => {
          // Only log out if it's explicitly an Auth error. Network errors or 500s shouldn't wipe the token.
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem('gstyle_token');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('gstyle_token', token);
    api.get('/auth/me').then(res => setUser(res.data));
  };

  const logout = () => {
    localStorage.removeItem('gstyle_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
