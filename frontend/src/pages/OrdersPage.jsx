import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  FiPackage, FiChevronDown, FiChevronUp, FiCalendar,
  FiCreditCard, FiShoppingBag, FiClock
} from 'react-icons/fi';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [detailLoading, setDetailLoading] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/orders/${user.user_id}`);
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);

    // Fetch details if not already loaded
    if (!orderDetails[orderId]) {
      setDetailLoading((prev) => ({ ...prev, [orderId]: true }));
      try {
        const res = await API.get(`/orders/detail/${orderId}`);
        if (res.data.success) {
          setOrderDetails((prev) => ({
            ...prev,
            [orderId]: {
              order: res.data.order,
              items: res.data.items,
              timeline: res.data.timeline,
            },
          }));
        }
      } catch (err) {
        console.error('Failed to load order details:', err);
      } finally {
        setDetailLoading((prev) => ({ ...prev, [orderId]: false }));
      }
    }
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    const map = {
      pending: 'badge-pending',
      confirmed: 'badge-confirmed',
      shipped: 'badge-shipped',
      delivered: 'badge-delivered',
      cancelled: 'badge-cancelled',
    };
    return `badge ${map[s] || 'badge-pending'}`;
  };

  const getTimelineColor = (status) => {
    const s = status?.toLowerCase();
    const map = {
      pending: 'bg-status-pending',
      confirmed: 'bg-status-confirmed',
      shipped: 'bg-status-shipped',
      delivered: 'bg-status-delivered',
      cancelled: 'bg-status-cancelled',
    };
    return map[s] || 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-alt">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-text-secondary font-medium">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-alt">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Orders</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed
            </p>
          </div>
          <Link to="/" className="btn-outline text-sm flex items-center gap-2">
            <FiShoppingBag />
            Continue Shopping
          </Link>
        </div>

        {error && (
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchOrders} className="btn-primary">Retry</button>
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-28 h-28 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6 animate-float">
              <FiPackage className="text-5xl text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">No orders yet</h2>
            <p className="text-text-muted mb-6">You haven't placed any orders yet. Start shopping!</p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <FiShoppingBag />
              Browse Products
            </Link>
          </div>
        )}

        {!error && orders.length > 0 && (
          <div className="space-y-4 animate-slide-up">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.order_id;
              const detail = orderDetails[order.order_id];
              const isLoadingDetail = detailLoading[order.order_id];

              return (
                <div
                  key={order.order_id}
                  className="bg-white rounded-2xl border border-border-light overflow-hidden transition-all hover:border-primary/10"
                >
                  {/* Order header */}
                  <button
                    onClick={() => toggleOrder(order.order_id)}
                    className="w-full p-5 flex items-center justify-between text-left transition-colors hover:bg-surface-alt/50"
                    id={`order-${order.order_id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <FiPackage className="text-primary text-lg" />
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">
                            Order #{order.order_id}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted flex-wrap">
                            <span className="flex items-center gap-1">
                              <FiCalendar className="text-[10px]" />
                              {formatDate(order.created_at)}
                            </span>
                            <span>•</span>
                            <span>{order.item_count} item{order.item_count !== 1 ? 's' : ''}</span>
                            {order.payment_method && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <FiCreditCard className="text-[10px]" />
                                  {order.payment_method.toUpperCase()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-text-primary">
                          ₹{formatPrice(order.total_amount)}
                        </p>
                        <span className={getStatusBadge(order.status)}>{order.status}</span>
                      </div>
                      {isExpanded ? (
                        <FiChevronUp className="text-text-muted text-lg" />
                      ) : (
                        <FiChevronDown className="text-text-muted text-lg" />
                      )}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-border-light animate-slide-down">
                      {isLoadingDetail ? (
                        <div className="flex items-center justify-center py-10">
                          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                      ) : detail ? (
                        <div className="p-5 space-y-6">
                          {/* Delivery info */}
                          {detail.order?.delivery_address && (
                            <div className="bg-surface-alt rounded-xl p-4">
                              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                                Delivery Address
                              </p>
                              <p className="text-sm text-text-primary">{detail.order.delivery_address}</p>
                            </div>
                          )}

                          {/* Discount info */}
                          {detail.order?.discount_amount > 0 && (
                            <div className="bg-secondary/5 rounded-xl p-4 border border-secondary/10">
                              <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Coupon Applied</span>
                                <span className="font-semibold text-text-primary">{detail.order.coupon_used}</span>
                              </div>
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-text-muted">Discount</span>
                                <span className="font-semibold text-secondary">
                                  -₹{formatPrice(detail.order.discount_amount)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Items */}
                          <div>
                            <p className="text-sm font-semibold text-text-primary mb-3">
                              Items ({detail.items?.length || 0})
                            </p>
                            <div className="space-y-2">
                              {detail.items?.map((item, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between py-3 px-4 bg-surface-alt rounded-xl"
                                >
                                  <div className="flex-1 min-w-0 mr-4">
                                    <p className="text-sm font-medium text-text-primary truncate">
                                      {item.product_name}
                                    </p>
                                    <p className="text-xs text-text-muted">
                                      ₹{formatPrice(item.unit_price)} × {item.quantity}
                                    </p>
                                  </div>
                                  <p className="text-sm font-bold text-text-primary shrink-0">
                                    ₹{formatPrice(item.subtotal)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Status Timeline */}
                          {detail.timeline && detail.timeline.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                                <FiClock />
                                Status Timeline
                              </p>
                              <div className="relative pl-6">
                                {/* Timeline line */}
                                <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-border-light" />

                                {detail.timeline.map((entry, i) => (
                                  <div key={i} className="relative pb-4 last:pb-0">
                                    <div className={`absolute left-[-15px] top-1 w-3 h-3 rounded-full ${getTimelineColor(entry.status)} ring-2 ring-white`} />
                                    <div className="ml-2">
                                      <div className="flex items-center gap-2">
                                        <span className={getStatusBadge(entry.status)}>
                                          {entry.status}
                                        </span>
                                      </div>
                                      <p className="text-xs text-text-muted mt-1">
                                        {formatDate(entry.changed_at)}
                                      </p>
                                      {entry.note && (
                                        <p className="text-xs text-text-secondary mt-0.5">{entry.note}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-5 text-center text-text-muted text-sm">
                          Failed to load order details.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrdersPage;
