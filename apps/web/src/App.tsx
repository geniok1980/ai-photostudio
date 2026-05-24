import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthGuard from './components/AuthGuard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductDashboard from './pages/ProductDashboard';
import History from './pages/History';
import Pricing from './pages/Pricing';
import Admin from './pages/Admin';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Routes>
          {/* Public routes with navbar */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Landing />
              </>
            }
          />
          <Route
            path="/pricing"
            element={
              <>
                <Navbar />
                <Pricing />
              </>
            }
          />

          {/* Auth routes - no navbar (minimal) */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/app"
            element={
              <AuthGuard>
                <Navbar />
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/app/history"
            element={
              <AuthGuard>
                <Navbar />
                <History />
              </AuthGuard>
            }
          />
          <Route
            path="/app/product"
            element={
              <AuthGuard>
                <Navbar />
                <ProductDashboard />
              </AuthGuard>
            }
          />

          {/* Admin route */}
          <Route
            path="/admin"
            element={
              <AuthGuard requireAdmin>
                <Navbar />
                <Admin />
              </AuthGuard>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center pt-16">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
                    <p className="text-gray-400 mb-8">Страница не найдена</p>
                    <a href="/" className="btn-primary inline-block">
                      На главную
                    </a>
                  </div>
                </div>
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
