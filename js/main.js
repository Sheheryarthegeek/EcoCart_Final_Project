/* ---------------------------
   HOME — FEATURED RENDERER
   --------------------------- */

function renderFeaturedProducts(count = 6) {
  const container = document.getElementById("featuredContainer");
  if (!container) return;
  // choose first N products (or you can pick by badge later)
  const featured = (window.products || []).slice(0, count);
  container.innerHTML = ""; // clear
  featured.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <a href="product_details.html?id=${product.id}">
        <img src="${product.image}" alt="${product.name}">
      </a>
      <h3>${product.name}</h3>
      <p>$${product.price.toFixed(2)}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// call on DOM ready (only for index)
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("featuredContainer")) {
    renderFeaturedProducts(6); // show up to 6 featured items
  }
});

// --------------------------------------------
// RENDER PRODUCTS ON PRODUCTS PAGE
// --------------------------------------------

function renderProducts(list) {
  const container = document.getElementById("productsContainer");

  container.innerHTML = ""; // clear old content

  if (!list || list.length === 0) {
    container.innerHTML = "<p>No products found.</p>";
    return;
  }

  list.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
    <a href="product_details.html?id=${product.id}">
        <img src="${product.image}" alt="${product.name}">
    </a>

    <h3>${product.name}</h3>

    <p>$${product.price.toFixed(2)}</p>

    <div class="product-card__actions">
        <a href="product_details.html?id=${
          product.id
        }" class="details-btn">View Details</a>

        <button class="add-to-cart-btn" data-id="${product.id}">
            Add to Cart
        </button>
    </div>
