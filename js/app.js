// ===== STATE =====
let menuData = null;
let cart = {};
let currentCategory = null;
let currentProduct = null;

// ===== INIT =====
async function init() {
  const res = await fetch('data/menu.json');
  menuData = await res.json();
  renderHome();
  updateCartBadge();
}

// ===== SCREEN NAVIGATION =====
function showScreen(id, back = false) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active', 'slide-back');
    s.style.display = 'none';
  });
  const target = document.getElementById(id);
  target.style.display = 'flex';
  void target.offsetWidth;
  if (back) target.classList.add('slide-back');
  target.classList.add('active');
  updateNavBar(id);
}

function updateNavBar(screenId) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const map = {
    'screen-home': 'nav-home',
    'screen-menu': 'nav-home',
    'screen-detail': 'nav-home',
    'screen-cart': 'nav-cart'
  };
  const btn = document.getElementById(map[screenId]);
  if (btn) btn.classList.add('active');
}

// ===== HOME SCREEN =====
function renderHome() {
  const list = document.getElementById('categories-list');
  list.innerHTML = '';
  menuData.categories.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div class="cat-emoji-wrap" style="background: ${cat.color}18;">
        <span>${cat.emoji}</span>
      </div>
      <div class="cat-info">
        <div class="cat-name">${cat.name}</div>
        <div class="cat-count">${cat.items} items</div>
      </div>
      <div class="cat-arrow">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="#9898A8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    `;
    card.addEventListener('click', () => openMenu(cat));
    list.appendChild(card);
  });
}

// ===== MENU SCREEN =====
function openMenu(cat) {
  currentCategory = cat;
  document.getElementById('menu-title').textContent = cat.name + ' menu';
  renderProducts(cat);
  showScreen('screen-menu');
}

