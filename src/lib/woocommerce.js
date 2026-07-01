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

export const createOrder = async (cartItems, customerDetails = {}) => {
  if (!WC_URL || WC_URL.includes('your-store.example')) {
    console.log('WooCommerce backend URL is not configured. Creating local order.');
    return null;
  }
  try {
    // Map our cart items to WooCommerce line_items format
    const line_items = cartItems.map(item => ({
      product_id: item.id,
      quantity: 1
    }));

    const payload = {
      payment_method: customerDetails.paymentMethod === 'mobile_money' ? 'momo' : 'bacs',
      payment_method_title: customerDetails.paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Direct Bank Transfer',
      set_paid: false,
      line_items: line_items,
      billing: {
        first_name: customerDetails.fullName || 'Anonymous',
        last_name: '',
        address_1: customerDetails.address || '',
        city: customerDetails.city || 'Kampala',
        phone: customerDetails.phone || '',
        email: customerDetails.email || 'customer@gearplug.ug'
      }
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
