import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import SAMPLE_PRODUCTS from '../lib/sampleProducts';
import { 
  getProducts as fetchWooProducts,
  getCoCartCart,
  addToCoCart,
  removeFromCoCart,
  clearCoCart
} from '../lib/woocommerce';
import { auth } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';

const KitContext = createContext();

export const useKit = () => useContext(KitContext);

/* ── Smart Suggestions per category ── */
const SMART_SUGGESTIONS = {
  'Camera Bodies': {
    icon: '🔋',
    text: <><strong>Nice choice!</strong> Don't forget to add a <strong>V-Mount battery</strong> from the Accessories section for uninterrupted shooting.</>,
  },
  'Lenses': {
    icon: '🔒',
    text: <><strong>Great lens!</strong> Consider adding a <strong>Matte Box</strong> or <strong>ND filter set</strong> to control exposure on outdoor shoots.</>,
  },
  'Sound Equipment': {
    icon: '🎧',
    text: <><strong>Audio covered!</strong> Pair this with a <strong>boom pole</strong> and <strong>windscreen</strong> for clean outdoor sound.</>,
  },
  'Tripods & Lighting': {
    icon: '💡',
    text: <><strong>Solid support!</strong> Consider adding <strong>diffusion panels</strong> or a <strong>light meter</strong> for a polished look.</>,
  },
  'Accessories': {
    icon: '⚡',
    text: <><strong>Smart add!</strong> Make sure your <strong>camera body</strong> is also in the kit so your accessories have a home.</>,
  },
};

const MOTIVATIONAL_SUGGESTIONS = [
  {
    icon: '🔥',
    text: <><strong>Pro Setup Detected!</strong> With all this equipment, you're going to be the best photographer on set today!</>
  },
  {
    icon: '🎬',
    text: <><strong>Cinematic Kit!</strong> This gear combination is perfect for a high-end commercial shoot. Masterpiece incoming!</>
  }
];

