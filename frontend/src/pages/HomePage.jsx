import { useState, useEffect } from 'react';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiBox, FiSearch } from 'react-icons/fi';
import {
  HiOutlineDesktopComputer,
  HiOutlineShoppingBag,
  HiOutlineBookOpen,
  HiOutlineCake,
} from 'react-icons/hi';
import { MdOutlineSelectAll } from 'react-icons/md';

const categories = [
  { key: 'All', label: 'All', icon: MdOutlineSelectAll },
  { key: 'Electronics', label: 'Electronics', icon: HiOutlineDesktopComputer },
  { key: 'Clothing', label: 'Clothing', icon: HiOutlineShoppingBag },
  { key: 'Books', label: 'Books', icon: HiOutlineBookOpen },
  { key: 'Food & Grocery', label: 'Food & Grocery', icon: HiOutlineCake },
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { fetchCart } = useCart();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    }
  }, [isLoggedIn, fetchCart]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/products');
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'All' || p.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-alt">
      <Navbar onSearch={setSearchQuery} />

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="gradient-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="max-w-2xl animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium text-primary mb-4 border border-primary/10">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse-soft" />
                India's Premium Marketplace
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight mb-4">
                Shop Smart,{' '}
                <span className="bg-gradient-to-r from-primary via-primary-dark to-secondary bg-clip-text text-transparent">
                  Shop Indian
                </span>
              </h1>
              <p className="text-lg text-text-secondary max-w-lg mb-6">
                Discover amazing products from top Indian brands. From electronics to fashion, we've got everything you need.
              </p>
              <div className="flex gap-3">
                <a href="#products" className="btn-primary flex items-center gap-2">
                  <FiSearch className="text-lg" />
                  Explore Products
                </a>
                <a href="#products" className="btn-outline flex items-center gap-2">
                  <FiBox />
                  View Categories
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Category Tabs */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-6 relative z-10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${
                activeCategory === key
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                  : 'bg-white text-text-secondary border-border hover:border-primary/30 hover:text-primary hover:bg-primary-50'
              }`}
              id={`category-${key.toLowerCase().replace(/[^a-z]/g, '-')}`}
            >
              <Icon className="text-base" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 flex-1">
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {activeCategory === 'All' ? 'All Products' : activeCategory}
            </h2>
            {!loading && (
              <p className="text-sm text-text-muted mt-0.5">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Something went wrong</h3>
            <p className="text-text-muted text-sm mb-4">{error}</p>
            <button onClick={fetchProducts} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-24 h-24 rounded-2xl bg-primary-50 flex items-center justify-center mb-4 animate-float">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No products found</h3>
            <p className="text-text-muted text-sm mb-4">
              {searchQuery
                ? `No results for "${searchQuery}" in ${activeCategory === 'All' ? 'any category' : activeCategory}`
                : `No products available in ${activeCategory}`}
            </p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Products */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 animate-fade-in">
            {filteredProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
