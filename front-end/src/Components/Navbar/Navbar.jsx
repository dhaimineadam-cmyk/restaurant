 import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaSignInAlt,
  FaInfoCircle,
  FaEnvelope,
  FaHamburger,
  FaUtensils,
  FaStore,
  FaComments,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaLayerGroup,
} from 'react-icons/fa';
import api from '../../../Api/api';
 
const links = [
  { to: '/', label: 'Accueil', icon: <FaHome /> },
  { to: '/menu', label: 'Menu', icon: <FaUtensils /> },
  { to: '/restaurants', label: 'Restaurants', icon: <FaStore /> },
  { to: '/about', label: 'About', icon: <FaInfoCircle /> },
  { to: '/feedback', label: 'Feedback', icon: <FaComments /> },
  { to: '/contact', label: 'Contact', icon: <FaEnvelope /> },
];
 
const NavLinkItem = ({ to, label, icon, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-x-2 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-900'
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);
 
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
 
  useEffect(() => {
    setMobileOpen(false);
    setCategoryOpen(false);
  }, [location.pathname]);
 
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);
 
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
 
    api.get('/categories')
      .then((response) => setCategories(response.data.data || response.data || []))
      .catch(() => setCategories([]));
  }, []);
 
  const closeMobileMenu = () => {
    setMobileOpen(false);
    setCategoryOpen(false);
  };
 
  const handleCategoryClick = (categoryId) => {
    navigate(`/menu?category=${categoryId}`);
    closeMobileMenu();
  };
 
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
    closeMobileMenu();
  };
 
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm border-b border-amber-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
 
        <NavLink to="/" className="flex items-center gap-x-3 text-amber-900" onClick={closeMobileMenu}>
          <FaHamburger className="h-8 w-8 rounded-full border border-amber-200 bg-amber-50 p-2" />
          <div>
            <p className="text-base font-semibold">SRMS</p>
            <p className="text-xs text-amber-600">Smart Restaurant</p>
          </div>
        </NavLink>
 
        {/* Desktop nav */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-4">
          <div className="flex flex-wrap items-center gap-2">
            {links.map((link) => (
              <NavLinkItem key={link.to} {...link} onClick={closeMobileMenu} />
            ))}
 
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryOpen((prev) => !prev)}
                className="flex items-center gap-x-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
              >
                <FaLayerGroup />
                <span>Catégories</span>
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {categoryOpen && (
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg">
                  {categories.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Aucune catégorie</div>
                  ) : (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryClick(category.id)}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-amber-50 hover:text-amber-900"
                      >
                        {category.title || category.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
 
        <div className="hidden lg:flex lg:items-center lg:gap-x-4">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-x-2 rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              <FaSignOutAlt /> Déconnexion
            </button>
          ) : (
            <NavLink
              to="/login"
              className="inline-flex items-center gap-x-2 rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              <FaSignInAlt /> Connexion
            </NavLink>
          )}
        </div>
 
        {/* Hamburger button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-white p-2 text-amber-900 transition hover:bg-amber-50 lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
          style={{ touchAction: 'manipulation' }}
        >
          {mobileOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
        </button>
      </div>
 
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-amber-100 bg-white" style={{ zIndex: 9999, position: 'relative' }}>
          <div className="space-y-1 px-4 py-4">
            {links.map((link) => (
              <div key={link.to} style={{ touchAction: 'manipulation' }}>
                <NavLinkItem {...link} onClick={closeMobileMenu} />
              </div>
            ))}
 
            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-3">
              <button
                type="button"
                onClick={() => setCategoryOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-sm font-semibold text-amber-900"
                style={{ touchAction: 'manipulation' }}
              >
                <span className="flex items-center gap-x-2">
                  <FaLayerGroup /> Catégories
                </span>
                <span className={`transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {categoryOpen && (
                <div className="mt-3 space-y-1">
                  {categories.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">Aucune catégorie</div>
                  ) : (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryClick(category.id)}
                        className="w-full rounded-2xl px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-white hover:text-amber-900"
                        style={{ touchAction: 'manipulation' }}
                      >
                        {category.title || category.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
 
            <div className="pt-2" style={{ touchAction: 'manipulation' }}>
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-x-2 rounded-full bg-amber-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
                  style={{ touchAction: 'manipulation' }}
                >
                  <FaSignOutAlt /> Déconnexion
                </button>
              ) : (
                <NavLink
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex w-full items-center justify-center gap-x-2 rounded-full bg-amber-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  <FaSignInAlt /> Connexion
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}