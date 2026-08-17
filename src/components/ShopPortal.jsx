import React, { useState, useMemo, useEffect } from 'react';
import { useKit } from '../context/KitContext';
import { createOrder as createWooCommerceOrder, createProduct as createWooCommerceProduct } from '../lib/woocommerce';

import { ArrowLeft, ShieldCheck, Truck, CreditCard, Smartphone, CheckCircle, Search, Filter, Loader2, X, Package, MapPin, User, Phone, Mail, Upload, Camera } from 'lucide-react';
import './ShopPortal.css';

const CATEGORIES = ['All', 'Camera Bodies', 'Lenses', 'Sound Equipment', 'Accessories', 'Tripods & Lighting'];
const BRANDS = ['All', 'Sony', 'Canon', 'Leica', 'RED', 'ARRI', 'Blackmagic', 'DJI', 'Sigma', 'Zeiss', 'Rode', 'Sennheiser', 'Aputure', 'SmallRig', 'Manfrotto'];
const CONDITIONS = ['All', 'Brand New', 'Open Box', 'Used - Mint', 'Used - Like New', 'Used - Good', 'Used - Fair'];
const MOUNTS = ['All', 'Sony E-mount', 'Canon EF', 'Canon RF', 'ARRI PL', 'Leica M-mount', 'L-mount'];

