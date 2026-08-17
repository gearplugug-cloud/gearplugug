// WooCommerce REST API credentials are read from environment variables so that
// secrets are NEVER committed to source control. Define these in a local `.env`
// file (copy `.env.example`). See README for setup.
//
// SECURITY NOTE: Vite inlines VITE_* variables into the client bundle at build
// time, so any value placed here is still visible to anyone who inspects the
// shipped site. A consumer key/secret should ultimately live behind a small
// server-side proxy, never in the browser. This env-based approach is the
// interim step that keeps the secret out of GitHub. Any key that was previously
// hardcoded must be regenerated in WooCommerce.
const WC_URL = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_WC_URL : '';
const AUTH_TOKEN = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_WC_AUTH : '';
const COCART_URL = WC_URL ? WC_URL.replace('/wc/v3', '/cocart/v2') : '';

// ── WooCommerce Catalog Sync ──
export const getProducts = async () => {
  if (!WC_URL || WC_URL.includes('your-store.example')) {
    console.log('WooCommerce backend URL is not configured. Falling back to local data.');
    return [];
  }
  try {
    const response = await fetch(`${WC_URL}/products`, {
      headers: {
        'Authorization': `Basic ${AUTH_TOKEN}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('WooCommerce Error:', error);
    return [];
  }
};

// ── WooCommerce Escrow Order Creation ──
export const createOrder = async (cartItems, customerDetails = {}, transactionRef = '') => {
  if (!WC_URL || WC_URL.includes('your-store.example')) {
    console.log('WooCommerce backend URL is not configured. Creating local order.');
    return null;
  }
  try {
    const line_items = cartItems.map(item => ({
      product_id: item.id,
      quantity: 1
    }));

    const meta_data = [];
    if (transactionRef) {
      meta_data.push({
        key: 'flutterwave_transaction_ref',
        value: transactionRef
      });
      meta_data.push({
        key: 'escrow_payout_status',
        value: 'held'
      });
    }

    const payload = {
      payment_method: customerDetails.paymentMethod === 'mobile_money' ? 'momo' : 'bacs',
      payment_method_title: customerDetails.paymentMethod === 'mobile_money' ? 'Mobile Money (Flutterwave)' : 'Direct Bank Transfer',
      set_paid: !!transactionRef,
      status: transactionRef ? 'processing' : 'pending',
      line_items: line_items,
      billing: {
        first_name: customerDetails.fullName || 'Anonymous',
        last_name: '',
        address_1: customerDetails.address || '',
        city: customerDetails.city || 'Kampala',
        phone: customerDetails.phone || '',
        email: customerDetails.email || 'customer@gearplug.ug'
      },
      fee_lines: [
        {
          name: "Gear Plug Platform Fee",
          tax_status: "non-taxable",
          total: "1850.00"
        }
      ],
      meta_data: meta_data
    };

    const response = await fetch(`${WC_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${AUTH_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to create order');
    
    return await response.json();
  } catch (error) {
    console.error('WooCommerce Order Error:', error);
    return null;
  }
};

// ── Dokan Multi-Vendor Product Creation ──
export const createProduct = async (productDetails) => {
  if (!WC_URL || WC_URL.includes('your-store.example')) {
    console.log('WooCommerce URL is not configured. Storing product locally only.');
    return null;
  }
  try {
    const payload = {
      name: productDetails.name,
      type: 'simple',
      regular_price: String(productDetails.price),
      description: productDetails.description || '',
      short_description: `Listed by ${productDetails.seller?.name || 'Anonymous'}. Phone: ${productDetails.seller?.phone || ''}`,
      manage_stock: true,
      stock_quantity: 1,
      categories: [
        {
          name: productDetails.category
        }
      ],
      images: [
        {
          src: productDetails.img.startsWith('data:') 
            ? 'https://gearplug.ug/logo.png'
            : productDetails.img
        }
      ],
      attributes: [
        {
          name: 'Brand',
          visible: true,
          options: [productDetails.brand]
        },
        {
          name: 'Condition',
          visible: true,
          options: [productDetails.condition || 'Good']
        }
      ],
      meta_data: [
        {
          key: 'is_marketplace',
          value: 'yes'
        },
        {
          key: 'seller_name',
          value: productDetails.seller?.name || 'Anonymous'
        },
        {
          key: 'seller_phone',
          value: productDetails.seller?.phone || ''
        },
        {
          key: 'seller_email',
          value: productDetails.seller?.email || ''
        },
        {
          key: 'technical_specs',
          value: JSON.stringify(productDetails.specs || {})
        }
      ]
    };

    const response = await fetch(`${WC_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${AUTH_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to create WooCommerce product');
    return await response.json();
  } catch (error) {
    console.error('WooCommerce Product Create Error:', error);
    return null;
  }
};

// ── CoCart Stateless Cart Integration ──
export const getCoCartCart = async (cartKey) => {
  if (!COCART_URL || !cartKey) return null;
  try {
    const response = await fetch(`${COCART_URL}/cart?cart_key=${cartKey}`, {
      headers: {
        'Authorization': `Basic ${AUTH_TOKEN}`
      }
    });
    if (!response.ok) throw new Error('Failed to get CoCart cart');
    return await response.json();
  } catch (error) {
    console.error('CoCart Get Error:', error);
    return null;
  }
};

export const addToCoCart = async (cartKey, productId, quantity = 1) => {
  if (!COCART_URL || !cartKey) return null;
  try {
    const response = await fetch(`${COCART_URL}/cart/add-item?cart_key=${cartKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        id: String(productId),
        quantity: String(quantity)
      })
    });
    if (!response.ok) throw new Error('Failed to add item to CoCart');
    return await response.json();
  } catch (error) {
    console.error('CoCart Add Error:', error);
    return null;
  }
};

export const removeFromCoCart = async (cartKey, itemKey) => {
  if (!COCART_URL || !cartKey) return null;
  try {
    const response = await fetch(`${COCART_URL}/cart/item/${itemKey}?cart_key=${cartKey}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${AUTH_TOKEN}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete item from CoCart');
    return await response.json();
  } catch (error) {
    console.error('CoCart Delete Error:', error);
    return null;
  }
};

export const clearCoCart = async (cartKey) => {
  if (!COCART_URL || !cartKey) return null;
  try {
    const response = await fetch(`${COCART_URL}/cart/clear?cart_key=${cartKey}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${AUTH_TOKEN}`
      }
    });
    if (!response.ok) throw new Error('Failed to clear CoCart cart');
    return await response.json();
  } catch (error) {
    console.error('CoCart Clear Error:', error);
    return null;
  }
};
