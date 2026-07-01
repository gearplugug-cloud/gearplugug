import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useKit } from '../context/KitContext';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, setShopTab } = useKit();
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === '/';

  // Scroll to a section by id. If id is null, scroll to the top of the page.
  const scrollToSection = (id) => {
    if (!id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Navigate to a homepage section from any page.
  // If we're already on the homepage, just scroll. Otherwise go home first,
  // then scroll once the homepage has rendered.
  const goToSection = (id) => {
    setIsMenuOpen(false);
    if (onHome) {
      scrollToSection(id);
    } else {
      navigate('/');
      setTimeout(() => scrollToSection(id), 120);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          <img src="/logo.png" alt="Gear Plug UG Logo" className="logo-img" />
        </a>

        <div className="nav-right-actions">
          {currentUser && currentUser.name && (
            <button
              type="button"
              className="navbar-profile-btn"
              onClick={() => {
                setShopTab('profile');
                navigate('/shop');
                setIsMenuOpen(false);
              }}
              title={`View Profile: ${currentUser.name}`}
            >
              <span className="navbar-profile-avatar">{currentUser.avatar || '👤'}</span>
              <span className="navbar-profile-name">{(currentUser.name || '').split(' ')[0]}</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          <button
            type="button"
            className={`nav-link ${onHome ? 'active' : ''}`}
            onClick={() => goToSection(null)}
          >
            Home
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => goToSection('new-in')}
          >
            New Gear
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => goToSection('rental-form')}
          >
            Contact
          </button>
          <a
            href="/shop"
            className={`nav-link btn-shop-highlight ${!onHome ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Shop Portal
          </a>
        </div>
      </div>
    </nav>
  );
}
