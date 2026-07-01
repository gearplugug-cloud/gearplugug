import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LatestArrivals.css';

const products = [
  { id: 1, name: "Sony Alpha a7S III", price: "UGX 13,000,000", img: "/sony_a7siii_1782844190950.png" },
  { id: 2, name: "Canon RF 24-70mm f/2.8L", price: "UGX 8,900,000", img: "/canon_lens_1782841425731.png" },
  { id: 3, name: "DJI RS 3 Pro Gimbal", price: "UGX 3,200,000", img: "/dji_gimbal_1782841445580.png" },
  { id: 4, name: "Rode Wireless GO II", price: "UGX 1,100,000", img: "/rode_wireless_1782841493569.png" },
  { id: 5, name: "Sennheiser MKH 416", price: "UGX 3,700,000", img: "/sennheiser_mic_1782841434894.png" }
];

export default function LatestArrivals() {
  // Duplicate array so marquee can loop seamlessly
  const marqueeProducts = [...products, ...products];

  return (
    <section className="latest-arrivals" id="new-in">
      <div className="container">
        <span className="section-label">New In</span>
        <h2 className="section-title">Latest Arrivals</h2>

        <div className="slideshow-container">
          <div className="slides-wrapper">
            {marqueeProducts.map((product, idx) => (
              <div key={`${product.id}-${idx}`} className="slide">
                <div className="product-card">
                  <div className="product-image-placeholder">
                    {product.img ? (
                      <img src={product.img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    )}
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

      </div>
      <div className="divider" style={{ marginTop: '80px' }}></div>
    </section>
  );
}
