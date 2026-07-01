import React, { useState, useMemo, useEffect } from 'react';
import { useKit } from '../context/KitContext';
import { createOrder as createWooCommerceOrder } from '../lib/woocommerce';

import { ArrowLeft, ShieldCheck, Truck, CreditCard, Smartphone, CheckCircle, Search, Filter, Loader2, X, Package, MapPin, User, Phone, Mail, Upload, Camera } from 'lucide-react';
import './ShopPortal.css';

const CATEGORIES = ['All', 'Camera Bodies', 'Lenses', 'Sound Equipment', 'Accessories', 'Tripods & Lighting'];

export default function ShopPortal() {
  const { kitItems, totalCost, clearKit, addToKit, removeFromKit, products, addMarketplaceProduct, currentUser, changeUser, orders, addOrder, profiles, createProfile } = useKit();
  const [view, setView] = useState('browse'); // 'browse' | 'checkout' | 'success'
  
  // Profile creation modal and form state
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Professional Filmmaker',
    company: '',
    location: 'Kampala, UG',
    avatar: '📷'
  });
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

  // --- 1. Flash Sale state and timer ---
  const [flashSaleTimeLeft, setFlashSaleTimeLeft] = useState(14400); // 4 hours
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleTimeLeft(prev => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };


  // --- 3. Favorites / Wishlist state ---
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gearplug_favorites') || '[]');
    } catch (e) {
      return [];
    }
  });

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('gearplug_favorites', JSON.stringify(next));
      return next;
    });
  };

  // --- 4. Saved Searches / Filters state ---
  const [savedFilters, setSavedFilters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gearplug_saved_filters') || '[]');
    } catch (e) {
      return [];
    }
  });

  const saveCurrentFilter = () => {
    if (!searchQuery && activeCategory === 'All') {
      alert("Search query or category must be set to save a filter shortcut.");
      return;
    }
    const filterName = searchQuery 
      ? `"${searchQuery}" in ${activeCategory}` 
      : `Category: ${activeCategory}`;
      
    const newFilter = {
      id: `sf-${Date.now()}`,
      category: activeCategory,
      query: searchQuery,
      name: filterName
    };

    setSavedFilters(prev => {
      const next = [...prev, newFilter];
      localStorage.setItem('gearplug_saved_filters', JSON.stringify(next));
      return next;
    });
  };

  const applySavedFilter = (filter) => {
    setActiveCategory(filter.category);
    setSearchQuery(filter.query);
  };

  const deleteSavedFilter = (id) => {
    setSavedFilters(prev => {
      const next = prev.filter(f => f.id !== id);
      localStorage.setItem('gearplug_saved_filters', JSON.stringify(next));
      return next;
    });
  };

  // --- 5. Bidding Session (Auctions) state ---
  const INITIAL_AUCTIONS = [
    {
      id: 'auc-001',
      name: 'Leica M6 Classic Rangefinder',
      brand: 'Leica',
      description: 'Stunning vintage analog camera in black chrome finish. Mechanical shutter, crisp viewfinder, pristine aesthetic condition.',
      img: '/arri_alexa_1782843732555.png',
      basePrice: 8500000,
      currentBid: 9200000,
      highestBidder: 'Kalyango David',
      timeLeft: 7200 + 45, // 2 hours
      bidsCount: 14,
      minIncrement: 50000
    },
    {
      id: 'auc-002',
      name: 'Zeiss Otus 85mm f/1.4 Lens',
      brand: 'Zeiss',
      description: 'The ultimate portrait prime lens. Delivers medium-format detail and quality on full-frame cameras.',
      img: '/zeiss_cp3_1782843751691.png',
      basePrice: 12000000,
      currentBid: 12450000,
      highestBidder: 'Nsubuga Henry',
      timeLeft: 18000 + 12, // 5 hours
      bidsCount: 8,
      minIncrement: 100000
    }
  ];

  const [auctions, setAuctions] = useState(() => {
    try {
      const saved = localStorage.getItem('gearplug_auctions');
      return saved ? JSON.parse(saved) : INITIAL_AUCTIONS;
    } catch (e) {
      return INITIAL_AUCTIONS;
    }
  });

  const [bidInputs, setBidInputs] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setAuctions(prev => {
        const ticked = prev.map(auc => ({
          ...auc,
          timeLeft: auc.timeLeft > 0 ? auc.timeLeft - 1 : 0
        }));
        return ticked;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBidInputChange = (aucId, value) => {
    setBidInputs(prev => ({ ...prev, [aucId]: value }));
  };

  const placeBid = (aucId) => {
    const inputVal = bidInputs[aucId];
    if (!inputVal) return;
    const bidAmount = parseFloat(inputVal);
    const target = auctions.find(a => a.id === aucId);
    if (!target) return;
    
    if (target.timeLeft <= 0) {
      alert("This auction session has ended!");
      return;
    }
    
    if (bidAmount < target.currentBid + target.minIncrement) {
      alert(`Min bid required is UGX ${(target.currentBid + target.minIncrement).toLocaleString()}`);
      return;
    }
    
    const bidderName = prompt("Enter your name to place the bid:") || "Anonymous";
    
    setAuctions(prev => {
      const next = prev.map(auc => {
        if (auc.id === aucId) {
          return {
            ...auc,
            currentBid: bidAmount,
            highestBidder: bidderName,
            bidsCount: auc.bidsCount + 1
          };
        }
        return auc;
      });
      localStorage.setItem('gearplug_auctions', JSON.stringify(next));
      return next;
    });
    
    setBidInputs(prev => ({ ...prev, [aucId]: '' }));
    alert("Bid registered successfully!");
  };

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

  const handleProfileFormChange = (e) => {
    setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email || !profileForm.phone) {
      alert("Please fill in all required fields.");
      return;
    }
    const newProfile = {
      id: `usr-${Date.now()}`,
      ...profileForm
    };
    createProfile(newProfile);
    setIsCreateProfileModalOpen(false);
    // Reset form
    setProfileForm({
      name: '',
      email: '',
      phone: '',
      role: 'Professional Filmmaker',
      company: '',
      location: 'Kampala, UG',
      avatar: '📷'
    });
    alert(`Profile created successfully! Welcome, ${newProfile.name}!`);
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
    const sellerPayout = parseFloat(listingForm.price);
    const calculatedListingPrice = Math.round(sellerPayout / 0.8);

    const newProduct = {
      id: `mp-${Date.now()}`,
      name: listingForm.name,
      brand: listingForm.brand,
      category: listingForm.category,
      price: calculatedListingPrice,
      sellerPayout: sellerPayout,
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

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (kitItems.length === 0) return;
    setIsCheckingOut(true);

    const newOrder = {
      id: `GP-${Date.now().toString(36).toUpperCase()}`,
      customerId: currentUser.id,
      date: new Date().toISOString(),
      items: kitItems.map(item => ({ id: item.id, name: item.name, price: item.price })),
      total: totalCost,
      city: form.city || 'Kampala'
    };

    try {
      const wooOrder = await createWooCommerceOrder(kitItems, form);
      if (wooOrder && wooOrder.id) {
        newOrder.id = `WC-${wooOrder.id}`;
      }
    } catch (err) {
      console.warn("Failed to sync checkout with WooCommerce backend, fallback local order placed:", err);
    }

    setTimeout(() => {
      addOrder(newOrder);
      setIsCheckingOut(false);
      setView('success');
    }, 1500);
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

      {/* ── Flash Sale Banner ── */}
      <div className="flash-sale-banner mb-8 shadow-premium">
        <div className="flash-sale-content">
          <div className="flash-badge-pulsing">⚡ FLASH SALE DEALS</div>
          <h2>Kampala Cinema Equipment Flash Sale</h2>
          <p className="flash-desc text-muted">Get premium brand-new equipment directly imported to Uganda at direct-to-customer sale pricing. Free Kampala Delivery.</p>
          
          <div className="flash-deals-row">
            <div className="flash-deal-card">
              <div className="deal-image">
                <img src="/fx6_camera_1782841415607.png" alt="Sony FX6 Deal" />
              </div>
              <div className="deal-info">
                <h3>Sony FX6 Cinema Camera (Body)</h3>
                <div className="deal-prices">
                  <span className="original-price">UGX 12,500,000</span>
                  <span className="sale-price text-accent">UGX 9,990,000</span>
                </div>
              </div>
            </div>

            <div className="flash-deal-card">
              <div className="deal-image">
                <img src="/aputure_light_1782841503328.png" alt="Aputure 600d Deal" />
              </div>
              <div className="deal-info">
                <h3>Aputure LS 600d Pro LED Light</h3>
                <div className="deal-prices">
                  <span className="original-price">UGX 5,500,000</span>
                  <span className="sale-price text-accent">UGX 4,200,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flash-timer-sidebar">
          <span className="timer-label">TIME REMAINING</span>
          <div className="timer-clock">{formatTime(flashSaleTimeLeft)}</div>
          <div className="timer-bar-bg">
            <div className="timer-bar-fill" style={{ width: `${(flashSaleTimeLeft / 14400) * 100}%` }}></div>
          </div>
          <p className="timer-note">Taxes & customs included. Order today for free local delivery.</p>
        </div>
      </div>

      {/* ── Saved Filters & Favorites Shortcuts ── */}
      <div className="shop-shortcuts-row mb-6">
        <div className="saved-searches-box">
          <span className="shortcuts-title">Saved Searches:</span>
          {savedFilters.length === 0 ? (
            <span className="no-shortcuts text-muted">No saved searches. Use "Save Search" below to bookmark.</span>
          ) : (
            <div className="shortcuts-list">
              {savedFilters.map(filter => (
                <div key={filter.id} className="shortcut-chip">
                  <button className="apply-btn" onClick={() => applySavedFilter(filter)}>{filter.name}</button>
                  <button className="delete-btn" onClick={() => deleteSavedFilter(filter.id)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="favorites-box">
          <span className="shortcuts-title">Wishlist ({favorites.length}):</span>
          {favorites.length === 0 ? (
            <span className="no-shortcuts text-muted">No wishlisted items. Tap heart on products.</span>
          ) : (
            <div className="wishlist-previews">
              {products.filter(p => favorites.includes(p.id)).slice(0, 4).map(fav => (
                <div key={fav.id} className="mini-fav-item" title={fav.name} onClick={() => { setActiveCategory(fav.category); setSearchQuery(fav.name); }}>
                  <img src={fav.img} alt={fav.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
              {favorites.length > 4 && <span className="more-favs">+{favorites.length - 4}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="shop-layout">
        {/* ── Left: Browse ── */}
        <div className="shop-browse">
          <header className="mb-8 shop-browse-header">
            <div>
              <span className="section-label">Inventory Hub</span>
              <h1 className="section-title" style={{ marginBottom: 0 }}>Browse Equipment</h1>
            </div>
            <button className="btn-list-gear" onClick={() => {
              setListingForm(prev => ({
                ...prev,
                sellerName: currentUser.name,
                sellerPhone: currentUser.phone,
                sellerEmail: currentUser.email || ''
              }));
              setIsListingModalOpen(true);
            }}>
              + List Your Gear
            </button>
          </header>

          {/* Shop Tabs */}
          <div className="shop-tab-controls mb-8">
            <button 
              className={`shop-tab-btn ${shopTab === 'buy' ? 'active' : ''}`}
              onClick={() => setShopTab('buy')}
            >
              🛒 Direct Buy
            </button>
            <button 
              className={`shop-tab-btn ${shopTab === 'bid' ? 'active' : ''}`}
              onClick={() => setShopTab('bid')}
            >
              🔨 Bidding Sessions (Live Auctions)
            </button>
            <button 
              className={`shop-tab-btn ${shopTab === 'profile' ? 'active' : ''}`}
              onClick={() => setShopTab('profile')}
            >
              👤 My Profile Dashboard
            </button>
          </div>

          {shopTab === 'profile' ? (
            /* User Profile & Dashboard View */
            <div className="profile-dashboard-layout">
              {/* Profile Card / Header */}
              <div className="profile-hero-card shadow-premium">
                <div className="profile-avatar-large">
                  {currentUser.avatar}
                </div>
                <div className="profile-primary-details">
                  <div className="name-badge-row">
                    <h2>{currentUser.name}</h2>
                    <span className="user-role-badge">{currentUser.role}</span>
                  </div>
                  <p className="user-org text-muted">{currentUser.company} • {currentUser.location}</p>
                  
                  <div className="user-contact-pills">
                    <span className="contact-pill"><Phone size={12} /> {currentUser.phone}</span>
                    <span className="contact-pill"><Mail size={12} /> {currentUser.email}</span>
                  </div>
                </div>

                {/* Profile Switcher dropdown */}
                <div className="profile-switcher-wrapper">
                  <label>Switch Profile Account:</label>
                  <div className="profile-switcher-row">
                    <select 
                      value={currentUser.id} 
                      onChange={(e) => {
                        const selected = profiles.find(u => u.id === e.target.value);
                        if (selected) changeUser(selected);
                      }}
                      className="profile-select-dropdown"
                    >
                      {profiles.map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                      ))}
                    </select>
                    
                    <button 
                      type="button" 
                      className="btn-create-profile-trigger" 
                      onClick={() => setIsCreateProfileModalOpen(true)}
                      title="Create New Profile"
                    >
                      + New Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Dashboard Stats */}
              <div className="dashboard-stats-grid mb-8">
                <div className="stat-card shadow-premium">
                  <span className="stat-title">My Gear Listings</span>
                  <strong className="stat-number">
                    {products.filter(p => p.sellerId === currentUser.id).length}
                  </strong>
                  <span className="stat-note">Items listed for sale</span>
                </div>
                <div className="stat-card shadow-premium">
                  <span className="stat-title">Bids Placed</span>
                  <strong className="stat-number">
                    {auctions.filter(a => a.highestBidder === currentUser.name).length}
                  </strong>
                  <span className="stat-note">Active auction sessions</span>
                </div>
                <div className="stat-card shadow-premium">
                  <span className="stat-title">Order History</span>
                  <strong className="stat-number">
                    {orders.filter(o => o.customerId === currentUser.id).length}
                  </strong>
                  <span className="stat-note">Completed purchases</span>
                </div>
              </div>

              {/* Transactions Tab Section */}
              <div className="profile-details-sections">
                {/* Listings */}
                <div className="dashboard-section shadow-premium">
                  <h3>My Gear for Sale</h3>
                  {products.filter(p => p.sellerId === currentUser.id).length === 0 ? (
                    <p className="no-data text-muted">You haven't listed any equipment yet. Click "+ List Your Gear" to sell.</p>
                  ) : (
                    <div className="dashboard-table-wrapper">
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Gear</th>
                            <th>Desired Payout</th>
                            <th>Listing Price (20% Fee Added)</th>
                            <th>Condition</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.filter(p => p.sellerId === currentUser.id).map(prod => (
                            <tr key={prod.id}>
                              <td className="table-gear-cell">
                                <img src={prod.img} alt={prod.name} />
                                <div>
                                  <strong>{prod.name}</strong>
                                  <span className="text-muted block text-xs">{prod.brand}</span>
                                </div>
                              </td>
                              <td className="text-accent font-bold">
                                UGX {(prod.sellerPayout || prod.price * 0.8).toLocaleString()}
                              </td>
                              <td className="font-bold">
                                UGX {prod.price.toLocaleString()}
                              </td>
                              <td>
                                <span className="condition-pill">{prod.condition}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Bidding Activity */}
                <div className="dashboard-section shadow-premium mt-8">
                  <h3>Active Auction Bids</h3>
                  {auctions.filter(a => a.highestBidder === currentUser.name).length === 0 ? (
                    <p className="no-data text-muted">No active bids. Switch to "Live Auctions" to start bidding!</p>
                  ) : (
                    <div className="dashboard-table-wrapper">
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>My High Bid</th>
                            <th>Time Remaining</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auctions.map(auc => {
                            if (auc.highestBidder !== currentUser.name) return null;
                            const isEnding = auc.timeLeft < 3600;
                            return (
                              <tr key={auc.id}>
                                <td className="table-gear-cell">
                                  <img src={auc.img} alt={auc.name} />
                                  <div>
                                    <strong>{auc.name}</strong>
                                    <span className="text-muted block text-xs">{auc.brand}</span>
                                  </div>
                                </td>
                                <td className="text-accent font-bold">
                                  UGX {auc.currentBid.toLocaleString()}
                                </td>
                                <td className={isEnding ? 'text-red font-bold' : ''}>
                                  {auc.timeLeft > 0 ? formatTime(auc.timeLeft) : 'ENDED'}
                                </td>
                                <td>
                                  <span className="status-badge winning">👑 High Bidder</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Orders History */}
                <div className="dashboard-section shadow-premium mt-8">
                  <h3>Order History</h3>
                  {orders.filter(o => o.customerId === currentUser.id).length === 0 ? (
                    <p className="no-data text-muted">You have no past purchases.</p>
                  ) : (
                    <div className="dashboard-table-wrapper">
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total Price</th>
                            <th>City</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.filter(o => o.customerId === currentUser.id).map(ord => (
                            <tr key={ord.id}>
                              <td className="font-mono text-xs">{ord.id}</td>
                              <td>{new Date(ord.date).toLocaleDateString()}</td>
                              <td>
                                <ul className="table-items-list">
                                  {ord.items.map((it, idx) => (
                                    <li key={idx}>{it.name}</li>
                                  ))}
                                </ul>
                              </td>
                              <td className="font-bold">UGX {ord.total.toLocaleString()}</td>
                              <td>{ord.city}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : shopTab === 'bid' ? (
            /* Live Auctions View */
            <div className="shop-auctions-grid">
              {auctions.map(auc => (
                <div key={auc.id} className="auction-card shadow-premium">
                  <div className="auction-visual">
                    <img src={auc.img} alt={auc.name} />
                    <div className="auction-time-badge">
                      ⏱️ {auc.timeLeft > 0 ? formatTime(auc.timeLeft) : 'ENDED'}
                    </div>
                  </div>
                  
                  <div className="auction-meta">
                    <span className="item-brand">{auc.brand}</span>
                    <h3>{auc.name}</h3>
                    <p className="item-desc">{auc.description}</p>
                    
                    <div className="bid-status-box">
                      <div className="status-line">
                        <span>Current High Bid:</span>
                        <strong className="high-bid text-accent">UGX {auc.currentBid.toLocaleString()}</strong>
                      </div>
                      <div className="status-line">
                        <span>High Bidder:</span>
                        <span className="bidder-name">{auc.highestBidder}</span>
                      </div>
                      <div className="status-line">
                        <span>Total Bids Placed:</span>
                        <span>{auc.bidsCount} bids</span>
                      </div>
                    </div>

                    <div className="bid-action-form">
                      <input 
                        type="number" 
                        placeholder={`Min: UGX ${(auc.currentBid + auc.minIncrement).toLocaleString()}`} 
                        value={bidInputs[auc.id] || ''}
                        onChange={(e) => handleBidInputChange(auc.id, e.target.value)}
                        disabled={auc.timeLeft <= 0}
                      />
                      <button 
                        onClick={() => placeBid(auc.id)}
                        disabled={auc.timeLeft <= 0}
                      >
                        PLACE BID
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Direct Buy View (Regular Grid) */
            <>
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
                <button className="btn-save-filter" onClick={saveCurrentFilter}>
                  💾 Save Search
                </button>
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
                        <button 
                          className={`favorite-toggle-btn ${favorites.includes(product.id) ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                          title="Add to Wishlist"
                        >
                          ❤️
                        </button>
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
            </>
          )}
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
        </aside>
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
                      <label>Your Desired Payout (UGX) *</label>
                      <input 
                        type="number" 
                        name="price" 
                        placeholder="e.g. 8000000" 
                        value={listingForm.price} 
                        onChange={handleListingFormChange} 
                        required 
                      />
                    </div>
                  </div>

                  {listingForm.price && !isNaN(parseFloat(listingForm.price)) && (
                    <div className="ai-pricing-widget">
                      <div className="ai-widget-header">
                        <span className="ai-sparkle">✨</span>
                        <span>AI Pricing Assistant</span>
                      </div>
                      
                      <div className="pricing-breakdown">
                        <div className="breakdown-row">
                          <span>Your Desired Payout:</span>
                          <span>UGX {parseFloat(listingForm.price || 0).toLocaleString()}</span>
                        </div>
                        <div className="breakdown-row">
                          <span>Gear Plug Fee (20%):</span>
                          <span>UGX {Math.round(parseFloat(listingForm.price || 0) * 0.25).toLocaleString()}</span>
                        </div>
                        <div className="breakdown-row highlight">
                          <span>Buyer Listing Price:</span>
                          <span className="text-accent font-bold">UGX {Math.round(parseFloat(listingForm.price || 0) / 0.8).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="ai-feedback">
                        <strong>AI Valuation:</strong> {
                          listingForm.brand.toLowerCase() === 'sony' && listingForm.category === 'Camera Bodies'
                            ? "Sony camera bodies hold high resale value in Kampala. Your payout target is very competitive!"
                            : listingForm.brand.toLowerCase() === 'leica'
                            ? "Leica is a premium luxury brand. High collector demand ensures fast sale at this pricing!"
                            : parseFloat(listingForm.price) > 10000000
                            ? "High-ticket cinema gear. The AI suggests adding detail notes on shutter count/sensor check."
                            : "This payout falls within the typical Kampala marketplace average. Great choice!"
                        }
                      </div>
                    </div>
                  )}
                  
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

      {/* ── Create Profile Modal ── */}
      {isCreateProfileModalOpen && (
        <div className="marketplace-modal-overlay">
          <div className="marketplace-modal shadow-premium">
            <button className="modal-close-btn" onClick={() => setIsCreateProfileModalOpen(false)}>
              <X size={20} />
            </button>
            <div className="modal-header">
              <User size={24} className="text-accent" />
              <h2>Create Your Profile</h2>
              <p className="text-muted">Register your filmmaking/rental profile on Gear Plug to personalize your dashboard.</p>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="marketplace-form">
              <div className="form-grid">
                <div className="form-main-details">
                  <div className="form-row">
                    <div className="form-field">
                      <label>Full Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        placeholder="e.g. John Doe" 
                        value={profileForm.name} 
                        onChange={handleProfileFormChange} 
                        required 
                      />
                    </div>
                    <div className="form-field">
                      <label>Email Address *</label>
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="e.g. john@example.com" 
                        value={profileForm.email} 
                        onChange={handleProfileFormChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        placeholder="e.g. +256 700 123 456" 
                        value={profileForm.phone} 
                        onChange={handleProfileFormChange} 
                        required 
                      />
                    </div>
                    <div className="form-field">
                      <label>Professional Role *</label>
                      <select 
                        name="role" 
                        value={profileForm.role} 
                        onChange={handleProfileFormChange}
                      >
                        <option value="Professional Filmmaker">Professional Filmmaker</option>
                        <option value="Commercial Director">Commercial Director</option>
                        <option value="Camera Assistant">Camera Assistant</option>
                        <option value="Rental House Owner">Rental House Owner</option>
                        <option value="Content Creator">Content Creator</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Company / Organization</label>
                      <input 
                        type="text" 
                        name="company" 
                        placeholder="e.g. Aura Media Kampala" 
                        value={profileForm.company} 
                        onChange={handleProfileFormChange} 
                      />
                    </div>
                    <div className="form-field">
                      <label>Location *</label>
                      <input 
                        type="text" 
                        name="location" 
                        placeholder="e.g. Kampala, UG" 
                        value={profileForm.location} 
                        onChange={handleProfileFormChange} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="form-sidebar-details">
                  <div className="form-field">
                    <label>Profile Avatar Emoji *</label>
                    <select 
                      name="avatar" 
                      value={profileForm.avatar} 
                      onChange={handleProfileFormChange}
                      style={{ fontSize: '1.5rem', height: '54px' }}
                    >
                      <option value="🎥">🎥 Camera</option>
                      <option value="🎬">🎬 Clapperboard</option>
                      <option value="📸">📸 DSLR Camera</option>
                      <option value="💡">💡 Lighting</option>
                      <option value="🎧">🎧 Audio</option>
                      <option value="⭐">⭐ Star</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsCreateProfileModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-listing">
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
