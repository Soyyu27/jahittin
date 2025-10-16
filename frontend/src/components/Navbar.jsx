import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, LayoutDashboard, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // <-- untuk cek path aktif

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fungsi bantu buat nambah class "active"
  const getLinkClass = (path) => {
    return location.pathname === path
      ? 'text-accent-green font-semibold'
      : 'hover:text-accent-green transition';
  };

  return (
    <nav className="bg-primary-dark text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold flex items-center space-x-2">
            <span className="text-accent-green">JAHIT</span>
            <span>IN</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={getLinkClass('/')}>
              Beranda
            </Link>
            <Link to="/products" className={getLinkClass('/products')}>
              Produk
            </Link>
            <Link to="/design" className={`flex items-center gap-2 ${getLinkClass('/design')}`}>
              <Palette size={18} />
              Desain Baju
            </Link>
            <Link to="/contact" className={getLinkClass('/contact')}>
              Kontak
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 ${getLinkClass('/dashboard')}`}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:text-accent-green transition">
                    <User size={18} />
                    {user?.name}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/orders"
                      className="block px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                    >
                      Pesanan Saya
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg flex items-center gap-2 text-red-600"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className={getLinkClass('/login')}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-accent-green px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4"
            >
              <Link
                to="/"
                className={`block py-2 ${getLinkClass('/')}`}
                onClick={() => setIsOpen(false)}
              >
                Beranda
              </Link>
              <Link
                to="/products"
                className={`block py-2 ${getLinkClass('/products')}`}
                onClick={() => setIsOpen(false)}
              >
                Produk
              </Link>
              <Link
                to="/design"
                className={`block py-2 flex items-center gap-2 ${getLinkClass('/design')}`}
                onClick={() => setIsOpen(false)}
              >
                <Palette size={18} />
                Desain Baju
              </Link>
              <Link
                to="/contact"
                className={`block py-2 ${getLinkClass('/contact')}`}
                onClick={() => setIsOpen(false)}
              >
                Kontak
              </Link>

              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/dashboard"
                      className={`block py-2 ${getLinkClass('/dashboard')}`}
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    className={`block py-2 ${getLinkClass('/orders')}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Pesanan Saya
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block py-2 text-red-400 hover:text-red-300 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`block py-2 ${getLinkClass('/login')}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 bg-accent-green rounded-lg mt-2 text-center hover:bg-green-600 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
