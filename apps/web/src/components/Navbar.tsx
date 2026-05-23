import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const token = localStorage.getItem('jwt');
  let userRole: string | null = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch {
      // invalid token
    }
  }

  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-purple-600/20 text-purple-400'
        : 'text-gray-300 hover:text-white hover:bg-gray-800'
    }`;

  const authLinks = isLoggedIn ? (
    <>
      <Link to="/app" className={linkClass('/app')}>
        Генерация
      </Link>
      <Link to="/app/history" className={linkClass('/app/history')}>
        История
      </Link>
      {userRole === 'admin' && (
        <Link to="/admin" className={linkClass('/admin')}>
          Админка
        </Link>
      )}
      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
      >
        Выйти
      </button>
    </>
  ) : (
    <>
      <Link to="/pricing" className={linkClass('/pricing')}>
        Цены
      </Link>
      <Link
        to="/auth/login"
        className="px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all duration-200"
      >
        Войти
      </Link>
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold gradient-text">AI PhotoStudio</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!isLoggedIn && (
              <Link to="/" className={linkClass('/')}>
                Главная
              </Link>
            )}
            {authLinks}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {!isLoggedIn && (
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800"
              >
                Главная
              </Link>
            )}
            {isLoggedIn ? (
              <>
                <Link
                  to="/app"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Генерация
                </Link>
                <Link
                  to="/app/history"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  История
                </Link>
                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    Админка
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/pricing"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Цены
                </Link>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 text-center"
                >
                  Войти
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
