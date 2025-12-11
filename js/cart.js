// ---------------------------------
// cart.js
// Client-side cart stored in localStorage
// Key: 'ecocart_cart'
// ---------------------------------

const CART_KEY = "ecocart_cart";

/** Load cart from localStorage (returns array of { id, qty }) */
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse cart:", e);
    return [];
  }
}

/** Save cart array to localStorage */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/** Find cart item by productId */
function findCartItem(cart, productId) {
  return cart.find((item) => item.id === productId);
}

/** Add product to cart (id, qty default 1) */
function addToCart(productId, qty = 1) {
  const cart = loadCart();
  const existing = findCartItem(cart, productId);
  if (existing) {
    existing.qty = Math.max(1, existing.qty + qty);
  } else {
    cart.push({ id: productId, qty: Math.max(1, qty) });
  }
  saveCart(cart);
  broadcastCartUpdated();
  return cart;
}

/** Remove product from cart entirely */
function removeFromCart(productId) {
  let cart = loadCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  broadcastCartUpdated();
  return cart;
}

/** Update quantity (set absolute qty); if qty <=0 remove item */
function updateQuantity(productId, qty) {
  let cart = loadCart();
  qty = Number(qty);
  if (qty <= 0) {
    cart = cart.filter((item) => item.id !== productId);
  } else {
    const item = findCartItem(cart, productId);
    if (item) item.qty = qty;
  }
  saveCart(cart);
  broadcastCartUpdated();
  return cart;
}

/** Calculate totals (returns { items: [{product, qty, lineTotal}], subtotal, totalItems } ) */
function calculateCartDetails() {
  const cart = loadCart();
  const items = cart.map((ci) => {
    const product = (window.products || []).find((p) => p.id === ci.id);
    const qty = ci.qty;
    const price = product ? product.price : 0;
    return {
      product,
      qty,
      lineTotal: +(price * qty).toFixed(2),
    };
  });

  const subtotal = +items.reduce((s, it) => s + it.lineTotal, 0).toFixed(2);
  const totalItems = items.reduce((s, it) => s + it.qty, 0);

  return { items, subtotal, totalItems };
}

/** Return the number of items in the cart (sum of quantities) */
function getCartCount() {
  return calculateCartDetails().totalItems;
}

/** Utility to dispatch a global event so other scripts can react */
function broadcastCartUpdated() {
  try {
    const event = new CustomEvent("ecocart:updated", {
      detail: { count: getCartCount() },
    });
    window.dispatchEvent(event);
  } catch (e) {
    // fallback: do nothing
  }
}

// Ensure cart is initialized in localStorage (optional)
(function ensureCart() {
  if (!localStorage.getItem(CART_KEY)) {
    saveCart([]);
  }
  // broadcast initial count
  broadcastCartUpdated();
})();
