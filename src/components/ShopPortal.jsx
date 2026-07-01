import React, { useState, useMemo, useEffect } from 'react';
import { useKit } from '../context/KitContext';

import { ArrowLeft, ShieldCheck, Truck, CreditCard, Smartphone, CheckCircle, Search, Filter, Loader2, X, Package, MapPin, User, Phone, Mail, Upload, Camera } from 'lucide-react';
import './ShopPortal.css';

const CATEGORIES = ['All', 'Camera Bodies', 'Lenses', 'Sound Equipment', 'Accessories', 'Tripods & Lighting'];

export default function ShopPortal() {
  const { kitItems, totalCost, clearKit, addToKit, removeFromKit, products, addMarketplaceProduct } = useKit();
  const [view, setView] = useState('browse'); // 'browse' | 'checkout' | 'success'
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Marketplace modal and form state
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [listingForm, setListingForm] = useState({
    name: '',
    brand: '',
    category: 'Camera Bodies',
    condition: 'Excellent',
    price: '',
    description: '',
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
    img: '',
  });

  // Checkout form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Kampala',
    notes: '',
    paymentMethod: 'mobile_money',
    mobileProvider: 'mtn',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600); // short delay for UX
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const handleListingFormChange = (e) => {
    setListingForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setListingForm(prev => ({ ...prev, img: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleListingSubmit = (e) => {
    e.preventDefault();
    if (!listingForm.name || !listingForm.brand || !listingForm.price || !listingForm.sellerName || !listingForm.sellerPhone) {
      alert("Please fill in all required fields.");
      return;
    }
    const newProduct = {
      id: `mp-${Date.now()}`,
      name: listingForm.name,
      brand: listingForm.brand,
      category: listingForm.category,
      price: parseFloat(listingForm.price),
      description: listingForm.description,
      img: listingForm.img || '/fx6_camera_1782841415607.png',
      condition: listingForm.condition,
      seller: {
        name: listingForm.sellerName,
        phone: listingForm.sellerPhone,
        email: listingForm.sellerEmail,
      },
      isMarketplace: true,
    };
    addMarketplaceProduct(newProduct);
    setIsListingModalOpen(false);
    // Reset form
    setListingForm({
      name: '',
      brand: '',
      category: 'Camera Bodies',
      condition: 'Excellent',
      price: '',
      description: '',
      sellerName: '',
      sellerPhone: '',
      sellerEmail: '',
      img: '',
    });
  };

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (kitItems.length === 0) return;
    setIsCheckingOut(true);

    // Simulate order processing
    setTimeout(() => {
      setIsCheckingOut(false);
      setView('success');
    }, 2000);
  };

  const handleNewOrder = () => {
    clearKit();
    setView('browse');
    setForm({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: 'Kampala',
      notes: '',
      paymentMethod: 'mobile_money',
      mobileProvider: 'mtn',
    });
  };

  /* ─────────────── SUCCESS VIEW ─────────────── */
  if (view === 'success') {
    const orderNum = `GP-${Date.now().toString(36).toUpperCase()}`;
    return (
      <div className="shop-portal container success-view">
        <div className="success-card">
          <div className="success-icon-ring">
            <CheckCircle size={64} />
          </div>
          <h1>Order Confirmed!</h1>
          <p className="order-number">Order #{orderNum}</p>
          <p className="success-msg">
            Your gear is being prepped. A Gear Plug specialist will contact you
            at <strong>{form.phone || 'your number'}</strong> shortly for delivery
            coordination in {form.city || 'Kampala'}.
          </p>

          <div className="order-summary-mini">
            <h3>Order Summary</h3>
            <ul>
              {kitItems.map(item => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <span className="text-accent">UGX {item.price.toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="order-total-row">
              <span>Total</span>
              <span>UGX {totalCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="success-actions">
            <button className="btn-primary" onClick={handleNewOrder}>Place Another Order</button>
            <a href="/" className="btn-outline">Return Home</a>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────── CHECKOUT VIEW ─────────────── */
  if (view === 'checkout') {
    return (
      <div className="shop-portal container checkout-view">
        <div className="portal-header mb-8">
          <button className="back-home-link" onClick={() => setView('browse')}>
            <ArrowLeft size={16} /> Back to Shop
          </button>
        </div>

        <div className="checkout-layout">
          {/* Left: Form */}
          <div className="checkout-form-section">
            <span className="section-label">Secure Checkout</span>
            <h1 className="section-title">Complete Your Order</h1>

            <form onSubmit={handleCheckout} className="checkout-form">
              {/* Customer Info */}
              <div className="form-group-heading">
                <User size={16} /> Customer Information
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+256 7XX XXX XXX"
                    value={form.phone}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              {/* Delivery */}
              <div className="form-group-heading">
                <MapPin size={16} /> Delivery Details
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="address">Street Address *</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Plot 12, Kampala Road"
                    value={form.address}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Kampala"
                    value={form.city}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div className="form-field full-width">
                <label htmlFor="notes">Order Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Any special delivery instructions..."
                  value={form.notes}
                  onChange={handleFormChange}
                  rows={3}
                />
              </div>

              {/* Payment */}
              <div className="form-group-heading">
                <CreditCard size={16} /> Payment Method
              </div>
              <div className="payment-options">
                <button
                  type="button"
                  className={`payment-option ${form.paymentMethod === 'mobile_money' ? 'active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, paymentMethod: 'mobile_money' }))}
                >
                  <Smartphone size={20} />
                  <span>Mobile Money</span>
                </button>
                <button
                  type="button"
                  className={`payment-option ${form.paymentMethod === 'cash' ? 'active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, paymentMethod: 'cash' }))}
                >
                  <Package size={20} />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {form.paymentMethod === 'mobile_money' && (
                <div className="mm-provider-options">
                  <button
                    type="button"
                    className={`mm-option ${form.mobileProvider === 'mtn' ? 'active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, mobileProvider: 'mtn' }))}
                  >
                    <div className="mm-logo mtn">MTN</div>
                    <span>MTN MoMo</span>
                  </button>
                  <button
                    type="button"
                    className={`mm-option ${form.mobileProvider === 'airtel' ? 'active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, mobileProvider: 'airtel' }))}
                  >
                    <div className="mm-logo airtel">Airtel</div>
                    <span>Airtel Money</span>
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isCheckingOut || kitItems.length === 0}
                className="checkout-btn"
              >
                {isCheckingOut ? (
                  <><Loader2 className="animate-spin" size={18} /> PROCESSING ORDER...</>
                ) : (
                  `PLACE ORDER — UGX ${totalCost.toLocaleString()}`
                )}
              </button>

              <p className="secure-note">
                <ShieldCheck size={12} /> Your information is secured and encrypted
              </p>
            </form>
          </div>

          {/* Right: Order Summary */}
          <aside className="checkout-summary">
            <div className="cart-sticky-box shadow-premium">
              <h2 className="summary-title mb-6">Order Summary</h2>
              <ul className="mini-cart-list">
                {kitItems.map(item => (
                  <li key={item.id} className="mini-item">
                    <div className="mini-visual">
                      <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                    </div>
                    <div className="mini-details">
                      <span className="name">{item.name}</span>
                      <span className="brand">{item.brand}</span>
                      <span className="price">UGX {item.price.toLocaleString()}</span>
                    </div>
                    <button className="remove-mini" onClick={() => removeFromKit(item.id)}>
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="cart-totals">
                <div className="total-line">
                  <span>Subtotal</span>
                  <span>UGX {totalCost.toLocaleString()}</span>
                </div>
                <div className="total-line">
                  <span>Delivery</span>
                  <span className="text-accent">FREE</span>
                </div>
                <div className="total-line grand-total">
                  <span>Total</span>
                  <span>UGX {totalCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="trust-stack mt-8">
                <div className="trust-item"><ShieldCheck size={14} /> <span>100% Secure</span></div>
                <div className="trust-item"><Smartphone size={14} /> <span>MTN MoMo / Airtel Money</span></div>
                <div className="trust-item"><Truck size={14} /> <span>Free Kampala Delivery</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  /* ─────────────── BROWSE VIEW (default) ─────────────── */
  return (
    <div className="shop-portal container" style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh' }}>
      <div className="portal-header mb-8">
        <a href="/" className="back-home-link">
          <ArrowLeft size={16} /> Back to Home
        </a>
      </div>

      <div className="shop-layout">
        {/* ── Left: Browse ── */}
        <div className="shop-browse">
          <header className="mb-8 shop-browse-header">
            <div>
              <span className="section-label">Inventory Hub</span>
              <h1 className="section-title" style={{ marginBottom: 0 }}>Browse Equipment</h1>
            </div>
            <button className="btn-list-gear" onClick={() => setIsListingModalOpen(true)}>
              + List Your Gear
            </button>
          </header>

          <div className="shop-controls mb-8">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search gear..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="category-chips">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  className={`chip ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="shop-product-grid">
            {loading ? (
              <div className="loading-state">
                <Loader2 className="animate-spin" size={40} />
                <p>Fetching Gear Plug Inventory...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <p>No gear found matching your criteria.</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div key={product.id} className="shop-item-card">
                  <div className="item-visual">
                    <img src={product.img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />
                    {product.isMarketplace && (
                      <span className="marketplace-badge">Marketplace</span>
                    )}
                  </div>
                  <div className="item-meta">
                    <div className="brand-row">
                      <span className="item-brand">{product.brand}</span>
                      {product.isMarketplace && (
                        <span className="item-condition">{product.condition}</span>
                      )}
                    </div>
                    <h3>{product.name}</h3>
                    <p className="item-desc">{product.description}</p>
                    
                    {product.isMarketplace && (
                      <div className="seller-card-info">
                        <div className="seller-name">
                          Seller: <strong>{product.seller.name}</strong>
                        </div>
                        <div className="seller-contact text-muted">
                          <span>{product.seller.phone}</span>
                          {product.seller.email && <span> | {product.seller.email}</span>}
                        </div>
                      </div>
                    )}
                    
                    <div className="item-footer">
                      <span className="item-price">UGX {product.price.toLocaleString()}</span>
                      <button className="add-btn-small" onClick={() => addToKit(product)}>
                        ADD TO KIT
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Right: Sidebar Cart ── */}
        <aside className="shop-sidebar">
          <div className="cart-sticky-box shadow-premium">
            <h2 className="summary-title mb-6">Your Selection</h2>
            {kitItems.length === 0 ? (
              <div className="empty-mini-cart">
                <Package size={32} className="text-muted" />
                <p>Select gear to build your kit.</p>
              </div>
            ) : (
              <>
                <ul className="mini-cart-list">
                  {kitItems.map(item => (
                    <li key={item.id} className="mini-item">
                      <div className="mini-visual">
                        <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                      </div>
                      <div className="mini-details">
                        <span className="name">{item.name}</span>
                        <span className="price">UGX {item.price.toLocaleString()}</span>
                      </div>
                      <button className="remove-mini" onClick={() => removeFromKit(item.id)}>×</button>
                    </li>
                  ))}
                </ul>

                <div className="cart-summary-total">
                  <div className="total-row">
                    <span>Total</span>
                    <span className="text-accent">UGX {totalCost.toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setView('checkout')} 
                  className="checkout-btn-primary"
                >
                  PROCEED TO CHECKOUT
                </button>
              </>
            )}

            <div className="trust-stack mt-8">
              <div className="trust-item"><ShieldCheck size={14} /> <span>100% Secure</span></div>
              <div className="trust-item"><Smartphone size={14} /> <span>Mobile Money / FlexiPay</span></div>
              <div className="trust-item"><Truck size={14} /> <span>Kampala Delivery</span></div>
            </div>
          </div>
      </div>

      {/* ── Marketplace Listing Modal ── */}
      {isListingModalOpen && (
        <div className="marketplace-modal-overlay">
          <div className="marketplace-modal shadow-premium">
            <button className="modal-close-btn" onClick={() => setIsListingModalOpen(false)}>
              <X size={20} />
            </button>
            <div className="modal-header">
              <Camera size={24} className="text-accent" />
              <h2>List Your Camera Gear</h2>
              <p className="text-muted">Fill in the details below to put your equipment up for sale in the marketplace.</p>
            </div>
            
            <form onSubmit={handleListingSubmit} className="marketplace-form">
              <div className="form-grid">
                {/* Left side: details */}
                <div className="form-main-details">
                  <div className="form-row">
                    <div className="form-field">
                      <label>Equipment Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        placeholder="e.g. Sony a7 IV" 
                        value={listingForm.name} 
                        onChange={handleListingFormChange} 
                        required 
                      />
                    </div>
                    <div className="form-field">
                      <label>Brand *</label>
                      <input 
                        type="text" 
                        name="brand" 
                        placeholder="e.g. Sony" 
                        value={listingForm.brand} 
                        onChange={handleListingFormChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Category *</label>
                      <select 
                        name="category" 
                        value={listingForm.category} 
                        onChange={handleListingFormChange}
                      >
                        <option value="Camera Bodies">Camera Bodies</option>
                        <option value="Lenses">Lenses</option>
                        <option value="Sound Equipment">Sound Equipment</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Tripods & Lighting">Tripods & Lighting</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Condition *</label>
                      <select 
                        name="condition" 
                        value={listingForm.condition} 
                        onChange={handleListingFormChange}
                      >
                        <option value="New">New (Unopened)</option>
                        <option value="Like New">Like New (Mint)</option>
                        <option value="Excellent">Excellent Condition</option>
                        <option value="Good">Good (Used)</option>
                        <option value="Fair">Fair (Well Used)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Price (UGX) *</label>
                      <input 
                        type="number" 
                        name="price" 
                        placeholder="e.g. 8500000" 
                        value={listingForm.price} 
                        onChange={handleListingFormChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="form-field full-width">
                    <label>Description & Condition Notes</label>
                    <textarea 
                      name="description" 
                      placeholder="Describe what's included, cosmetic condition, functionality..." 
                      value={listingForm.description} 
                      onChange={handleListingFormChange} 
                      rows={3}
                    />
                  </div>
                </div>
                
                {/* Right side: image upload & seller info */}
                <div className="form-sidebar-details">
                  <div className="form-field image-upload-field">
                    <label>Product Photo</label>
                    <div className="image-upload-zone">
                      {listingForm.img ? (
                        <div className="upload-preview">
                          <img src={listingForm.img} alt="Preview" />
                          <button type="button" className="remove-preview" onClick={() => setListingForm(prev => ({ ...prev, img: '' }))}>
                            Change Photo
                          </button>
                        </div>
                      ) : (
                        <label className="upload-label">
                          <Upload size={32} />
                          <span>Click to upload image</span>
                          <span className="text-muted text-xs">Supports JPG, PNG</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  
                  <div className="seller-section">
                    <h3>Seller Contact Details</h3>
                    <div className="form-field">
                      <label>Seller Name *</label>
                      <input 
                        type="text" 
                        name="sellerName" 
                        placeholder="Your full name" 
                        value={listingForm.sellerName} 
                        onChange={handleListingFormChange} 
                        required 
                      />
                    </div>
                    <div className="form-field">
                      <label>Phone Number *</label>
                      <input 
                        type="tel" 
                        name="sellerPhone" 
                        placeholder="e.g. +256 701 234 567" 
                        value={listingForm.sellerPhone} 
                        onChange={handleListingFormChange} 
                        required 
                      />
                    </div>
                    <div className="form-field">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        name="sellerEmail" 
                        placeholder="Optional" 
                        value={listingForm.sellerEmail} 
                        onChange={handleListingFormChange} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsListingModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-listing">
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
