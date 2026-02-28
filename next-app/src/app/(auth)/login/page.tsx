'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext, api } from '@/contexts/AuthContext';
import './Login.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', tipo_usuario: 'cliente' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleChange = (e: any) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', { email: form.email, senha: form.senha });
        login(data.user, data.token);
      } else {
        const { data } = await api.post('/auth/register', form);
        login(data.user, data.token);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
           <img src="/logo-gstyle.png" alt="Logo" className="login-logo"/>
           <h2>{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
           <p>{isLogin ? 'Acesse o painel do seu carro' : 'Junte-se à G-Style'}</p>
        </div>

        {errorMsg && <div className="msg-alert error">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label>Nome Completo</label>
              <input name="nome" placeholder="Seu nome" value={form.nome} onChange={handleChange} required />
            </div>
          )}
          
          <div className="form-group">
            <label>E-mail</label>
            <input name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Senha</label>
            <input name="senha" type="password" placeholder="••••••••" value={form.senha} onChange={handleChange} required />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Tipo de Conta</label>
              <select name="tipo_usuario" value={form.tipo_usuario} onChange={handleChange}>
                <option value="cliente">Cliente</option>
                <option value="funcionario">Funcionário</option>
                <option value="dono">Dono</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? 'Não tem uma conta?' : 'Já possui conta?'}{' '}
            <button type="button" className="link-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Cadastre-se' : 'Faça login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
