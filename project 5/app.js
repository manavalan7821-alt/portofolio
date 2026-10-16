
"use strict";

// ------------------------------------
// 1. PRODUCT DATA
// ------------------------------------

const products = [
  {
    id: 1,
    name: "Studio Headphones",
    category: "Electronics",
    price: 2499,
    description: "Comfortable headphones for music, study and everyday use.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=75"
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: 3299,
    description: "A modern watch for tracking your daily routine and activity.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=75"
  },
  {
    id: 3,
    name: "Classic Backpack",
    category: "Accessories",
    price: 1799,
    description: "A practical backpack for college, travel and daily essentials.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=75"
  },
  {
    id: 4,
    name: "Minimal Sneakers",
    category: "Lifestyle",
    price: 2899,
    description: "Versatile everyday sneakers with a clean, minimal look.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=75"
  },
  {
    id: 5,
    name: "Travel Camera",
    category: "Electronics",
    price: 8999,
    description: "A compact camera for capturing memorable adventures.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=75"
  },
  {
    id: 6,
    name: "Everyday Sunglasses",
    category: "Accessories",
    price: 999,
    description: "A stylish accessory for casual outings and sunny days.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=75"
  },
  {
    id: 7,
    name: "Ceramic Coffee Mug",
    category: "Lifestyle",
    price: 499,
    description: "A simple ceramic mug for your favourite hot drinks.",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=75"
  },
  {
    id: 8,
    name: "Wireless Speaker",
    category: "Electronics",
    price: 2199,
    description: "Enjoy your favourite playlists at home or on the go.",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=75"
  }
];

const CART_KEY = "shopsphere-cart-v1";

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

const escapeHTML = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

// ------------------------------------
// 2. CART STORAGE
// ------------------------------------

function getCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

    if (!Array.isArray(saved)) return [];

    return saved
      .filter((item) =>
        item &&
        Number.isInteger(item.id) &&
        products.some((product) => product.id === item.id)
      )
      .map((item) => ({
        id: item.id,
        quantity: Math.max(
          1,
          Math.min(99, Math.floor(Number(item.quantity) || 1))
        )
      }));
  } catch (error) {
    console.warn("Could not read saved cart:", error);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
    return true;
  } catch (error) {
    console.error("Could not save cart:", error);
    alert("Your cart could not be saved. Check browser storage settings.");
    return false;
  }
}

function updateCartCount() {
  const count = getCart().reduce(
    (total, item) => total + item.quantity,
    0
  );

  document.querySelectorAll(".cart-count").forEach((element) => {
    element.textContent = count;
  });
}

function addToCart(id, quantity = 1) {
  const product = products.find((item) => item.id === Number(id));

  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  const amount = Math.max(1, Math.min(99, Math.floor(Number(quantity) || 1)));

  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + amount);
  } else {
    cart.push({ id: product.id, quantity: amount });
  }

  if (saveCart(cart)) {
    alert(`${product.name} added to your cart!`);
    renderCart();
  }
}

function changeQuantity(id, quantity) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === Number(id));

  if (!item) return;

  item.quantity = Math.max(
    1,
    Math.min(99, Math.floor(Number(quantity) || 1))
  );

  if (saveCart(cart)) renderCart();
}

function removeFromCart(id) {
  const updated = getCart().filter(
    (item) => item.id !== Number(id)
  );

  if (saveCart(updated)) renderCart();
}

// ------------------------------------
// 3. PRODUCT CATALOG
// ------------------------------------

let selectedCategory = "All";

function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const search = (
    document.getElementById("search-input")?.value || ""
  ).trim().toLowerCase();

  const sort = document.getElementById("sort-select")?.value || "featured";

  let visible = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const matchesSearch =
      `${product.name} ${product.category} ${product.description}`
        .toLowerCase()
        .includes(search);

    return matchesCategory && matchesSearch;
  });

  if (sort === "low") {
    visible.sort((a, b) => a.price - b.price);
  } else if (sort === "high") {
    visible.sort((a, b) => b.price - a.price);
  } else if (sort === "name") {
    visible.sort((a, b) => a.name.localeCompare(b.name));
  }

  document.getElementById("result-count").textContent =
    `${visible.length} product${visible.length === 1 ? "" : "s"}`;

  if (visible.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p class="muted">Try another search or category.</p>
        <button class="btn" data-action="reset">Show all products</button>
      </div>`;
    return;
  }

  grid.innerHTML = visible.map((product) => `
    <article class="product-card">
      <a href="product.html?id=${product.id}" aria-label="View ${escapeHTML(product.name)}">
        <img
          src="${product.image}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
          decoding="async">
      </a>
      <div class="product-info">
        <span class="product-category">${escapeHTML(product.category)}</span>
        <h3>${escapeHTML(product.name)}</h3>
        <p class="description">${escapeHTML(product.description)}</p>
        <div class="price">${money(product.price)}</div>
        <div class="card-actions">
          <a class="btn btn-secondary"
             href="product.html?id=${product.id}">View product</a>
          <button class="btn" data-action="add" data-id="${product.id}">
            Add to cart
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

function setupCatalog() {
  const search = document.getElementById("search-input");
  const sort = document.getElementById("sort-select");
  const categories = document.getElementById("categories");
  const grid = document.getElementById("product-grid");

  search?.addEventListener("input", renderProducts);
  sort?.addEventListener("change", renderProducts);

  categories?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    selectedCategory = button.dataset.category;

    categories.querySelectorAll(".category").forEach((element) => {
      const active = element === button;
      element.classList.toggle("active", active);
      element.setAttribute("aria-pressed", String(active));
    });

    renderProducts();
  });

  grid?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    if (button.dataset.action === "add") {
      addToCart(Number(button.dataset.id));
    }

    if (button.dataset.action === "reset") {
      selectedCategory = "All";
      search.value = "";
      sort.value = "featured";

      categories?.querySelectorAll(".category").forEach((element) => {
        const active = element.dataset.category === "All";
        element.classList.toggle("active", active);
        element.setAttribute("aria-pressed", String(active));
      });

      renderProducts();
    }
  });

  renderProducts();
}