function renderProducts(cat) {
  const list = document.getElementById('products-list');
  list.innerHTML = '';
  cat.products.forEach(prod => {
    const stars = renderStars(prod.stars, prod.rating);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img-wrap">${prod.emoji || cat.emoji}</div>
      <div class="product-info">
        <div class="product-name">${prod.name}</div>
        <div class="stars">${stars}</div>
        <div class="product-weight">${prod.weight}</div>
      </div>
      <div class="product-right">
        <div class="product-price">${prod.price.toFixed(2)} <sup>$</sup></div>
        <button class="btn-add" title="Add to cart" onclick="event.stopPropagation(); addToCart(${prod.id})">+</button>
      </div>
    `;
    card.addEventListener('click', () => openDetail(prod, cat));
    list.appendChild(card);
  });
}

// ===== DETAIL SCREEN =====
function openDetail(prod, cat) {
  currentProduct = prod;
  const emoji = prod.emoji || cat.emoji;
  const stars = renderStars(prod.stars, prod.rating);

  document.getElementById('detail-img').textContent = emoji;
  document.getElementById('detail-name').textContent = prod.name;
  document.getElementById('detail-stars').innerHTML = stars;
  document.getElementById('detail-weight').textContent = prod.weight;
  document.getElementById('detail-price').textContent = `${prod.price.toFixed(2)} $`;
  document.getElementById('detail-desc').textContent = prod.description;

  // Peek next product
  const currentIdx = cat.products.findIndex(p => p.id === prod.id);
  const nextProd = cat.products[(currentIdx + 1) % cat.products.length];
  const peekWrap = document.getElementById('peek-next');
  if (nextProd) {
    document.getElementById('peek-img').textContent = nextProd.emoji || cat.emoji;
    document.getElementById('peek-name').textContent = nextProd.name;
    document.getElementById('peek-rating').innerHTML = renderStars(nextProd.stars, nextProd.rating, true);
    peekWrap.onclick = () => openDetail(nextProd, cat);
    peekWrap.style.display = 'flex';
  }
  showScreen('screen-detail');
}

// ===== CART =====
function addToCart(productId) {
  // Find product across all categories
  let prod = null, cat = null;
  for (const c of menuData.categories) {
    const found = c.products.find(p => p.id === productId);
    if (found) { prod = found; cat = c; break; }
  }
  if (!prod) return;

  if (cart[productId]) {
    cart[productId].qty++;
  } else {
    cart[productId] = { ...prod, emoji: prod.emoji || cat.emoji, qty: 1 };
  }
  updateCartBadge();
  showToast(`${prod.name} added to cart! 🛒`);
  animateAddBtn();
}

function updateCartBadge() {
  const total = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = total;
    b.style.display = total > 0 ? 'flex' : 'none';
  });
}

function animateAddBtn() {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.style.animation = 'none';
    void badge.offsetWidth;
    badge.style.animation = 'popBadge 0.4s cubic-bezier(0.4,0,0.2,1)';
  }
}

// ===== CART SCREEN =====
function openCart() {
  renderCart();
  showScreen('screen-cart');
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const summaryWrap = document.getElementById('cart-summary-wrap');
  const items = Object.values(cart);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <div class="empty-cart-text">Your cart is empty.<br>Add some delicious items!</div>
      </div>
    `;
    summaryWrap.style.display = 'none';
    return;
  }

  summaryWrap.style.display = 'block';
  container.innerHTML = '';

  items.forEach((item, i) => {
    const stars = renderStars(item.stars, item.rating);
    const card = document.createElement('div');
    card.className = 'cart-card';
    card.style.animationDelay = `${i * 0.07}s`;
    card.innerHTML = `
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-stars">${stars}</div>
        <div class="cart-item-weight">${item.weight}</div>
      </div>
      <div class="cart-item-right">
        <div class="cart-item-qty">${item.qty}</div>
        <div class="cart-item-price">${(item.price * item.qty).toFixed(2)} <sup>$</sup></div>
        <button class="cart-item-btn-add" onclick="addToCart(${item.id})">+</button>
      </div>
    `;
    container.appendChild(card);
  });

  updateSummary();
}

function updateSummary() {
  const items = Object.values(cart);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = 1.00;
  const total = subtotal + tax;
  const count = items.reduce((s, i) => s + i.qty, 0);

  document.getElementById('summary-items').textContent = count;
  document.getElementById('summary-subtotal').textContent = `${subtotal.toFixed(2)} $`;
  document.getElementById('summary-tax').textContent = `${tax.toFixed(2)} $`;
  document.getElementById('summary-total').textContent = `${total.toFixed(2)} $`;
}

function toggleSummary() {
  const body = document.getElementById('summary-body');
  const arrow = document.querySelector('.summary-arrow');
  body.classList.toggle('open');
  arrow.classList.toggle('open');
}

function checkout() {
  cart = {};
  updateCartBadge();
  showToast('🎉 Order placed successfully!');
  setTimeout(() => {
    renderCart();
  }, 600);
}

// ===== HELPERS =====
function renderStars(filled, rating, small = false) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star" style="color:${i <= filled ? '#FFC107' : '#e0e0e0'};">${small ? '★' : '★'}</span>`;
  }
  return html;
}

let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ===== GLOBAL EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  init();

  // Cart icon (home)
  document.getElementById('cart-icon-home').addEventListener('click', openCart);

  // Back from menu
  document.getElementById('btn-back-menu').addEventListener('click', () => {
    showScreen('screen-home', true);
  });

  // Cart icon from menu
  document.getElementById('cart-icon-menu').addEventListener('click', openCart);

  // Back from detail
  document.getElementById('btn-back-detail').addEventListener('click', () => {
    showScreen('screen-menu', true);
  });

  // Cart icon from detail
  document.getElementById('cart-icon-detail').addEventListener('click', openCart);

  // Add to cart from detail
  document.getElementById('btn-add-detail').addEventListener('click', () => {
    if (currentProduct) addToCart(currentProduct.id);
  });

  // Back from cart
  document.getElementById('btn-back-cart').addEventListener('click', () => {
    showScreen('screen-home', true);
  });

  // Summary toggle
  document.querySelector('.cart-summary-toggle').addEventListener('click', toggleSummary);

  // Checkout
  document.getElementById('btn-checkout').addEventListener('click', checkout);

  // Bottom nav
  document.getElementById('nav-home').addEventListener('click', () => showScreen('screen-home', true));
  document.getElementById('nav-cart').addEventListener('click', openCart);
});
