import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LatestArrivals.css';

const products = [
  { id: 1, name: "Sony Alpha a7S III", price: "$3,498.00" },
  { id: 2, name: "Canon RF 24-70mm f/2.8L", price: "$2,399.00" },
  { id: 3, name: "DJI RS 3 Pro Gimbal", price: "$869.00" },
  { id: 4, name: "Rode Wireless GO II", price: "$299.00" },
  { id: 5, name: "Sennheiser MKH 416", price: "$999.00" }
];

export default function LatestArrivals() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="latest-arrivals" id="new-in">
      <div className="container">
        <span className="section-label">New In</span>
        <h2 className="section-title">Latest Arrivals</h2>

        <div className="slideshow-container">
          <div className="slides-wrapper" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {products.map((product) => (
              <div key={product.id} className="slide">
                <div className="product-card">
                  <div className="product-image-placeholder">
                    {/* Placeholder for actual image */}
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">{product.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dots">
          {products.map((_, idx) => (
            <button 
              key={idx} 
              className={`dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="divider" style={{ marginTop: '80px' }}></div>
    </section>
  );
}
