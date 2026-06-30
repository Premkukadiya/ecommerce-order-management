import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiUser, FiLogOut, FiPackage, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = ({ onSearch }) => {
  const { user, isLoggedIn, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) onSearch(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-text-primary hidden sm:block">
              Bazaar<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted"
                id="search-input"
              />
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl hover:bg-primary-50 transition-colors group"
              id="cart-icon"
            >
              <FiShoppingCart className="text-xl text-text-secondary group-hover:text-primary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-in shadow-lg shadow-primary/30">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth / User */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-primary-50 transition-colors"
                  id="user-menu-button"
                >
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-text-primary max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-border-light py-2 z-50 animate-slide-down">
                      <div className="px-4 py-2 border-b border-border-light">
                        <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-primary-50 hover:text-primary transition-colors"
                      >
                        <FiPackage className="text-base" />
                        My Orders
                      </Link>
                      <Link
                        to="/cart"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-primary-50 hover:text-primary transition-colors"
                      >
                        <FiShoppingCart className="text-base" />
                        My Cart
                        {cartCount > 0 && (
                          <span className="ml-auto text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded-full">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                      <hr className="my-1 border-border-light" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                      >
                        <FiLogOut className="text-base" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2"
                id="login-button"
              >
                <FiUser className="text-sm" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-primary-50 transition-colors"
            >
              {mobileMenuOpen ? (
                <FiX className="text-xl text-text-secondary" />
              ) : (
                <FiMenu className="text-xl text-text-secondary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