export const KitProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [kitItems, setKitItems]     = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts]         = useState([]);

  // CoCart session variables
  const [cartKey] = useState(() => {
    try {
      let key = localStorage.getItem('gearplug_cart_key');
      if (!key) {
        key = 'cart-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('gearplug_cart_key', key);
      }
      return key;
    } catch (e) {
      return 'cart-fallback';
    }
  });

  const [cocartItemKeys, setCocartItemKeys] = useState({});

  // User Profile States
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          id: user.uid,
          name: user.displayName || 'Vendor',
          email: user.email,
          emailVerified: user.emailVerified,
          avatar: '👤'
        });
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async (email, password, firstName, lastName) => {
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update Firebase profile
      await updateProfile(user, { displayName: `${firstName} ${lastName}` });
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Hit WordPress custom endpoint to provision Dokan Vendor
      await fetch('https://cornflowerblue-clam-962411.hostingersite.com/wp-json/gearplug/v1/vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          firebase_uid: user.uid,
          secret: 'gearplug-super-secret-2026'
        })
      });
      
      return true;
    } catch (error) {
      setAuthError(error.message);
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsAuthLoading(true);
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      setAuthError(error.message);
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Shared active shop tab state
  const [shopTab, setShopTab] = useState('all');

  // Orders/Purchases History State
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('gearplug_orders');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  const addOrder = (order) => {
    setOrders(prev => {
      const next = [...prev, order];
      try {
        localStorage.setItem('gearplug_orders', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };


  
  // Marketplace products state with localStorage persistence
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      let customProducts = [];
      try {
        const saved = localStorage.getItem('gearplug_marketplace_products');
        const parsed = saved ? JSON.parse(saved) : null;
        customProducts = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to load products from localStorage", e);
      }

      try {
        const wooItems = await fetchWooProducts();
        if (wooItems && wooItems.length > 0) {
          const mappedWoo = wooItems.map(wp => ({
            id: wp.id,
            name: wp.name,
            brand: wp.attributes?.find(attr => attr.name.toLowerCase() === 'brand')?.options[0] || 'Generic',
            category: wp.categories?.[0]?.name || 'Accessories',
            price: parseFloat(wp.price || 0),
            description: wp.description?.replace(/<[^>]*>/g, '') || '',
            img: wp.images?.[0]?.src || '/fx6_camera_1782841415607.png',
            isWooCommerce: true
          }));
          setProducts([...mappedWoo, ...customProducts]);
        } else {
          setProducts([...SAMPLE_PRODUCTS, ...customProducts]);
        }
      } catch (e) {
        console.error("Failed to fetch WooCommerce products, falling back to samples", e);
        setProducts([...SAMPLE_PRODUCTS, ...customProducts]);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const loadCoCart = async () => {
      try {
        const cart = await getCoCartCart(cartKey);
        if (cart && cart.items) {
          const keys = {};
          const items = [];
          Object.values(cart.items).forEach(item => {
            keys[item.id] = item.item_key;
            const matched = products.find(p => String(p.id) === String(item.id));
            if (matched) {
              items.push(matched);
            } else {
              items.push({
                id: item.id,
                name: item.name,
                price: parseFloat(item.price || 0),
                category: 'Accessories',
                img: '/fx6_camera_1782841415607.png'
              });
            }
          });
          setCocartItemKeys(keys);
          setKitItems(items);
        }
      } catch (e) {
        console.error("Failed to load CoCart session", e);
      }
    };
    loadCoCart();
  }, [products, cartKey]);

  const addMarketplaceProduct = (newProduct) => {
    const productWithSeller = {
      ...newProduct,
      sellerId: currentUser?.id || 'guest',
      seller: {
        name: currentUser?.name || 'Anonymous',
        phone: currentUser?.phone || '',
        email: currentUser?.email || '',
        company: currentUser?.company || ''
      }
    };
    setProducts(prev => {
      const updated = [...prev, productWithSeller];
      try {
        const saved = localStorage.getItem('gearplug_marketplace_products');
        const customProducts = saved ? JSON.parse(saved) : [];
        const newCustomList = [...customProducts, productWithSeller];
        localStorage.setItem('gearplug_marketplace_products', JSON.stringify(newCustomList));
      } catch (e) {
        console.error("Failed to save product to localStorage", e);
      }
      return updated;
    });
  };

  /* ── Toast system ── */
  const showToast = useCallback((category, isMotivational = false, motivationalIndex = 0) => {
    let suggestion;
    if (isMotivational) {
      suggestion = MOTIVATIONAL_SUGGESTIONS[motivationalIndex];
    } else {
      suggestion = SMART_SUGGESTIONS[category];
    }
    
    if (!suggestion) return;
    const id = Date.now();
    setToasts(prev => [...prev, { id, ...suggestion }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  /* ── Kit operations ── */
  const addToKit = async (item) => {
    if (!kitItems.find((i) => i.id === item.id)) {
      const newKitSize = kitItems.length + 1;
      setKitItems(prev => [...prev, item]);
      setIsCartOpen(true);
      
      try {
        const res = await addToCoCart(cartKey, item.id);
        if (res && res.item_key) {
          setCocartItemKeys(prev => ({ ...prev, [item.id]: res.item_key }));
        }
      } catch (err) {
        console.error("CoCart add sync failed", err);
      }
      
      if (newKitSize === 4) {
        showToast(null, true, 0);
      } else if (newKitSize === 7) {
        showToast(null, true, 1);
      } else {
        showToast(item.category);
      }
    }
  };

  const removeFromKit = async (itemId) => {
    setKitItems(prev => prev.filter((i) => i.id !== itemId));
    
    const itemKey = cocartItemKeys[itemId];
    if (itemKey) {
      try {
        await removeFromCoCart(cartKey, itemKey);
        setCocartItemKeys(prev => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
      } catch (err) {
        console.error("CoCart remove sync failed", err);
      }
    }
  };

  const clearKit = async () => {
    setKitItems([]);
    try {
      await clearCoCart(cartKey);
      setCocartItemKeys({});
    } catch (err) {
      console.error("CoCart clear sync failed", err);
    }
  };

  const totalCost  = kitItems.reduce((acc, item) => acc + (item.price || 0), 0);
  const totalItems = kitItems.length;

  return (
    <KitContext.Provider value={{
      kitItems,
      addToKit,
      removeFromKit,
      clearKit,
      totalCost,
      totalItems,
      isCartOpen,
      setIsCartOpen,
      toasts,
      showToast,
      products,
      addMarketplaceProduct,
      currentUser,
      login,
      signup,
      logout,
      isAuthLoading,
      authError,
      orders,
      addOrder,
      shopTab,
      setShopTab,
      theme,
      toggleTheme,
    }}>
      {children}

      {/* ── Toast Portal — rendered here so it's always on top ── */}
      <div className="smart-toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="smart-toast">
            <div className="toast-icon">{toast.icon}</div>
            <div className="toast-text">{toast.text}</div>
          </div>
        ))}
      </div>
    </KitContext.Provider>
  );
};
