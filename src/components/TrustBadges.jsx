import React from 'react';
import { Shield, Search, CheckCircle } from 'lucide-react';
import './TrustBadges.css';

export default function TrustBadges() {
  const badges = [
    {
      icon: <Shield size={32} />,
      title: "Secure Escrow",
      desc: "Payments are held securely by Gear Plug until you inspect and approve the gear."
    },
    {
      icon: <Search size={32} />,
      title: "24-Hour Inspection",
      desc: "Take your time to test sensors, lenses, and audio channels before finalizing."
    },
    {
      icon: <CheckCircle size={32} />,
      title: "Verified Community",
      desc: "Buy and sell with local Ugandan filmmakers, rental houses, and studios."
    }
  ];

  return (
    <section className="trust-badges-section">
      <div className="container">
        <div className="trust-badges-grid">
          {badges.map((badge, idx) => (
            <div key={idx} className="trust-badge-item">
              <div className="trust-badge-icon">{badge.icon}</div>
              <h3>{badge.title}</h3>
              <p>{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
