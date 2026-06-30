import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';
import { useCart } from '../context/CartContext';
import {
  FiShoppingCart, FiMinus, FiPlus, FiChevronRight, FiHome,
  FiCheckCircle, FiPackage
} from 'react-icons/fi';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.product);
      }
    } catch (err) {
      setError('Product not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product.product_id, quantity);
    setAdding(false);
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-alt">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-text-secondary font-medium">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-alt">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😕</span>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Product Not Found</h2>
            <p className="text-text-muted mb-4">{error}</p>
            <Link to="/" className="btn-primary">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.thumbnail || ''];
  const reviews = product.reviews || [];
  const specs = product.specs || {};
  const highlights = product.highlights || [];
  const ratingCount = product.rating_summary?.count || reviews.length || 0;
  const avgRating = product.rating_summary?.average || 0;

  return (
    <div className="min-h-screen flex flex-col bg-surface-alt">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6 animate-fade-in">
          <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <FiHome className="text-sm" />
            Home
          </Link>
          <FiChevronRight className="text-xs" />
          <Link to={`/?category=${product.category}`} className="hover:text-primary transition-colors">
            {product.category}
          </Link>
          <FiChevronRight className="text-xs" />
          <span className="text-text-secondary font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-slide-up">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border-light p-6 aspect-square flex items-center justify-center overflow-hidden">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="max-w-full max-h-full object-contain transition-all duration-300"
                onError={(e) => {
                  e.target.src = `https://placehold.co/500x500/f97316/white?text=${encodeURIComponent(product.name?.charAt(0) || 'B')}`;
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${
                      selectedImage === i
                        ? 'border-primary shadow-lg shadow-primary/20'
                        : 'border-border-light hover:border-primary/30'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/100x100/f1f5f9/94a3b8?text=${i + 1}`;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {/* Brand & Name */}
            <div>
              {product.brand && (
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">
                  {product.brand}
                </p>
              )}
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-bold text-secondary">{avgRating.toFixed(1)}</span>
                <StarRating rating={avgRating} size="text-sm" />
              </div>
              <span className="text-sm text-text-muted">
                {ratingCount} rating{ratingCount !== 1 ? 's' : ''} & {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Price */}
            <div className="bg-primary-50 rounded-xl p-4 border border-primary/10">
              <p className="text-3xl font-extrabold text-text-primary">
                ₹{formatPrice(product.price)}
              </p>
              <p className="text-sm text-secondary font-medium mt-1">
                Inclusive of all taxes
              </p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.stock_qty > 0 ? (
                <>
                  <FiCheckCircle className="text-secondary" />
                  <span className="text-sm font-medium text-secondary">In Stock</span>
                  {product.stock_qty < 10 && (
                    <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      Only {product.stock_qty} left — Hurry!
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm font-medium text-red-500">Out of Stock</span>
              )}
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Highlights</h3>
                <ul className="space-y-1.5">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-surface-alt transition-colors"
                  disabled={quantity <= 1}
                >
                  <FiMinus className="text-text-secondary" />
                </button>
                <span className="px-5 py-3 font-semibold text-text-primary min-w-[3rem] text-center border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                  className="p-3 hover:bg-surface-alt transition-colors"
                  disabled={quantity >= product.stock_qty}
                >
                  <FiPlus className="text-text-secondary" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock_qty === 0}
                className="btn-primary flex-1 flex items-center justify-center gap-2 !py-3 text-base"
                id="add-to-cart-detail"
              >
                {adding ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FiShoppingCart />
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Delivery info */}
            <div className="flex items-center gap-3 p-3 bg-surface-alt rounded-xl border border-border-light">
              <FiPackage className="text-xl text-primary" />
              <div>
                <p className="text-sm font-medium text-text-primary">Free Delivery</p>
                <p className="text-xs text-text-muted">Delivery within 3-5 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-10 bg-white rounded-2xl border border-border-light p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-text-primary mb-3">Description</h2>
            <p className="text-text-secondary text-sm leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Specs */}
        {Object.keys(specs).length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-border-light p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-text-primary mb-4">Specifications</h2>
            <div className="overflow-hidden rounded-xl border border-border-light">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(specs).map(([key, value], i) => (
                    <tr
                      key={key}
                      className={i % 2 === 0 ? 'bg-surface-alt' : 'bg-white'}
                    >
                      <td className="px-4 py-3 font-medium text-text-secondary w-1/3 capitalize">
                        {key.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-6 bg-white rounded-2xl border border-border-light p-6 animate-fade-in">
          <h2 className="text-lg font-bold text-text-primary mb-4">
            Customer Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-3xl mb-2 block">💬</span>
              <p className="text-text-muted text-sm">No reviews yet for this product.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <div
                  key={i}
                  className="border border-border-light rounded-xl p-4 hover:border-primary/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {review.reviewer_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {review.reviewer_name}
                        </p>
                        <StarRating rating={review.rating} size="text-xs" />
                      </div>
                    </div>
                    <span className="text-xs text-text-muted">
                      {new Date(review.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-text-secondary ml-12">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
