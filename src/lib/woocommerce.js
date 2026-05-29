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
const WC_URL = import.meta.env.VITE_WC_URL;
const AUTH_TOKEN = import.meta.env.VITE_WC_AUTH;

export const getProducts = async () => {
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

export const createOrder = async (cartItems) => {
  try {
    // Map our cart items to WooCommerce line_items format
    // Requires the WooCommerce Product ID
    const line_items = cartItems.map(item => ({
      product_id: item.id,
      quantity: 1
    }));

    const response = await fetch(`${WC_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        payment_method: 'bacs', // Placeholder, the user will select actual payment on the WP side
        payment_method_title: 'Direct Bank Transfer',
        set_paid: false,
        line_items: line_items
      })
    });

    if (!response.ok) throw new Error('Failed to create order');
    
    return await response.json();
  } catch (error) {
    console.error('WooCommerce Order Error:', error);
    return null;
  }
};
