import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Camera, ShoppingBag } from 'lucide-react';
import { useKit } from '../context/KitContext';
import './MarketplaceHero.css';

export default function MarketplaceHero() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { setShopTab } = useKit();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate('/shop', { state: { searchQuery: query } });
    }
  };

  const handleAction = (tab) => {
    setShopTab(tab);
    navigate('/shop');
  };

  return (
    <section className="marketplace-hero">
      <div className="hero-background"></div>
      <div className="container hero-content text-center">
        <h1 className="hero-headline">Buy and Sell Pro Camera Gear Safely</h1>
        <p className="hero-subheadline">
          Uganda's premier escrow-protected marketplace for filmmakers, photographers, and rental houses.
        </p>

        <form className="hero-search-form" onSubmit={handleSearch}>
          <div className="hero-search-wrapper">
            <Search className="search-icon" size={24} />
            <input 
              type="text" 
              placeholder="Search for cameras, lenses, lighting, audio..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="hero-search-btn">Find Gear</button>
          </div>
        </form>

        <div className="hero-quick-actions">
          <button className="action-card" onClick={() => handleAction('all')}>
            <ShoppingBag size={24} className="action-icon" />
            <span>Buy Used Gear</span>
          </button>
          <button className="action-card" onClick={() => handleAction('all')}>
            <Camera size={24} className="action-icon" />
            <span>List Your Gear</span>
          </button>
          <button className="action-card" onClick={() => navigate('/rentals')}>
            <ShieldCheck size={24} className="action-icon" />
            <span>Rent Locally</span>
          </button>
        </div>
      </div>
    </section>
  );
}
