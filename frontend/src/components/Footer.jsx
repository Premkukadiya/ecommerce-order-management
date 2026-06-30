import { Link } from 'react-router-dom';
import { FiHeart, FiShield, FiTruck, FiHeadphones } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-surface-dark text-white mt-auto">
      {/* Features bar */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <FiTruck className="text-primary text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold">Free Delivery</p>
                <p className="text-xs text-gray-400">On orders above ₹499</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <FiShield className="text-secondary text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold">Secure Payment</p>
                <p className="text-xs text-gray-400">100% protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <FiHeadphones className="text-accent text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold">24/7 Support</p>
                <p className="text-xs text-gray-400">Dedicated support</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <FiHeart className="text-pink-400 text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold">Made in India</p>
                <p className="text-xs text-gray-400">Supporting local brands</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-lg font-bold">
              Bazaar<span className="text-primary">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/cart" className="hover:text-primary transition-colors">Cart</Link>
            <Link to="/orders" className="hover:text-primary transition-colors">Orders</Link>
          </div>
          <p className="text-xs text-gray-500">
            © 2026 BazaarHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
