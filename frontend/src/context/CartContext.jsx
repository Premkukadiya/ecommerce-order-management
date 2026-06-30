import { createContext, useContext, useState, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState('0.00');
  const [cartLoading, setCartLoading] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn || !user) return;
    setCartLoading(true);
    try {
      const res = await API.get(`/cart/${user.user_id}`);
      if (res.data.success) {
        setCartItems(res.data.items || []);
        setCartTotal(res.data.cart_total || '0.00');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setCartLoading(false);
    }
  }, [isLoggedIn, user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      return false;
    }
    try {
      const res = await API.post('/cart', {
        user_id: user.user_id,
        product_id: productId,
        quantity,
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Added to cart! 🛒', {
          icon: '🛒',
          style: {
            borderRadius: '12px',
            background: '#0F172A',
            color: '#fff',
          },
        });
        await fetchCart();
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to add to cart';
      toast.error(msg);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    if (!isLoggedIn || !user) return;
    try {
      await API.delete(`/cart/${user.user_id}/${productId}`);
      toast.success('Removed from cart', {
        icon: '🗑️',
        style: {
          borderRadius: '12px',
          background: '#0F172A',
          color: '#fff',
        },
      });
      await fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isLoggedIn || !user) return;
    try {
      await API.put('/cart', {
        user_id: user.user_id,
        product_id: productId,
        quantity,
      });
      await fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const clearCartState = () => {
    setCartItems([]);
    setCartTotal('0.00');
  };

  return (
    <CartContext.Provider value={{
      cartItems, cartTotal, cartCount, cartLoading,
      fetchCart, addToCart, removeFromCart, updateQuantity, clearCartState,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
