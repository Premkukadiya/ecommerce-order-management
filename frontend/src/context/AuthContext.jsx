import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load stored auth on mount
  useEffect(() => {
    const stored = localStorage.getItem('bazaarhub_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch (e) {
        localStorage.removeItem('bazaarhub_user');
      }
    }
    setLoading(false);
  }, []);

  const saveAuth = (userData, tokenStr) => {
    setUser(userData);
    setToken(tokenStr);
    localStorage.setItem('bazaarhub_user', JSON.stringify({
      user: userData,
      token: tokenStr,
    }));
  };

  const login = async (email, password) => {
    const res = await API.post('/users/login', { email, password });
    if (res.data.success) {
      saveAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}! 🎉`);
      return res.data;
    }
    throw new Error(res.data.error || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await API.post('/users/register', { name, email, password });
    if (res.data.success) {
      saveAuth(res.data.user, res.data.token);
      toast.success(`Welcome to BazaarHub, ${res.data.user.name}! 🛍️`);
      return res.data;
    }
    throw new Error(res.data.error || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bazaarhub_user');
    toast.success('Logged out successfully');
  };

  const isLoggedIn = !!user && !!token;

  return (
    <AuthContext.Provider value={{
      user, token, loading, isLoggedIn,
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
