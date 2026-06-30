import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
  FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiTag,
  FiArrowRight, FiShoppingCart, FiCheckCircle
} from 'react-icons/fi';

const CartPage = () => {
  const { cartItems, cartTotal, cartLoading, fetchCart, removeFromCart, updateQuantity, clearCartState } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const formatPrice = (price) => {
    return Number(price).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleQuantityChange = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    await updateQuantity(productId, newQty);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setPlacingOrder(true);

    try {
      const items = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const orderData = {
        user_id: user.user_id,
        address_id: 1,
        payment_method: paymentMethod,
        items,
      };

      if (couponCode.trim()) {
        orderData.coupon_code = couponCode.trim();
      }

      const res = await API.post('/orders', orderData);
      if (res.data.success) {
        setOrderSuccess(res.data);
        clearCartState();
        toast.success('Order placed successfully! 🎉', {
          icon: '🎉',
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#0F172A',
            color: '#fff',
          },
        });
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to place order';
      toast.error(msg);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Order success state
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-alt">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md animate-scale-in">
            <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6 animate-bounce-in">
              <FiCheckCircle className="text-5xl text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Order Placed!</h2>
            <p className="text-text-muted mb-1">Your order has been placed successfully.</p>
            <div className="bg-white rounded-xl border border-border-light p-4 mt-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Order ID</span>
                <span className="font-semibold text-text-primary">#{orderSuccess.order_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Total Amount</span>
                <span className="font-semibold text-text-primary">₹{formatPrice(orderSuccess.total_amount)}</span>
              </div>
              {orderSuccess.discount_applied > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Discount</span>
                  <span className="font-semibold text-secondary">-₹{formatPrice(orderSuccess.discount_applied)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Status</span>
                <span className="badge badge-pending">{orderSuccess.status}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <Link to="/orders" className="btn-primary flex items-center gap-2">
                View Orders
                <FiArrowRight />
              </Link>
              <Link to="/" className="btn-outline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Empty cart
  if (!cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-alt">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center animate-fade-in">
            <div className="w-28 h-28 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6 animate-float">
              <FiShoppingCart className="text-5xl text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Your cart is empty</h2>
            <p className="text-text-muted mb-6">Looks like you haven't added anything yet.</p>
            <Link to="/" className="btn-primary flex items-center gap-2 mx-auto w-fit">
              <FiShoppingBag />
              Start Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-alt">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-text-primary mb-6 animate-fade-in">
          Shopping Cart
          <span className="text-base font-normal text-text-muted ml-2">
            ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
          </span>
        </h1>

        {cartLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.cart_id}
                  className="bg-white rounded-2xl border border-border-light p-4 sm:p-5 flex gap-4 hover:border-primary/10 transition-colors"
                >
                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product_id}`}
                      className="text-base font-semibold text-text-primary hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-xs text-text-muted mt-1">{item.category}</p>
                    <p className="text-lg font-bold text-text-primary mt-2">
                      ₹{formatPrice(item.unit_price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-surface-alt transition-colors disabled:opacity-30"
                        >
                          <FiMinus className="text-sm" />
                        </button>
                        <span className="px-4 py-2 font-semibold text-sm text-text-primary min-w-[2.5rem] text-center border-x border-border">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity, 1)}
                          disabled={item.quantity >= item.stock_qty}
                          className="p-2 hover:bg-surface-alt transition-colors disabled:opacity-30"
                        >
                          <FiPlus className="text-sm" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 className="text-sm" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-text-muted">Subtotal</p>
                    <p className="text-lg font-bold text-text-primary">
                      ₹{formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-border-light p-6 sticky top-24 space-y-5">
                <h3 className="text-lg font-bold text-text-primary">Order Summary</h3>

                {/* Coupon */}
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                    Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="w-full pl-9 pr-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        id="coupon-input"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-text-muted mt-1">Try: SAVE10, FIRST20, MEGA30</p>
                </div>

                {/* Payment method */}
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    id="payment-method"
                  >
                    <option value="COD">Cash on Delivery</option>
                    <option value="UPI">UPI</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="net_banking">Net Banking</option>
                  </select>
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-border-light pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Subtotal ({cartItems.length} items)</span>
                    <span className="font-medium text-text-primary">₹{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Delivery</span>
                    <span className="font-medium text-secondary">FREE</span>
                  </div>
                  <hr className="border-border-light" />
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-text-primary">Total</span>
                    <span className="text-xl font-extrabold text-text-primary">
                      ₹{formatPrice(cartTotal)}
                    </span>
                  </div>
                </div>

                {/* Place Order */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || cartItems.length === 0}
                  className="btn-secondary w-full !py-3.5 text-base flex items-center justify-center gap-2"
                  id="place-order-button"
                >
                  {placingOrder ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Place Order
                      <FiArrowRight />
                    </>
                  )}
                </button>

                <p className="text-xs text-text-muted text-center">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
