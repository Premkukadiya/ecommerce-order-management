import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { HiOutlineLightningBolt } from 'react-icons/hi';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const {
    product_id,
    name,
    price,
    stock_qty,
    brand,
    thumbnail,
    avg_rating,
  } = product;

  const formattedPrice = Number(price).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await addToCart(product_id, 1);
    setAdding(false);
  };

  return (
    <Link
      to={`/products/${product_id}`}
      className="product-card block bg-white rounded-2xl overflow-hidden shadow-sm border border-border-light hover:border-primary/20 group"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 h-52">
        <img
          src={thumbnail}
          alt={name}
          className="card-img w-full h-full object-contain p-4"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://placehold.co/300x300/f97316/white?text=${encodeURIComponent(name?.charAt(0) || 'B')}`;
          }}
        />
        {/* Stock warning */}
        {stock_qty > 0 && stock_qty < 10 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-100">
            <HiOutlineLightningBolt className="text-sm" />
            Only {stock_qty} left
          </div>
        )}
        {stock_qty === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-text-primary font-bold px-4 py-2 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Brand */}
        {brand && (
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            {brand}
          </p>
        )}

        {/* Name */}
        <h3 className="font-semibold text-text-primary text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
          {name}
        </h3>

        {/* Rating */}
        <StarRating rating={avg_rating || 0} showValue size="text-xs" />

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-lg font-bold text-text-primary">
            ₹{formattedPrice}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={adding || stock_qty === 0}
            className="btn-primary !py-2 !px-3 text-sm flex items-center gap-1.5 disabled:opacity-40"
            id={`add-to-cart-${product_id}`}
          >
            {adding ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FiShoppingCart className="text-sm" />
            )}
            <span className="hidden sm:inline">{adding ? '...' : 'Add'}</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