export default function ShopPortal() {
  const { 
    kitItems, totalCost, clearKit, addToKit, removeFromKit, 
    products, addMarketplaceProduct, currentUser, orders, addOrder, 
    shopTab, setShopTab, logout,
    favorites, toggleFavorite,
    recentlyViewed, addRecentlyViewed,
    auctions, bidInputs, handleBidInputChange, placeBid
  } = useKit();
  const [view, setView] = useState('browse'); // 'browse' | 'checkout' | 'success'
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [filterMount, setFilterMount] = useState('All');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProduct, setSelectedProduct] = useState(null);
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


  // --- End of migrated state ---

  // --- Saved Searches / Filters state ---
  const [savedFilters, setSavedFilters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gearplug_saved_filters') || '[]');
    } catch {
      return [];
    }
  });

  const saveCurrentFilter = () => {
    const newFilter = {
      id: Date.now().toString(),
      name: searchQuery || `${activeCategory} - ${filterBrand}`,
      searchQuery,
      activeCategory,
      filterBrand,
      filterCondition,
      filterMount,
      filterMinPrice,
      filterMaxPrice
    };
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem('gearplug_saved_filters', JSON.stringify(updated));
    alert('Filter saved!');
  };

  const applySavedFilter = (filter) => {
    setSearchQuery(filter.searchQuery || '');
    setActiveCategory(filter.activeCategory || 'All');
    setFilterBrand(filter.filterBrand || 'All');
    setFilterCondition(filter.filterCondition || 'All');
    setFilterMount(filter.filterMount || 'All');
    setFilterMinPrice(filter.filterMinPrice || '');
    setFilterMaxPrice(filter.filterMaxPrice || '');
  };

  const unifiedCatalog = useMemo(() => {
    const buyItems = products.map(p => ({ ...p, format: 'buy' }));
    const bidItems = auctions.map(a => ({ ...a, format: 'bid', price: a.currentBid }));
    return [...buyItems, ...bidItems];
  }, [products, auctions]);

  const filteredProducts = useMemo(() => {
    return unifiedCatalog.filter(item => {
      // 1. Format Filter
      const matchFormat = shopTab === 'all' || item.format === shopTab;

      // 2. Category Filter
      const matchCat = activeCategory === 'All' || item.category === activeCategory;

      // 3. Search Filter
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) ||
                          item.brand.toLowerCase().includes(q) ||
                          (item.description && item.description.toLowerCase().includes(q));

      // 4. Brand Filter
      const matchBrand = filterBrand === 'All' || item.brand.toLowerCase() === filterBrand.toLowerCase();

      // 5. Condition Filter
      const matchCondition = filterCondition === 'All' || 
                             (item.condition && item.condition.toLowerCase().includes(filterCondition.toLowerCase()));

      // 6. Mount Filter
      const matchMount = filterMount === 'All' || 
                         (item.specs?.lensMount && item.specs.lensMount.toLowerCase().includes(filterMount.toLowerCase()));

      // 7. Price Filter
      const priceVal = item.price || item.currentBid || 0;
      const matchMinPrice = !filterMinPrice || priceVal >= parseFloat(filterMinPrice);
      const matchMaxPrice = !filterMaxPrice || priceVal <= parseFloat(filterMaxPrice);

      return matchFormat && matchCat && matchSearch && matchBrand && matchCondition && matchMount && matchMinPrice && matchMaxPrice;
    });
  }, [unifiedCatalog, shopTab, activeCategory, searchQuery, filterBrand, filterCondition, filterMount, filterMinPrice, filterMaxPrice]);

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

    const flwKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '';
    if (!flwKey) {
      alert("Flutterwave configuration is missing. Please add VITE_FLUTTERWAVE_PUBLIC_KEY to your environment/repository secrets.");
      return;
    }

    const listingFee = 15000;

    try {
      window.FlutterwaveCheckout({
        public_key: flwKey,
        tx_ref: `GP-LIST-${Date.now()}`,
        amount: listingFee,
        currency: "UGX",
        payment_options: "mobile_money_uganda, card",
        customer: {
          email: listingForm.sellerEmail || "seller@gearplug.ug",
          phone_number: listingForm.sellerPhone || "",
          name: listingForm.sellerName || "Anonymous Seller",
        },
        customizations: {
          title: "Gear Plug Uganda",
          description: `Listing Fee (Flat 15,000 UGX charge)`,
          logo: "https://gearplug.ug/logo.png"
        },
        callback: async function (paymentResponse) {
          console.log("Flutterwave Listing Fee response:", paymentResponse);
          if (paymentResponse.status === "successful" || paymentResponse.charge_response_code === "00") {
            const sellerPayout = parseFloat(listingForm.price);
            const calculatedListingPrice = Math.round(sellerPayout / 0.8);

            const specs = {};
            if (listingForm.category === 'Camera Bodies') {
              specs.lensMount = listingForm.lensMount || '';
              specs.sensorSize = listingForm.sensorSize || '';
              specs.maxResolution = listingForm.maxResolution || '';
              specs.shutterCount = listingForm.shutterCount || '';
            } else if (listingForm.category === 'Lenses') {
              specs.lensMount = listingForm.lensMount || '';
              specs.focalLength = listingForm.focalLength || '';
              specs.maxAperture = listingForm.maxAperture || '';
              specs.glassCondition = listingForm.glassCondition || '';
            } else if (listingForm.category === 'Sound Equipment') {
              specs.connectionType = listingForm.connectionType || '';
              specs.polarPattern = listingForm.polarPattern || '';
              specs.microphoneType = listingForm.microphoneType || '';
            } else if (listingForm.category === 'Tripods & Lighting') {
              specs.lightSource = listingForm.lightSource || '';
              specs.colorTemp = listingForm.colorTemp || '';
              specs.powerOutput = listingForm.powerOutput || '';
            } else if (listingForm.category === 'Accessories') {
              specs.loadCapacity = listingForm.loadCapacity || '';
              specs.compatibility = listingForm.compatibility || '';
            }

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
              specs: specs,
              sellerRating: 'Verified Seller ★',
              watchers: 1,
              seller: {
                name: listingForm.sellerName,
                phone: listingForm.sellerPhone,
                email: listingForm.sellerEmail,
              },
              isMarketplace: true,
              listingPaymentRef: String(paymentResponse.transaction_id || paymentResponse.flw_ref || '')
            };

            try {
              const wooProduct = await createWooCommerceProduct(newProduct);
              if (wooProduct && wooProduct.id) {
                newProduct.id = wooProduct.id;
              }
            } catch (err) {
              console.warn("Failed to create product in WooCommerce, fallback local listing:", err);
            }

            addMarketplaceProduct(newProduct);
            setIsListingModalOpen(false);

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
              lensMount: '',
              sensorSize: '',
              maxResolution: '',
              shutterCount: '',
              focalLength: '',
              maxAperture: '',
              glassCondition: '',
              connectionType: '',
              polarPattern: '',
              microphoneType: '',
              lightSource: '',
              colorTemp: '',
              powerOutput: '',
              loadCapacity: '',
              compatibility: '',
            });
            alert("Listing fee paid! Your gear is now live on Gear Plug!");
          } else {
            alert("Listing payment unsuccessful: " + paymentResponse.message);
          }
        },
        onclose: function () {
          // Closed payment modal
        }
      });
    } catch (err) {
      console.error("Flutterwave listing payment failure", err);
      alert("Could not load payment checkout system for listing fee. Please verify setup.");
    }
  };

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (kitItems.length === 0) return;
    
    const flwKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '';
    if (!flwKey) {
      alert("Flutterwave configuration is missing. Please add VITE_FLUTTERWAVE_PUBLIC_KEY to your environment/repository secrets.");
      return;
    }

    const platformFee = 1850;
    const finalTotal = totalCost + platformFee;
    
    setIsCheckingOut(true);

    try {
      window.FlutterwaveCheckout({
        public_key: flwKey,
        tx_ref: `GP-TX-${Date.now()}`,
        amount: finalTotal,
        currency: "UGX",
        payment_options: "mobile_money_uganda, card",
        customer: {
          email: form.email || "buyer@gearplug.ug",
          phone_number: form.phone || "",
          name: form.fullName || "Anonymous Buyer",
        },
        customizations: {
          title: "Gear Plug Uganda",
          description: `Escrow Payment (Total: UGX ${finalTotal.toLocaleString()})`,
          logo: "https://gearplug.ug/logo.png"
        },
        callback: async function (paymentResponse) {
          console.log("Flutterwave payment response:", paymentResponse);
          if (paymentResponse.status === "successful" || paymentResponse.charge_response_code === "00") {
            const newOrder = {
              id: `GP-${Date.now().toString(36).toUpperCase()}`,
              customerId: currentUser?.id || 'guest',
              date: new Date().toISOString(),
              items: kitItems.map(item => ({ id: item.id, name: item.name, price: item.price })),
              total: finalTotal,
              city: form.city || 'Kampala',
              flwRef: String(paymentResponse.transaction_id || paymentResponse.flw_ref || '')
            };

            try {
              const wooOrder = await createWooCommerceOrder(kitItems, form, newOrder.flwRef);
              if (wooOrder && wooOrder.id) {
                newOrder.id = `WC-${wooOrder.id}`;
              }
            } catch (err) {
              console.warn("Failed to sync checkout with WooCommerce backend, fallback local order placed:", err);
            }

            addOrder(newOrder);
            clearKit();
            setIsCheckingOut(false);
            setView('success');
          } else {
            alert("Payment transaction was not successful: " + paymentResponse.message);
            setIsCheckingOut(false);
          }
        },
        onclose: function () {
          setIsCheckingOut(false);
        }
      });
    } catch (err) {
      console.error("Flutterwave checkout failure", err);
      alert("Could not load payment checkout system. Please verify your connection.");
      setIsCheckingOut(false);
    }
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
      <div className="shop-portal container-fluid success-view">
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
      <div className="shop-portal container-fluid checkout-view">
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
                  `PLACE ORDER — UGX ${(totalCost + 1850).toLocaleString()}`
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
                  <span>Gear Plug Tax (Platform Escrow Fee)</span>
                  <span>UGX 1,850</span>
                </div>
                <div className="total-line">
                  <span>Delivery</span>
                  <span className="text-accent">FREE</span>
                </div>
                <div className="total-line grand-total">
                  <span>Total</span>
                  <span>UGX ${(totalCost + 1850).toLocaleString()}</span>
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

  const renderProductItem = (item, isListView) => {
    const isAuction = item.format === 'bid';
    const isFav = favorites.includes(item.id);
    const displayPrice = isAuction ? item.currentBid : item.price;
    const isSoldOut = item.stock_status === 'outofstock' || item.stock_quantity === 0;
    
    
    const quickSpecs = [];
    if (item.specs) {
      if (item.category === 'Camera Bodies') {
        if (item.specs.lensMount) quickSpecs.push(item.specs.lensMount.replace(' mount', ''));
        if (item.specs.sensorSize) quickSpecs.push(item.specs.sensorSize.split(' ')[0]);
        if (item.specs.maxResolution) quickSpecs.push(item.specs.maxResolution);
      } else if (item.category === 'Lenses') {
        if (item.specs.lensMount) quickSpecs.push(item.specs.lensMount);
        if (item.specs.focalLength) quickSpecs.push(item.specs.focalLength);
        if (item.specs.maxAperture) quickSpecs.push(item.specs.maxAperture);
      } else if (item.category === 'Sound Equipment') {
        if (item.specs.microphoneType) quickSpecs.push(item.specs.microphoneType);
        if (item.specs.connectionType) quickSpecs.push(item.specs.connectionType);
      } else if (item.category === 'Tripods & Lighting') {
        if (item.specs.lightSource) quickSpecs.push(item.specs.lightSource.split(' ')[0]);
        if (item.specs.colorTemp) quickSpecs.push(item.specs.colorTemp);
      } else {
        if (item.specs.loadCapacity) quickSpecs.push(`Max ${item.specs.loadCapacity}`);
      }
    }
    
    if (isListView) {
      return (
        <div key={item.id} className="shop-list-row shadow-premium" onClick={() => setSelectedProduct(item)}>
          <div className="list-row-visual">
            <img src={item.img} alt={item.name} style={{ opacity: isSoldOut ? 0.5 : 1 }} />
            <span className={`format-badge ${isSoldOut ? 'badge-soldout' : (isAuction ? 'badge-auction' : 'badge-buynow')}`}>
              {isSoldOut ? 'SOLD OUT' : (isAuction ? '🔨 AUCTION' : '⚡ BUY IT NOW')}
            </span>
            {item.condition && <span className="condition-badge">{item.condition}</span>}
          </div>
          
          <div className="list-row-content">
            <div className="row-header">
              <span className="item-brand">{item.brand} • {item.category}</span>
              <button 
                className={`favorite-toggle-btn ${isFav ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                title="Add to Wishlist"
              >
                ❤️
              </button>
            </div>
            
            <h3>{item.name}</h3>
            <p className="item-desc">{item.description}</p>
            
            {quickSpecs.length > 0 && (
              <div className="card-quick-specs">
                {quickSpecs.map((tag, i) => (
                  <span key={i} className="spec-tag">{tag}</span>
                ))}
              </div>
            )}
            
            <div className="row-seller-trust text-xs text-muted mt-2">
              <span className="trust-badge">⭐️ Top Rated Seller ({item.sellerRating || 'New'})</span>
              {item.watchers && <span className="watchers-count"> • 🔥 {item.watchers} watching</span>}
            </div>
          </div>
          
          <div className="list-row-price-actions" onClick={(e) => e.stopPropagation()}>
            <div className="price-tag-container" onClick={() => setSelectedProduct(item)}>
              <span className="price-label">{isAuction ? 'Current Bid' : 'Price'}</span>
              <strong className="item-price">UGX {displayPrice.toLocaleString()}</strong>
              {isAuction && <span className="bids-count-label">{item.bidsCount || 0} bids</span>}
            </div>
            
            {isAuction ? (
              <div className="auction-timer-row" onClick={() => !isSoldOut && setSelectedProduct(item)}>
                <span className="timer-icon">⏱️</span>
                <span className="timer-text font-bold">{item.timeLeft > 0 ? formatTime(item.timeLeft) : 'ENDED'}</span>
              </div>
            ) : (
              <button 
                className={`add-btn-small ${isSoldOut ? 'btn-disabled' : ''}`} 
                onClick={() => !isSoldOut && addToKit(item)}
                disabled={isSoldOut}
              >
                {isSoldOut ? 'SOLD OUT' : 'ADD TO KIT'}
              </button>
            )}
          </div>
        </div>
      );
    }
    
    // Grid mode rendering
    return (
      <div key={item.id} className="shop-item-card shadow-premium" onClick={() => setSelectedProduct(item)}>
        <div className="item-visual">
          <img src={item.img} alt={item.name} style={{ opacity: isSoldOut ? 0.5 : 1 }} />
          <span className={`format-badge ${isSoldOut ? 'badge-soldout' : (isAuction ? 'badge-auction' : 'badge-buynow')}`}>
            {isSoldOut ? 'SOLD OUT' : (isAuction ? '🔨 AUCTION' : '⚡ BUY IT NOW')}
          </span>
          {item.condition && <span className="condition-badge">{item.condition}</span>}
          <button 
            className={`favorite-toggle-btn ${isFav ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
            title="Add to Wishlist"
          >
            ❤️
          </button>
        </div>
        
        <div className="item-meta">
          <div className="brand-row">
            <span className="item-brand">{item.brand} • {item.category}</span>
            {item.watchers && <span className="watchers-badge">🔥 {item.watchers}</span>}
          </div>
          <h3>{item.name}</h3>
          <p className="item-desc">{item.description}</p>
          
          {quickSpecs.length > 0 && (
            <div className="card-quick-specs mb-4">
              {quickSpecs.map((tag, i) => (
                <span key={i} className="spec-tag">{tag}</span>
              ))}
            </div>
          )}
          
          <div className="item-footer" onClick={(e) => e.stopPropagation()}>
            <div className="price-block" onClick={() => setSelectedProduct(item)}>
              <span className="price-label text-xs text-muted block">{isAuction ? 'Current Bid' : 'Price'}</span>
              <span className="item-price font-bold">UGX {displayPrice.toLocaleString()}</span>
              {isAuction && <span className="bids-count block text-xs text-muted">{item.bidsCount || 0} bids</span>}
            </div>
            
            {isAuction ? (
              <span className="auction-timer-tag" onClick={() => !isSoldOut && setSelectedProduct(item)}>
                ⏱️ {item.timeLeft > 0 ? formatTime(item.timeLeft) : 'ENDED'}
              </span>
            ) : (
              <button 
                className={`add-btn-small ${isSoldOut ? 'btn-disabled' : ''}`} 
                onClick={() => !isSoldOut && addToKit(item)}
                disabled={isSoldOut}
              >
                {isSoldOut ? 'SOLD OUT' : 'ADD TO KIT'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────── BROWSE VIEW (default) ─────────────── */
  return (
    <div className="shop-portal container-fluid" style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh' }}>
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
              if (!currentUser) {
                alert("Please log in using the button at the top right to list your gear.");
              } else if (!currentUser.emailVerified) {
                alert("Please check your email and click the verification link before listing gear.");
              } else {
                setListingForm(prev => ({
                  ...prev,
                  sellerName: currentUser?.name || '',
                  sellerPhone: currentUser?.phone || '',
                  sellerEmail: currentUser?.email || ''
                }));
                setIsListingModalOpen(true);
              }
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
          </div>

          {/* Unified eBay-style Search & Filter view with Sidebar */}
          <div className="shop-unified-browser">
            {/* Sticky Sidebar Filter Panel */}
            <aside className="shop-filters-sidebar shadow-premium">
              <div className="sidebar-filter-section">
                <h3>Search & Save</h3>
                <div className="sidebar-search-box">
                  <Search size={14} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search items..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="btn-save-filter mt-2" onClick={saveCurrentFilter}>
                  💾 Save This Search
                </button>
              </div>

              <div className="sidebar-filter-section">
                <h3>Category</h3>
                <ul className="filter-list">
                  {CATEGORIES.map(cat => (
                    <li key={cat}>
                      <button 
                        className={`filter-link-btn ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat === 'All' ? '📁 All Categories' : cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sidebar-filter-section">
                <h3>Brand</h3>
                <ul className="filter-checkbox-list">
                  {BRANDS.map(brand => (
                    <li key={brand}>
                      <label className="checkbox-label">
                        <input 
                          type="radio" 
                          name="filter-brand"
                          checked={filterBrand === brand}
                          onChange={() => setFilterBrand(brand)}
                        />
                        <span>{brand}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sidebar-filter-section">
                <h3>Condition</h3>
                <ul className="filter-checkbox-list">
                  {CONDITIONS.map(cond => (
                    <li key={cond}>
                      <label className="checkbox-label">
                        <input 
                          type="radio" 
                          name="filter-condition"
                          checked={filterCondition === cond}
                          onChange={() => setFilterCondition(cond)}
                        />
                        <span>{cond}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sidebar-filter-section">
                <h3>Lens Mount</h3>
                <ul className="filter-checkbox-list">
                  {MOUNTS.map(mnt => (
                    <li key={mnt}>
                      <label className="checkbox-label">
                        <input 
                          type="radio" 
                          name="filter-mount"
                          checked={filterMount === mnt}
                          onChange={() => setFilterMount(mnt)}
                        />
                        <span>{mnt === 'All' ? 'All Mounts' : mnt.replace('Sony ', '').replace('ARRI ', '')}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sidebar-filter-section">
                <h3>Price (UGX)</h3>
                <div className="price-range-inputs">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={filterMinPrice}
                    onChange={(e) => setFilterMinPrice(e.target.value)}
                  />
                  <span>to</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(e.target.value)}
                  />
                </div>
                {(filterMinPrice || filterMaxPrice || filterBrand !== 'All' || filterCondition !== 'All' || filterMount !== 'All' || searchQuery || activeCategory !== 'All') && (
                  <button 
                    className="btn-clear-filters text-accent text-xs mt-3"
                    onClick={() => {
                      setFilterBrand('All');
                      setFilterCondition('All');
                      setFilterMount('All');
                      setFilterMinPrice('');
                      setFilterMaxPrice('');
                      setSearchQuery('');
                      setActiveCategory('All');
                    }}
                  >
                    🔄 Reset All Filters
                  </button>
                )}
              </div>
            </aside>

            {/* Main Results Panel */}
            <div className="shop-results-panel">
              <div className="results-toolbar mb-6">
                <div className="results-count-summary text-xs text-muted">
                  <span className="count-number font-bold text-accent">{filteredProducts.length}</span> items found
                  {searchQuery && <span> for "{searchQuery}"</span>}
                </div>
                
                <div className="view-mode-toggle">
                  <button 
                    className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    Grid
                  </button>
                  <button 
                    className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    List
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="loading-state">
                  <Loader2 className="animate-spin" size={40} />
                  <p>Scanning Gear Plug Database...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="empty-state shadow-premium">
                  <Package size={48} className="text-muted mb-4" />
                  <h3>No matching gear found</h3>
                  <p className="text-muted">Try resetting your sidebar filters or adjusting your search term.</p>
                </div>
              ) : (
                <div className={viewMode === 'list' ? 'shop-product-list' : 'shop-product-grid'}>
                  {filteredProducts.map(item => renderProductItem(item, viewMode === 'list'))}
                </div>
              )}
            </div>
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
                  
                  {/* Dynamic Technical Specs section based on category */}
                  <div className="dynamic-specs-section mb-6">
                    <h3 className="section-subtitle-small text-accent text-xs mb-3 font-bold uppercase tracking-wider">🛠️ Technical Specifications</h3>
                    
                    {listingForm.category === 'Camera Bodies' && (
                      <div className="form-row">
                        <div className="form-field">
                          <label>Lens Mount</label>
                          <input type="text" name="lensMount" placeholder="e.g. Sony E-mount" value={listingForm.lensMount || ''} onChange={handleListingFormChange} />
                        </div>
                        <div className="form-field">
                          <label>Sensor Size</label>
                          <input type="text" name="sensorSize" placeholder="e.g. Full Frame" value={listingForm.sensorSize || ''} onChange={handleListingFormChange} />
                        </div>
                        <div className="form-field">
                          <label>Max Resolution</label>
                          <input type="text" name="maxResolution" placeholder="e.g. 4K 120p" value={listingForm.maxResolution || ''} onChange={handleListingFormChange} />
                        </div>
                        <div className="form-field">
                          <label>Shutter Count / Hours</label>
                          <input type="text" name="shutterCount" placeholder="e.g. 450 hours" value={listingForm.shutterCount || ''} onChange={handleListingFormChange} />
                        </div>
                      </div>
                    )}
                    
                    {listingForm.category === 'Lenses' && (
                      <div className="form-row">
                        <div className="form-field">
                          <label>Lens Mount</label>
                          <input type="text" name="lensMount" placeholder="e.g. Canon RF" value={listingForm.lensMount || ''} onChange={handleListingFormChange} />
                        </div>
                        <div className="form-field">
                          <label>Focal Length</label>
                          <input type="text" name="focalLength" placeholder="e.g. 24-70mm" value={listingForm.focalLength || ''} onChange={handleListingFormChange} />
                        </div>
                        <div className="form-field">
                          <label>Max Aperture</label>
                          <input type="text" name="maxAperture" placeholder="e.g. f/2.8" value={listingForm.maxAperture || ''} onChange={handleListingFormChange} />
                        </div>
                        <div className="form-field">
                          <label>Glass Condition</label>
                          <input type="text" name="glassCondition" placeholder="e.g. Mint, no scratches" value={listingForm.glassCondition || ''} onChange={handleListingFormChange} />
                        </div>
                      </div>
                    )}

                    {listingForm.category === 'Sound Equipment' && (
                      <div className="form-row">
                        <div className="form-field">
                          <label>Connection Type</label>
                          <input type="text" name="connectionType" placeholder="e.g. XLR 3-pin" value={listingForm.connectionType || ''} onChange={handleListingFormChange} />
                        </div>
                        <div className="form-field">
                          <label>Polar Pattern</label>
                          <input type="text" name="polarPattern" placeholder="e.g. Supercardioid" value={listingForm.polarPattern || ''} onChange={handleListingFormChange} />
                        </div>
                        <div className="form-field">
                          <label>Microphone Type</label>
                          <input type="text" name="microphoneType" placeholder="e.g. Shotgun Condenser" value={listingForm.microphoneType || ''} onChange={handleListingFormChange} />
                        </div>
                      </div>
                    )}

                    {listingForm.category === 'Tripods & Lighting' && (
                      <div className="form-row">
                        <div className="form-field">
                          <label>Light Source</label>
                          <input type="text" name="lightSource" placeholder="e.g. 600W COB LED" value={listingForm.lightSource || ''} onChange={handleListingFormChange} />
                        </div>
                        <div className="form-field">
                          <label>Color Temp</label>
                          <input type="text" name="colorTemp" placeholder="e.g. 5600K" value={listingForm.colorTemp || ''} onChange={handleListingFormChange} />
                        </div>
                        <div className="form-field">
                          <label>Power Output</label>
                          <input type="text" name="powerOutput" placeholder="e.g. 600W" value={listingForm.powerOutput || ''} onChange={handleListingFormChange} />
                        </div>
                      </div>
                    )}

                    {listingForm.category === 'Accessories' && (
                      <div className="form-row">
                        <div className="form-field">
                          <label>Load Capacity</label>
                          <input type="text" name="loadCapacity" placeholder="e.g. 4.5 kg" value={listingForm.loadCapacity || ''} onChange={handleListingFormChange} />
                        </div>
                        <div className="form-field">
                          <label>Compatibility</label>
                          <input type="text" name="compatibility" placeholder="e.g. RED, Canon" value={listingForm.compatibility || ''} onChange={handleListingFormChange} />
                        </div>
                      </div>
                    )}
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
                        value={listingForm.sellerName} 
                        readOnly
                        className="input-readonly"
                      />
                    </div>
                    <div className="form-field">
                      <label>Phone Number *</label>
                      <input 
                        type="tel" 
                        name="sellerPhone" 
                        value={listingForm.sellerPhone} 
                        readOnly
                        className="input-readonly"
                      />
                    </div>
                    <div className="form-field">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        name="sellerEmail" 
                        value={listingForm.sellerEmail} 
                        readOnly
                        className="input-readonly"
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


      {/* ── Item Details & Specs Modal (eBay Style) ── */}
      {selectedProduct && (
        <div className="marketplace-modal-overlay selected-product-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="marketplace-modal selected-product-modal shadow-premium" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>
              <X size={20} />
            </button>
            
            <div className="product-details-grid">
              {/* Left Column: Visuals & Guarantees */}
              <div className="product-visuals-col">
                <div className="product-hero-image-box">
                  <img src={selectedProduct.img} alt={selectedProduct.name} />
                  <span className={`format-badge ${selectedProduct.format === 'bid' ? 'badge-auction' : 'badge-buynow'}`}>
                    {selectedProduct.format === 'bid' ? '🔨 AUCTION' : '⚡ BUY IT NOW'}
                  </span>
                </div>
                
                <div className="product-guarantees-list mt-6">
                  <div className="guarantee-card">
                    <span className="guarantee-icon">🛡️</span>
                    <div>
                      <strong>Escrow Security Guarantee</strong>
                      <p className="text-muted text-xs">Your payment is held securely by Gear Plug until gear inspection is complete.</p>
                    </div>
                  </div>
                  <div className="guarantee-card">
                    <span className="guarantee-icon">🔍</span>
                    <div>
                      <strong>24-Hour Inspection Window</strong>
                      <p className="text-muted text-xs">Verify sensor, optical clarity, or audio channels. Reject if not as described.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column: Title, Specs, Bidding, AI Trend */}
              <div className="product-details-col">
                <div className="details-header mb-4">
                  <div className="category-breadcrumbs text-xs text-muted mb-2">
                    Shop &gt; {selectedProduct.category} &gt; {selectedProduct.brand}
                  </div>
                  <h2>{selectedProduct.name}</h2>
                  <div className="seller-rating-line text-xs text-muted">
                    Condition: <strong className="text-white">{selectedProduct.condition || 'Used'}</strong> 
                    {selectedProduct.sellerRating && <span> • ⭐️ {selectedProduct.sellerRating}</span>}
                    {selectedProduct.watchers && <span> • 🔥 {selectedProduct.watchers} watchers in 24h</span>}
                  </div>
                </div>

                <p className="item-description-text mb-6">{selectedProduct.description}</p>
                
                {/* Specs Table */}
                {selectedProduct.specs && (
                  <div className="specs-table-wrapper mb-6">
                    <h3>Specifications</h3>
                    <table className="technical-specs-table">
                      <tbody>
                        {Object.entries(selectedProduct.specs).map(([key, value]) => {
                          if (!value) return null;
                          const label = key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase());
                          return (
                            <tr key={key}>
                              <td className="spec-label-cell">{label}</td>
                              <td className="spec-value-cell">{value}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* AI Price Positioner bar */}
                <div className="ai-price-trend-widget mb-6">
                  <div className="ai-widget-header mb-2 text-xs">
                    <span>✨ AI Valuation Feedback</span>
                    <span className="font-bold text-accent">Gear Plug Verified</span>
                  </div>
                  
                  <div className="ai-price-spectrum-bar">
                    <div className="spectrum-segment segments-deal">Great Deal</div>
                    <div className="spectrum-segment segments-fair">Fair Price</div>
                    <div className="spectrum-segment segments-premium">Premium Rig</div>
                    
                    <div 
                      className={`spectrum-pointer ${
                        selectedProduct.price > 10000000 
                          ? 'ptr-premium' 
                          : selectedProduct.price < 2000000 
                          ? 'ptr-deal' 
                          : 'ptr-fair'
                      }`}
                    />
                  </div>
                  
                  <p className="ai-insight-copy mt-2 text-xs text-muted">
                    {selectedProduct.category === 'Camera Bodies' 
                      ? 'Camera bodies in Uganda hold strong demand. Escrow inspect window ensures safety for sensor checks.' 
                      : selectedProduct.category === 'Lenses'
                      ? 'Optics holds stable value. AI recommends inspecting front and rear elements for scratches on delivery.'
                      : 'Media support and accessories pricing matches Kampala marketplace averages.'}
                  </p>
                </div>

                {/* Bidding vs Direct Buy Box */}
                {selectedProduct.format === 'bid' ? (
                  /* Auction details & form */
                  <div className="auction-interaction-box shadow-premium">
                    <div className="interaction-header mb-4">
                      <div>
                        <span className="text-xs text-muted block">Current Bid</span>
                        <strong className="current-bid-tag text-accent">UGX {selectedProduct.currentBid.toLocaleString()}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted block">Time Remaining</span>
                        <strong className="timer-tag">{selectedProduct.timeLeft > 0 ? formatTime(selectedProduct.timeLeft) : 'ENDED'}</strong>
                      </div>
                    </div>

                    <div className="bid-form-row mb-4">
                      <input 
                        type="number" 
                        placeholder={`Enter UGX ${(selectedProduct.currentBid + selectedProduct.minIncrement).toLocaleString()} or more`}
                        value={bidInputs[selectedProduct.id] || ''}
                        onChange={(e) => handleBidInputChange(selectedProduct.id, e.target.value)}
                        disabled={selectedProduct.timeLeft <= 0}
                        className="modal-bid-input"
                      />
                      <button 
                        className="modal-bid-btn"
                        onClick={() => {
                          placeBid(selectedProduct.id);
                          setTimeout(() => {
                            const updated = JSON.parse(localStorage.getItem('gearplug_auctions') || '[]').find(a => a.id === selectedProduct.id);
                            if (updated) setSelectedProduct({ ...updated, format: 'bid' });
                          }, 100);
                        }}
                        disabled={selectedProduct.timeLeft <= 0}
                      >
                        PLACE BID
                      </button>
                    </div>

                    {/* Bidding History ledger table */}
                    {selectedProduct.bidsHistory && selectedProduct.bidsHistory.length > 0 && (
                      <div className="bids-history-ledger mt-6">
                        <h4>Bidding History ({selectedProduct.bidsCount || 0} bids)</h4>
                        <div className="ledger-table-wrapper">
                          <table className="ledger-table">
                            <thead>
                              <tr>
                                <th>Bidder</th>
                                <th>Amount</th>
                                <th>Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedProduct.bidsHistory.map((bid, i) => (
                                <tr key={i} className={i === 0 ? 'high-bid-row' : ''}>
                                  <td>{bid.bidder.replace(/^(.).*(.)$/, '$1***$2')} {i === 0 && '👑'}</td>
                                  <td className="font-bold">UGX {bid.amount.toLocaleString()}</td>
                                  <td className="text-muted">{bid.time}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Direct Buy Checkout Box */
                  <div className="buy-now-interaction-box shadow-premium">
                    <div className="buy-row">
                      <div>
                        <span className="text-xs text-muted block">Buy It Now Price</span>
                        <strong className="buy-price-tag text-accent">UGX {selectedProduct.price.toLocaleString()}</strong>
                      </div>
                      <button 
                        className="modal-buy-btn"
                        onClick={() => {
                          addToKit(selectedProduct);
                          setSelectedProduct(null);
                        }}
                      >
                        ADD TO KIT
                      </button>
                    </div>
                    
                    {selectedProduct.seller && (
                      <div className="seller-contact-details mt-4 pt-4 border-t border-gray">
                        <span className="text-xs text-muted block mb-1">Listed By Seller</span>
                        <strong>👤 {selectedProduct.seller.name}</strong>
                        <div className="text-xs text-muted mt-1">
                          📞 {selectedProduct.seller.phone} {selectedProduct.seller.email && ` | ✉️ ${selectedProduct.seller.email}`}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
