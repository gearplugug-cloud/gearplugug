import React, { useState } from 'react';
import { useKit } from '../context/KitContext';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose }) {
  const { login, signup, authError, isAuthLoading } = useKit();
  const [isLogin, setIsLogin] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await signup(email, password, firstName, lastName);
    }
    
    if (result === true) {
      onClose();
    } else if (result === 'verify') {
      setVerificationSent(true);
    }
  };

  if (verificationSent) {
    return (
      <div className="auth-modal-overlay">
        <div className="auth-modal" style={{ textAlign: 'center' }}>
          <button className="auth-close-btn" onClick={onClose}>&times;</button>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
          <h2 className="auth-title">Check Your Email</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
            We've sent a verification link to <strong>{email}</strong>.<br/>
            Please click the link to activate your seller account before logging in.
          </p>
          <button 
            className="auth-submit-btn" 
            onClick={() => { setVerificationSent(false); setIsLogin(true); }}
          >
            Return to Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="auth-close-btn" onClick={onClose}>&times;</button>
        <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Seller Account'}</h2>
        
        {authError && <div className="auth-error">{authError}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-name-row">
              <input 
                type="text" 
                placeholder="First Name" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="Last Name" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                required 
              />
            </div>
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="auth-submit-btn" disabled={isAuthLoading}>
            {isAuthLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up & Become a Vendor')}
          </button>
        </form>
        
        <div className="auth-toggle">
          {isLogin ? (
            <p>Don't have a seller account? <button type="button" onClick={() => setIsLogin(false)}>Sign Up</button></p>
          ) : (
            <p>Already have an account? <button type="button" onClick={() => setIsLogin(true)}>Log In</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
