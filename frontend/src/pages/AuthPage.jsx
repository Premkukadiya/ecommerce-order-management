import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        await register(formData.name, formData.email, formData.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt relative overflow-hidden px-4">
      {/* Background decoration */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <span className="text-3xl font-bold text-text-primary">
              Bazaar<span className="text-primary">Hub</span>
            </span>
          </div>
          <p className="text-text-muted">
            {isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
          {/* Toggle tabs */}
          <div className="flex bg-surface-alt rounded-xl p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isLogin
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
              id="login-tab"
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                !isLogin
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
              id="register-tab"
            >
              Register
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 animate-slide-down">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name — only for register */}
            {!isLogin && (
              <div className="animate-slide-down">
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    id="register-name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  id="auth-email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  minLength={3}
                  className="w-full pl-10 pr-12 py-3 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  id="auth-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 text-base flex items-center justify-center gap-2 mt-6"
              id="auth-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Toggle link */}
          <p className="text-center text-sm text-text-muted mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={toggleMode}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6">
          <a href="/" className="text-sm text-text-muted hover:text-primary transition-colors">
            ← Back to BazaarHub
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