`;

    container.appendChild(card);
  });
}

// Load all products when products page opens
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("productsContainer")) {
    renderProducts(products);
  }
});

/* ---------------------------
   FILTERING, SEARCH & SORT
   --------------------------- */

// debounce helper so typing feels smooth
function debounce(fn, delay = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

function applyFilters() {
  // read controls
  const query =
    document.getElementById("searchInput")?.value.trim().toLowerCase() || "";
  const category = document.getElementById("categoryFilter")?.value || "";
  const badge = document.getElementById("badgeFilter")?.value || "";
  const minPriceVal = document.getElementById("minPrice")?.value;
  const maxPriceVal = document.getElementById("maxPrice")?.value;
  const sortBy = document.getElementById("sortBy")?.value || "";

  const minPrice = minPriceVal === "" ? null : Number(minPriceVal);
  const maxPrice = maxPriceVal === "" ? null : Number(maxPriceVal);

  // filter step
  let filtered = products.filter((p) => {
    // search: name OR description
    const text = (p.name + " " + (p.description || "")).toLowerCase();
    if (query && !text.includes(query)) return false;

    // category
    if (category && p.category !== category) return false;

    // badge (product may have multiple badges)
    if (
      badge &&
      !p.badges.map((b) => b.toLowerCase()).includes(badge.toLowerCase())
    )
      return false;

    // price range
    if (minPrice !== null && p.price < minPrice) return false;
    if (maxPrice !== null && p.price > maxPrice) return false;

    return true;
  });

  // sorting
  if (sortBy === "low-high") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "high-low") {
    filtered.sort((a, b) => b.price - a.price);
  }

  renderProducts(filtered);
}

// set up event listeners (call once)
function initFilters() {
  // guard: run only on products page
  if (!document.getElementById("productsContainer")) return;

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const badgeFilter = document.getElementById("badgeFilter");
  const minPrice = document.getElementById("minPrice");
  const maxPrice = document.getElementById("maxPrice");
  const sortBy = document.getElementById("sortBy");

  // live search with debounce
  if (searchInput)
    searchInput.addEventListener("input", debounce(applyFilters, 200));

  // other controls (instant)
  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
  if (badgeFilter) badgeFilter.addEventListener("change", applyFilters);
  if (minPrice) minPrice.addEventListener("input", debounce(applyFilters, 200));
  if (maxPrice) maxPrice.addEventListener("input", debounce(applyFilters, 200));
  if (sortBy) sortBy.addEventListener("change", applyFilters);

  // initial apply (in case any defaults are set)
  applyFilters();
}

// call initFilters on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  initFilters();
});

/* ---------------------------
   ADD TO CART HANDLERS
   --------------------------- */

/** Attach click handlers for add-to-cart buttons (delegation) */
function initAddToCartHandlers() {
  // Only run on pages with products
  const container = document.getElementById("productsContainer");
  if (!container) return;

  // Delegated click listener
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart-btn");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;

    // simple visual feedback: disable briefly
    btn.disabled = true;
    btn.textContent = "Adding...";
    setTimeout(() => {
      addToCart(id, 1); // function from cart.js
      btn.disabled = false;
      btn.textContent = "Add to Cart";
    }, 250);
  });
}

/** Update cart count element on the page */
function updateCartCountUI() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  el.textContent = getCartCount(); // getCartCount from cart.js
}

/** Listen to global cart events so multiple pages update their counters */
window.addEventListener("ecocart:updated", (e) => {
  updateCartCountUI();
});

// Also update the UI when page loads
document.addEventListener("DOMContentLoaded", () => {
  updateCartCountUI();
  initAddToCartHandlers();
});

/* ---------------------------
   CART PAGE RENDERER
   --------------------------- */

function renderCartPage() {
  // only run on cart page
  const container = document.getElementById("cartContainer");
  if (!container) return;

  const { items, subtotal, totalItems } = calculateCartDetails();

  // Empty state
  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p>Your cart is empty.</p>
        <a href="products.html" class="hero__btn">Browse Products</a>
      </div>
    `;
    updateCartCountUI();
    return;
  }

  // Build cart HTML
  const rows = items
    .map((it) => {
      const p = it.product;
      const img =
        p && p.image
          ? `<img src="${p.image}" alt="${p.name}" class="cart-item__img">`
          : "";
      const name = p ? p.name : "Unknown product";
      const price = p ? `$${p.price.toFixed(2)}` : "$0.00";
      return `
      <div class="cart-item" data-id="${p ? p.id : ""}">
        <div class="cart-item__left">
          ${img}
        </div>
        <div class="cart-item__main">
          <h4 class="cart-item__name">${name}</h4>
          <p class="cart-item__price">${price}</p>
          <div class="cart-item__controls">
            <button class="qty-decrease" data-id="${p ? p.id : ""}">-</button>
            <input type="number" class="qty-input" value="${
              it.qty
            }" min="1" data-id="${p ? p.id : ""}">
            <button class="qty-increase" data-id="${p ? p.id : ""}">+</button>
            <button class="remove-item" data-id="${
              p ? p.id : ""
            }">Remove</button>
          </div>
        </div>
        <div class="cart-item__right">
          <strong>$${it.lineTotal.toFixed(2)}</strong>
        </div>
      </div>
    `;
    })
    .join("");

  container.innerHTML = `
    <div class="cart-items">${rows}</div>
    <div class="cart-summary">
      <p>Total items: ${totalItems}</p>
      <p>Subtotal: $${subtotal.toFixed(2)}</p>
      <a href="checkout.html" class="hero__btn" id="checkoutBtn">Checkout</a>
    </div>
  `;

  updateCartCountUI();
}

// Delegated handlers for qty + remove on cart page
function initCartPageHandlers() {
  const container = document.getElementById("cartContainer");
  if (!container) return;

  container.addEventListener("click", (e) => {
    const inc = e.target.closest(".qty-increase");
    const dec = e.target.closest(".qty-decrease");
    const rem = e.target.closest(".remove-item");

    if (inc) {
      const id = inc.dataset.id;
      const current = loadCart().find((i) => i.id === id);
      updateQuantity(id, (current ? current.qty : 0) + 1);
      renderCartPage();
    } else if (dec) {
      const id = dec.dataset.id;
      const current = loadCart().find((i) => i.id === id);
      const newQty = (current ? current.qty : 1) - 1;
      updateQuantity(id, newQty);
      renderCartPage();
    } else if (rem) {
      const id = rem.dataset.id;
      removeFromCart(id);
      renderCartPage();
    }
  });

  // handle direct qty input changes
  container.addEventListener("change", (e) => {
    const input = e.target.closest(".qty-input");
    if (!input) return;
    const id = input.dataset.id;
    const val = Number(input.value) || 1;
    updateQuantity(id, val);
    renderCartPage();
  });
}

