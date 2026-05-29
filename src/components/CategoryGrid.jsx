import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ShoppingCart, Plus } from 'lucide-react';
import { useKit } from '../context/KitContext';
import './CategoryGrid.css';

const gearItems = [
  { id: 'cam-1', name: 'RED Komodo 6K', brand: 'RED', category: 'Camera Bodies', price: 250 },
  { id: 'cam-2', name: 'ARRI Alexa Mini', brand: 'ARRI', category: 'Camera Bodies', price: 800 },
  { id: 'cam-3', name: 'Sony FX6', brand: 'Sony', category: 'Camera Bodies', price: 150 },
  { id: 'lens-1', name: 'Canon CN-E Prime Set', brand: 'Canon', category: 'Lenses', price: 300 },
  { id: 'lens-2', name: 'Zeiss CP.3 35mm', brand: 'Zeiss', category: 'Lenses', price: 80 },
  { id: 'sound-1', name: 'Sennheiser MKH 416', brand: 'Sennheiser', category: 'Sound Equipment', price: 45 },
  { id: 'acc-1', name: 'V-Mount Battery 150Wh', brand: 'Core SWX', category: 'Accessories', price: 25 },
  { id: 'tripod-1', name: 'Sachtler Video 18', brand: 'Sachtler', category: 'Tripods & Lighting', price: 65 },
];

const brands = ['All', 'RED', 'ARRI', 'Sony', 'Canon', 'Zeiss', 'Sennheiser', 'Core SWX', 'Sachtler'];
const categories = ['Camera Bodies', 'Lenses', 'Sound Equipment', 'Accessories', 'Tripods & Lighting'];

function DraggableGearCard({ item }) {
  const { addToKit } = useKit();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: item,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="gear-card">
      <div className="gear-card-image">
        {item.img && (
          <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
        )}
        <button 
          className="quick-add-btn" 
          onClick={(e) => { e.stopPropagation(); addToKit(item); }}
          title="Add to Kit"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="gear-card-info">
        <span className="gear-brand">{item.brand}</span>
        <h4>{item.name}</h4>
        <div className="gear-price-row">
          <div className="gear-price">${item.price}/day</div>
          <button className="add-text-btn" onClick={(e) => { e.stopPropagation(); addToKit(item); }}>
            <ShoppingCart size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoryGrid() {
  const [activeBrand, setActiveBrand] = useState('All');

  const filteredItems = gearItems.filter(item => 
    activeBrand === 'All' ? true : item.brand === activeBrand
  );

  return (
    <section className="dynamic-gear-hub container">
      <div className="hub-header">
        <h2 className="section-title">Build Your Kit</h2>
        
        <div className="brand-filters">
          {brands.map(brand => (
            <button 
              key={brand}
              className={`brand-filter-btn ${activeBrand === brand ? 'active' : ''}`}
              onClick={() => setActiveBrand(brand)}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {categories.map(category => {
        const itemsInCategory = filteredItems.filter(item => item.category === category);

        return (
          <div key={category} className="category-section" id={`cat-${category.replace(/[^a-zA-Z]/g, '')}`}>
            <h3 className="category-heading">{category}</h3>
            {itemsInCategory.length > 0 ? (
              <div className="gear-grid">
                {itemsInCategory.map(item => (
                  <DraggableGearCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>No items match this filter.</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
