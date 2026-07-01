import React from 'react';
import { useKit } from '../context/KitContext';
import './RentalForm.css';

export default function RentalForm() {
  const { kitItems, totalCost } = useKit();

  return (
    <section className="rental-form-section container" id="rental-form" style={{ padding: '80px 24px' }}>
      <h2 className="section-title">Finalize Your Kit</h2>
      <div className="rental-form-grid">
        <div className="kit-review">
          <h3>Kit Review</h3>
          {kitItems.length === 0 ? (
            <p>Your kit is empty.</p>
          ) : (
            <ul className="review-list">
              {kitItems.map((item) => (
                <li key={item.id} className="review-item">
                  <span>{item.name} ({item.brand})</span>
                  <span>UGX {item.price.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="review-total">
            <strong>Estimated Total:</strong> <span style={{ color: 'var(--accent-color)' }}>UGX {totalCost.toLocaleString()}/day</span>
          </div>
        </div>

        <div className="rental-details">
          <form className="rental-form" onSubmit={(e) => { e.preventDefault(); alert("Rental Request Submitted!"); }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" required />
            </div>
            <div className="form-group">
              <label>Shoot Dates</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" required />
                <input type="date" required />
              </div>
            </div>
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea rows="4"></textarea>
            </div>
            <button type="submit" className="submit-rental-btn">Submit Rental Request</button>
          </form>
        </div>
      </div>
    </section>
  );
}