// call renderer + handlers on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
  initCartPageHandlers();
});

/* ---------------------------
   PRODUCT DETAILS PAGE LOGIC
----------------------------*/

function loadProductDetails() {
  const container = document.getElementById("productDetailsContainer");
  if (!container) return; // not on product details page

  // Read ?id= from URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // Find the product
  const product = products.find((p) => p.id === id);

  if (!product) {
    container.innerHTML = "<p>Product not found.</p>";
    return;
  }

  // Render details
  container.innerHTML = `
        <div class="details-wrapper">

            <div class="details-image">
                <img src="${product.image}" alt="${product.name}">
            </div>

            <div class="details-info">
                <h2>${product.name}</h2>

                <p class="details-price">$${product.price.toFixed(2)}</p>

                <p class="details-description">${product.description}</p>

                <div class="details-badges">
                    ${product.badges
                      .map((b) => `<span class="badge">${b}</span>`)
                      .join("")}
                </div>

                <div class="details-qty">
                    <label>Quantity:</label>
                    <input type="number" id="detailsQty" value="1" min="1">
                </div>

                <button id="detailsAddBtn" data-id="${
                  product.id
                }" class="add-btn">
                    Add to Cart
                </button>
            </div>

        </div>
    `;

  // Add to cart handler
  const addBtn = document.getElementById("detailsAddBtn");
  const qtyInput = document.getElementById("detailsQty");

  addBtn.addEventListener("click", () => {
    const qty = Number(qtyInput.value);
    addToCart(product.id, qty);
  });
}

// Run it on DOM load
document.addEventListener("DOMContentLoaded", () => {
  loadProductDetails();
});

/* ---------------------------
   CONTACT FORM VALIDATION
   --------------------------- */

function validateEmail(email) {
  // simple email regex (sufficient for client-side)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const messageEl = document.getElementById("message");

  const errName = document.getElementById("err-name");
  const errEmail = document.getElementById("err-email");
  const errMessage = document.getElementById("err-message");
  const successBox = document.getElementById("contactSuccess");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // reset errors
    errName.textContent = "";
    errEmail.textContent = "";
    errMessage.textContent = "";
    successBox.hidden = true;

    let hasError = false;

    if (!nameEl.value.trim()) {
      errName.textContent = "Please enter your name.";
      hasError = true;
    }

    if (!validateEmail(emailEl.value.trim())) {
      errEmail.textContent = "Please enter a valid email.";
      hasError = true;
    }

    if (!messageEl.value.trim() || messageEl.value.trim().length < 10) {
      errMessage.textContent = "Please enter a message (10+ characters).";
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // Simulate successful send (no backend)
    successBox.hidden = false;
    form.reset();

    // Optionally log to console (for instructor demo)
    console.log("Contact message:", {
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      subject: document.getElementById("subject").value.trim(),
      message: messageEl.value.trim(),
    });
  });
}

// init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  initContactForm();
});

/* ---------------------------
   CHECKOUT PAGE LOGIC
   --------------------------- */

