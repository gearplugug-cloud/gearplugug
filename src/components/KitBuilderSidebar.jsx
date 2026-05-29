import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useKit } from '../context/KitContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import './KitBuilderSidebar.css';

export default function KitBuilderSidebar() {
  const { kitItems, totalCost, totalItems, removeFromKit, isCartOpen, setIsCartOpen } = useKit();
  const navigate = useNavigate();

  const { isOver, setNodeRef } = useDroppable({
    id: 'kit-sidebar',
  });

  const sidebarStyle = {
    backgroundColor: isOver ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.85)',
    borderLeft: isOver ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
  };

  return (
    <>
      {/* ── Toggle Button ── */}
      <button
        className={`kit-toggle-btn ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(!isCartOpen)}
        aria-label={isCartOpen ? 'Close Kit Sidebar' : 'Open Kit Sidebar'}
      >
        <ShoppingBag size={20} />
        {totalItems > 0 && (
          <span className="kit-badge">{totalItems}</span>
        )}
        {isCartOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* ── Sidebar Panel ── */}
      <div
        ref={setNodeRef}
        className={`kit-sidebar ${isCartOpen ? 'open' : 'closed'}`}
        style={sidebarStyle}
      >
        <div className="kit-sidebar-header">
          <h3>Your Kit</h3>
          <span className="item-count">{totalItems} ITEMS</span>
        </div>

        <div className="kit-sidebar-content">
          {kitItems.length === 0 ? (
            <p className="empty-msg">Drag & drop gear here to build your kit.</p>
          ) : (
            <ul className="kit-items-list">
              {kitItems.map((item) => (
                <li key={item.id} className="kit-item">
                  <div className="item-thumbnail">
                    <div className="thumb-placeholder"></div>
                  </div>
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">${item.price}/day</span>
                  </div>
                  <div className="item-actions">
                    <CheckCircle size={16} color="var(--accent-color)" />
                    <button className="remove-btn" onClick={() => removeFromKit(item.id)}>
                      <X size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="kit-sidebar-footer">
          <div className="total-cost">
            <span>Estimated:</span>
            <span className="cost-value">${totalCost}/day</span>
          </div>
          <button
            className="finalize-btn"
            onClick={() => {
              document.querySelector('#rental-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            disabled={kitItems.length === 0}
          >
            Finalize Kit & Rent
          </button>
        </div>
      </div>
    </>
  );
}
