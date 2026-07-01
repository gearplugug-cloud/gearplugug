import React, { createContext, useState, useContext, useCallback } from 'react';
import SAMPLE_PRODUCTS from '../lib/sampleProducts';

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

const MOCK_USERS = [
  {
    id: 'usr-001',
    name: 'Emma Patrick',
    email: 'emma@gearplug.ug',
    phone: '+256 701 234 567',
    role: 'Professional Filmmaker',
    avatar: '🎥',
    company: 'Aura Media Kampala',
    location: 'Kampala, UG'
  },
  {
    id: 'usr-002',
    name: 'Nsubuga Henry',
    email: 'henry@director.ug',
    phone: '+256 782 999 888',
    role: 'Commercial Director',
    avatar: '🎬',
    company: 'Nile Motion Pictures',
    location: 'Entebbe, UG'
  }
];

export const KitProvider = ({ children }) => {
  const [kitItems, setKitItems]     = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts]         = useState([]);

  // User Profile States
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('gearplug_profiles');
      return saved ? JSON.parse(saved) : MOCK_USERS;
    } catch (e) {
      return MOCK_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gearplug_current_user');
      if (saved) return JSON.parse(saved);
      return MOCK_USERS[0];
    } catch (e) {
      return MOCK_USERS[0];
    }
  });

  const changeUser = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('gearplug_current_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const createProfile = (newProfile) => {
    setProfiles(prev => {
      const next = [...prev, newProfile];
      try {
        localStorage.setItem('gearplug_profiles', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    setCurrentUser(newProfile);
    try {
      localStorage.setItem('gearplug_current_user', JSON.stringify(newProfile));
    } catch (e) {
      console.error(e);
    }
  };

  // Orders/Purchases History State
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gearplug_orders') || '[]');
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
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('gearplug_marketplace_products');
      const customProducts = saved ? JSON.parse(saved) : [];
      return [...SAMPLE_PRODUCTS, ...customProducts];
    } catch (e) {
      console.error("Failed to load products from localStorage", e);
      return SAMPLE_PRODUCTS;
    }
  });

  const addMarketplaceProduct = (newProduct) => {
    const productWithSeller = {
      ...newProduct,
      sellerId: currentUser.id,
      seller: {
        name: currentUser.name,
        phone: currentUser.phone,
        email: currentUser.email,
        company: currentUser.company
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
  const addToKit = (item) => {
    if (!kitItems.find((i) => i.id === item.id)) {
      const newKitSize = kitItems.length + 1;
      setKitItems(prev => [...prev, item]);
      setIsCartOpen(true);
      
      // Advanced Motivational Logic
      if (newKitSize === 4) {
        showToast(null, true, 0); // Trigger first motivational toast
      } else if (newKitSize === 7) {
        showToast(null, true, 1); // Trigger second motivational toast
      } else {
        showToast(item.category); // Trigger regular category toast
      }
    }
  };

  const removeFromKit = (itemId) => {
    setKitItems(kitItems.filter((i) => i.id !== itemId));
  };

  const clearKit = () => setKitItems([]);

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
      changeUser,
      orders,
      addOrder,
      profiles,
      createProfile,
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
