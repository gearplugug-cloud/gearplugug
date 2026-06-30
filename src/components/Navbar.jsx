import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
          GEAR<span className="text-accent">PLUG</span>
        </a>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

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