// ------------------------------------
// 4. PRODUCT DETAILS
// ------------------------------------

function renderProductDetail() {
  const container = document.getElementById("product-detail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const product = products.find((item) => item.id === id);

  if (!product) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Product not found</h2>
        <p class="muted">This product may not exist in our catalog.</p>
        <a class="btn" href="index.html#products">Back to catalog</a>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="detail-layout">
      <img class="detail-image"
           src="${product.image}"
           alt="${escapeHTML(product.name)}"
           fetchpriority="high">
      <div class="detail-info">
        <span class="product-category">${escapeHTML(product.category)}</span>
        <h1>${escapeHTML(product.name)}</h1>
        <p class="detail-price">${money(product.price)}</p>
        <p>${escapeHTML(product.description)}</p>
        <p class="muted">Demo product · Price shown in Indian rupees.</p>

        <div class="quantity-control">
          <label for="detail-quantity">Quantity</label>
          <input id="detail-quantity" type="number"
                 min="1" max="99" value="1">
        </div>

        <button class="btn" id="detail-add">Add to cart</button>
        <a class="btn btn-secondary" href="cart.html">View cart</a>
      </div>
    </div>`;

  document.getElementById("detail-add").addEventListener("click", () => {
    const quantity = document.getElementById("detail-quantity").value;

    if (!Number.isInteger(Number(quantity)) ||
        Number(quantity) < 1 ||
        Number(quantity) > 99) {
      alert("Please enter a quantity between 1 and 99.");
      return;
    }

    addToCart(product.id, Number(quantity));
  });
}

// ------------------------------------
// 5. SHOPPING CART PAGE
// ------------------------------------

function renderCart() {
  const container = document.getElementById("cart-content");
  if (!container) return;

  const cart = getCart();
  updateCartCount();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Your cart is empty 🛍️</h2>
        <p class="muted">Explore our catalog to find something you like.</p>
        <a class="btn" href="index.html#products">Browse products</a>
      </div>`;
    return;
  }

  const items = cart.map((entry) => ({
    ...entry,
    product: products.find((product) => product.id === entry.id)
  })).filter((entry) => entry.product);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  container.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">
        ${items.map(({ product, quantity }) => `
          <article class="cart-item">
            <img src="${product.image}"
                 alt="${escapeHTML(product.name)}"
                 loading="lazy">
            <div>
              <h3>${escapeHTML(product.name)}</h3>
              <p>${money(product.price)} each</p>
              <label>
                Qty:
                <input class="cart-quantity"
                       type="number" min="1" max="99"
                       value="${quantity}"
                       data-quantity="${product.id}"
                       aria-label="Quantity for ${escapeHTML(product.name)}">
              </label>
              <br>
              <button class="remove-btn"
                      data-remove="${product.id}">Remove</button>
            </div>
            <strong>${money(product.price * quantity)}</strong>
          </article>
        `).join("")}
      </div>

      <aside class="cart-summary">
        <h2>Order summary</h2>
        <div class="summary-row">
          <span>Items</span>
          <span>${totalQuantity}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div class="summary-row summary-total">
          <span>Total</span>
          <span>${money(total)}</span>
        </div>
        <button class="btn full-width" id="checkout-button">
          Proceed to checkout
        </button>
        <p class="notice">
          Demo only. No payment details are collected and no order is placed.
        </p>
      </aside>
    </div>`;

  container.querySelectorAll("[data-quantity]").forEach((input) => {
    input.addEventListener("change", () => {
      const value = Number(input.value);

      if (!Number.isInteger(value) || value < 1 || value > 99) {
        alert("Choose a quantity between 1 and 99.");
        renderCart();
        return;
      }

      changeQuantity(Number(input.dataset.quantity), value);
    });
  });

  container.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      removeFromCart(Number(button.dataset.remove));
    });
  });

  document.getElementById("checkout-button").addEventListener("click", () => {
    alert(
      "Checkout is a demonstration only. To accept real orders, connect a backend, database and payment provider."
    );
  });
}

// ------------------------------------
// 6. INITIALIZE THE CURRENT PAGE
// ------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  const page = document.body.dataset.page;

  if (page === "home") setupCatalog();
  if (page === "product") renderProductDetail();
  if (page === "cart") renderCart();
});
