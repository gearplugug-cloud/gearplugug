import React, { useState } from 'react';
import { useKit } from '../context/KitContext';
import { Package, Heart, Search, Eye, Settings, User, CreditCard, LogOut, Loader2, Edit, ChevronRight, Save, X } from 'lucide-react';
import './ProfileDashboard.css';
import { Link } from 'react-router-dom';

export default function ProfileDashboard() {
  const { currentUser, favorites, recentlyViewed, orders, logout, updateUserProfile } = useKit();
  const [activeTab, setActiveTab] = useState('summary');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', company: '', location: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = () => {
    setEditForm({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
      company: currentUser.company || '',
      location: currentUser.location || ''
    });
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    if (!updateUserProfile) return;
    setIsSaving(true);
    await updateUserProfile(editForm);
    setIsSaving(false);
    setIsEditingProfile(false);
  };

  const handleFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  if (!currentUser) {
    return (
      <div className="profile-dashboard container" style={{ paddingTop: '120px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin text-accent mb-4" size={32} />
        <h2 className="text-xl">Loading Profile...</h2>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="tab-pane-content">
            <h2 className="tab-title">Account Summary</h2>
            <div className="summary-cards-grid">
              <div className="summary-card" onClick={() => setActiveTab('orders')}>
                <div className="card-icon"><Package /></div>
                <div className="card-info">
                  <h3>Recent Orders</h3>
                  <p>Track, return, or buy again</p>
                </div>
                <ChevronRight size={16} />
              </div>
              <div className="summary-card" onClick={() => setActiveTab('watchlist')}>
                <div className="card-icon"><Heart /></div>
                <div className="card-info">
                  <h3>Watchlist ({favorites.length})</h3>
                  <p>View your saved items</p>
                </div>
                <ChevronRight size={16} />
              </div>
              <div className="summary-card" onClick={() => setActiveTab('recent')}>
                <div className="card-icon"><Eye /></div>
                <div className="card-info">
                  <h3>Recently Viewed</h3>
                  <p>Pick up where you left off</p>
                </div>
                <ChevronRight size={16} />
              </div>
              <div className="summary-card" onClick={() => setActiveTab('personal')}>
                <div className="card-icon"><User /></div>
                <div className="card-info">
                  <h3>Personal Info</h3>
                  <p>Update your details & address</p>
                </div>
                <ChevronRight size={16} />
              </div>
              <div className="summary-card" onClick={() => setActiveTab('settings')}>
                <div className="card-icon"><Settings /></div>
                <div className="card-info">
                  <h3>Account Settings</h3>
                  <p>Currency, preferences, & security</p>
                </div>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        );
      case 'watchlist':
        return (
          <div className="tab-pane-content">
            <h2 className="tab-title">Watchlist</h2>
            {favorites.length === 0 ? (
              <div className="empty-state">
                <Heart size={48} className="text-muted mb-4" />
                <p>Your watchlist is empty. Start saving items you love!</p>
                <Link to="/shop" className="btn-primary mt-4 inline-block">Explore Marketplace</Link>
              </div>
            ) : (
              <div className="list-grid">
                {favorites.map(id => (
                  <div key={id} className="list-item-card">
                    <div className="list-item-img-placeholder">
                      {/* You can map over products to get image, here is a placeholder */}
                      <span className="text-muted text-xs">Item {id}</span>
                    </div>
                    <div className="list-item-details">
                      <h4>Saved Gear</h4>
                      <Link to="/shop" className="text-accent text-sm">View Item</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'recent':
        return (
          <div className="tab-pane-content">
            <h2 className="tab-title">Recently Viewed</h2>
            {recentlyViewed && recentlyViewed.length > 0 ? (
              <div className="list-grid">
                 {recentlyViewed.map(id => (
                  <div key={id} className="list-item-card">
                    <div className="list-item-img-placeholder">
                      <span className="text-muted text-xs">Item {id}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Eye size={48} className="text-muted mb-4" />
                <p>You haven't viewed any items recently.</p>
              </div>
            )}
          </div>
        );
      case 'orders':
        const userOrders = orders.filter(o => o.customerId === currentUser.id);
        return (
          <div className="tab-pane-content">
            <h2 className="tab-title">Purchase History</h2>
            {userOrders.length === 0 ? (
              <div className="empty-state">
                <Package size={48} className="text-muted mb-4" />
                <p>You have no recent purchases.</p>
                <Link to="/shop" className="btn-primary mt-4 inline-block">Start Shopping</Link>
              </div>
            ) : (
              <div className="orders-list">
                {userOrders.map(ord => (
                  <div key={ord.id} className="order-history-card">
                    <div className="order-history-header">
                      <div>
                        <span className="text-muted text-xs block">Order ID</span>
                        <strong>{ord.id}</strong>
                      </div>
                      <div>
                        <span className="text-muted text-xs block">Date</span>
                        <strong>{new Date(ord.date).toLocaleDateString()}</strong>
                      </div>
                      <div>
                        <span className="text-muted text-xs block">Total</span>
                        <strong className="text-accent">UGX {ord.total.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="status-badge bg-accent-soft text-accent">Processing</span>
                      </div>
                    </div>
                    <div className="order-history-items">
                      {ord.items.map((it, idx) => (
                         <div key={idx} className="order-item-row">
                           <span>{it.name}</span>
                         </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'personal':
        return (
          <div className="tab-pane-content">
            <div className="flex justify-between items-center mb-6">
              <h2 className="tab-title m-0">Personal Information</h2>
              {!isEditingProfile ? (
                <button className="btn-outline-small" onClick={handleEditClick}>
                  <Edit size={14} className="mr-2" /> Edit
                </button>
              ) : (
                <div className="flex" style={{ gap: '10px' }}>
                  <button className="btn-outline-small" onClick={handleCancelEdit} disabled={isSaving}>
                    <X size={14} className="mr-2" /> Cancel
                  </button>
                  <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />} Save
                  </button>
                </div>
              )}
            </div>
            <div className="info-grid">
              <div className="info-group">
                <label>Full Name</label>
                {isEditingProfile ? (
                  <input type="text" name="name" className="input-field" value={editForm.name} onChange={handleFormChange} />
                ) : (
                  <div className="info-val">{currentUser.name}</div>
                )}
              </div>
              <div className="info-group">
                <label>Email Address</label>
                <div className="info-val">{currentUser.email} <span style={{fontSize:'11px', color:'#888', marginLeft:'8px'}}>(Cannot be changed)</span></div>
              </div>
              <div className="info-group">
                <label>Phone Number</label>
                {isEditingProfile ? (
                  <input type="text" name="phone" className="input-field" value={editForm.phone} onChange={handleFormChange} placeholder="+256..." />
                ) : (
                  <div className="info-val">{currentUser.phone || 'Not provided'}</div>
                )}
              </div>
              <div className="info-group">
                <label>Company/Studio</label>
                {isEditingProfile ? (
                  <input type="text" name="company" className="input-field" value={editForm.company} onChange={handleFormChange} placeholder="Company Name" />
                ) : (
                  <div className="info-val">{currentUser.company || 'Not provided'}</div>
                )}
              </div>
              <div className="info-group">
                <label>Default Shipping Address</label>
                {isEditingProfile ? (
                  <input type="text" name="location" className="input-field" value={editForm.location} onChange={handleFormChange} placeholder="City, Country" />
                ) : (
                  <div className="info-val">{currentUser.location || 'Kampala, Uganda'}</div>
                )}
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="tab-pane-content">
            <h2 className="tab-title">Account Settings</h2>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Currency Preference</h4>
                  <p>Display prices in UGX or USD</p>
                </div>
                <div className="setting-action">
                  <select className="input-select" defaultValue="UGX">
                    <option value="UGX">UGX (Ugandan Shilling)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Email Notifications</h4>
                  <p>Order updates, bid alerts, and promotions</p>
                </div>
                <div className="setting-action">
                   <label className="toggle-switch">
                     <input type="checkbox" defaultChecked />
                     <span className="slider"></span>
                   </label>
                </div>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <div className="setting-action">
                   <button className="btn-outline-small">Enable</button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-dashboard container" style={{ paddingTop: '100px', paddingBottom: '100px', minHeight: '100vh' }}>
      
      {/* eBay-style Dashboard Header */}
      <div className="dashboard-header mb-8">
        <div className="user-greeting">
          <div className="avatar-circle">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hi, {currentUser.name}!</h1>
            <p className="text-sm text-muted">{currentUser.email}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* eBay-style Sidebar Nav */}
        <aside className="dashboard-sidebar shadow-premium">
           <nav className="dashboard-nav">
             <div className="nav-section">
               <h3 className="nav-section-title">My Gear Plug</h3>
               <ul>
                 <li>
                   <button className={`nav-item ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
                     Account Summary
                   </button>
                 </li>
                 <li>
                   <button className={`nav-item ${activeTab === 'recent' ? 'active' : ''}`} onClick={() => setActiveTab('recent')}>
                     Recently Viewed
                   </button>
                 </li>
               </ul>
             </div>

             <div className="nav-section">
               <h3 className="nav-section-title">Activity</h3>
               <ul>
                 <li>
                   <button className={`nav-item ${activeTab === 'watchlist' ? 'active' : ''}`} onClick={() => setActiveTab('watchlist')}>
                     Watchlist
                   </button>
                 </li>
                 <li>
                   <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                     Purchase History
                   </button>
                 </li>
                 <li>
                   <button className="nav-item">Bids / Offers</button>
                 </li>
               </ul>
             </div>

             <div className="nav-section">
               <h3 className="nav-section-title">Account</h3>
               <ul>
                 <li>
                   <button className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
                     Personal Info
                   </button>
                 </li>
                 <li>
                   <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                     Account Settings
                   </button>
                 </li>
               </ul>
             </div>
           </nav>
           
           <div className="sidebar-footer">
             <button className="btn-logout" onClick={() => {
                if (window.confirm("Are you sure you want to log out?")) {
                  logout();
                  window.location.href = '/';
                }
             }}>
               <LogOut size={16} /> Sign Out
             </button>
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main-content shadow-premium">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
