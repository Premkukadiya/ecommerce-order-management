import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: "'Inter', sans-serif",
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#16A34A',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