function renderCheckoutPage() {
  const container = document.getElementById("orderSummary");
  if (!container) return;

  const { items, subtotal, totalItems } = calculateCartDetails();

  container.innerHTML = `
    <h3>Order Summary</h3>
    <p>${totalItems} item(s)</p>
    <div class="summary-items">
      ${items
        .map((it) => {
          const p = it.product || {};
          const name = p.name || "Unknown";
          const img = p.image ? `<img src="${p.image}" alt="${name}">` : "";
          return `<div class="summary-item">
                  <div style="display:flex;align-items:center;">
                    ${img}
                    <div>
                      <div style="font-size:15px;color:#2d3436;">${name}</div>
                      <div style="font-size:13px;color:#666;">Qty: ${
                        it.qty
                      }</div>
                    </div>
                  </div>
                  <div style="font-weight:600;color:#2d3436;">$${it.lineTotal.toFixed(
                    2
                  )}</div>
                </div>`;
        })
        .join("")}
    </div>

    <div class="summary-totals">
      <div>Subtotal: $${subtotal.toFixed(2)}</div>
      <div>Shipping: $0.00</div>
      <div>Total: $${subtotal.toFixed(2)}</div>
    </div>
  `;
}

/** simple email validator (reuse existing function if present) */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  const nameEl = document.getElementById("c_name");
  const emailEl = document.getElementById("c_email");
  const addressEl = document.getElementById("c_address");
  const paymentEl = document.getElementById("c_payment");
  const successBox = document.getElementById("checkoutSuccess");
  const submitBtn = document.getElementById("submitCheckout");

  function resetErrors() {
    document.getElementById("err-c-name").textContent = "";
    document.getElementById("err-c-email").textContent = "";
    document.getElementById("err-c-address").textContent = "";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    resetErrors();

    let hasError = false;
    if (!nameEl.value.trim()) {
      document.getElementById("err-c-name").textContent =
        "Please enter your name.";
      hasError = true;
    }
    if (!validateEmail(emailEl.value.trim())) {
      document.getElementById("err-c-email").textContent =
        "Please enter a valid email.";
      hasError = true;
    }
    if (!addressEl.value.trim() || addressEl.value.trim().length < 6) {
      document.getElementById("err-c-address").textContent =
        "Please enter a valid shipping address.";
      hasError = true;
    }

    // if cart empty, block checkout
    const { items, subtotal, totalItems } = calculateCartDetails();
    if (!items || items.length === 0) {
      alert("Your cart is empty. Add products before checkout.");
      hasError = true;
    }

    if (hasError) return;

    // Simulate order submission
    submitBtn.disabled = true;
    submitBtn.textContent = "Placing order...";

    setTimeout(() => {
      const orderId = "ORD-" + Date.now();
      // Save order record to localStorage (demo)
      const ordersRaw = localStorage.getItem("ecocart_orders");
      const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
      orders.push({
        id: orderId,
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        address: addressEl.value.trim(),
        payment: paymentEl.value,
        items,
        subtotal,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("ecocart_orders", JSON.stringify(orders));

      // Clear cart
      saveCart([]);
      broadcastCartUpdated();

      // Show success UI
      successBox.hidden = false;
      successBox.innerHTML = `
        <h4>Thank you — your order has been placed!</h4>
        <p>Order ID: <strong>${orderId}</strong></p>
        <p>Total: $${subtotal.toFixed(2)}</p>
        <p>An email confirmation will be sent to <strong>${emailEl.value.trim()}</strong></p>
        <p><a href="index.html" class="hero__btn">Continue Shopping</a>
        <a href="products.html" class="hero__btn" style="margin-left:10px;">View more products</a></p>
      `;

      // reset form & UI
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = "Place Order";
      renderCheckoutPage();
      updateCartCountUI();
      // scroll to top of success
      successBox.scrollIntoView({ behavior: "smooth" });
    }, 900);
  });
}

// run on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  renderCheckoutPage();
  initCheckoutForm();
});

// mark active nav link with aria-current
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".header__nav a[href]");
  const path = location.pathname.split("/").pop() || "index.html";
  navLinks.forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path) {
      a.setAttribute("aria-current", "page");
    } else {
      a.removeAttribute("aria-current");
    }
  });

  // make cart-count a live region for screen readers
  const cartCountEl = document.getElementById("cart-count");
  if (cartCountEl) {
    cartCountEl.setAttribute("aria-live", "polite");
    cartCountEl.setAttribute("aria-atomic", "true");
  }
});
