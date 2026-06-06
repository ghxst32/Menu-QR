'use strict';

// ─────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────
let menuData      = null;
let cart          = loadCart();   // { [productId]: { ...product, qty } }
let currentCat    = null;
let currentProd   = null;
let detailQty     = 1;

// ─────────────────────────────────────────
//  PERSIST CART
// ─────────────────────────────────────────
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('fc_cart') || '{}');
  } catch { return {}; }
}
function saveCart() {
  localStorage.setItem('fc_cart', JSON.stringify(cart));
}

// ─────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────
async function init() {
  const res  = await fetch('data/menu.json');
  menuData   = await res.json();
  renderHome();
  refreshAllBadges();
}

// ─────────────────────────────────────────
//  SCREEN TRANSITIONS
// ─────────────────────────────────────────
const screens = ['screen-home', 'screen-menu', 'screen-detail', 'screen-cart'];

function showScreen(id, back = false) {
  const current = document.querySelector('.screen.active');
  if (current) {
    current.classList.remove('active');
    current.classList.add('exit-left');
    setTimeout(() => current.classList.remove('exit-left'), 400);
  }
  const next = document.getElementById(id);
  next.classList.remove('exit-left', 'slide-back');
  if (back) {
    next.classList.add('slide-back');
    setTimeout(() => next.classList.remove('slide-back'), 400);
  }
  next.classList.add('active');
  updateNav(id);
}

function updateNav(screenId) {
  const map = {
    'screen-home'  : 'nav-home',
    'screen-menu'  : 'nav-home',
    'screen-detail': 'nav-home',
    'screen-cart'  : 'nav-cart',
  };
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const btn = document.getElementById(map[screenId]);
  if (btn) btn.classList.add('active');
}

// ─────────────────────────────────────────
//  HOME
// ─────────────────────────────────────────
function renderHome() {
  const list = document.getElementById('cats-list');
  list.innerHTML = '';
  menuData.categories.forEach(cat => {
    const el = document.createElement('div');
    el.className = 'cat-card';
    el.innerHTML = `
      <div class="cat-icon" style="background:${cat.bg};">${cat.emoji}</div>
      <div class="cat-info">
        <div class="cat-name">${cat.name}</div>
        <div class="cat-count">${cat.items} artículos</div>
      </div>
      <div class="cat-chevron">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="#A0A0B0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`;
    el.addEventListener('click', () => openMenu(cat));
    list.appendChild(el);
  });
}

// ─────────────────────────────────────────
//  MENU
// ─────────────────────────────────────────
function openMenu(cat) {
  currentCat = cat;
  document.getElementById('menu-topbar-title').textContent = cat.name;
  renderProducts(cat);
  showScreen('screen-menu');
}

function renderProducts(cat) {
  const list = document.getElementById('products-list');
  list.innerHTML = '';
  cat.products.forEach(prod => {
    const el = document.createElement('div');
    el.className = 'prod-card';
    el.innerHTML = `
      <div class="prod-img" style="background:${cat.bg};">${prod.emoji}</div>
      <div class="prod-info">
        <div class="prod-name">${prod.name}</div>
        <div class="stars">${stars(prod.stars)}</div>
        <div class="prod-weight">${prod.weight}</div>
      </div>
      <div class="prod-right">
        <div class="prod-price">$${prod.price.toFixed(2)}</div>
        <button class="btn-plus" title="Agregar" onclick="event.stopPropagation(); quickAdd(${prod.id}, event)">+</button>
      </div>`;
    el.addEventListener('click', () => openDetail(prod));
    list.appendChild(el);
  });
}

// ─────────────────────────────────────────
//  DETAIL
// ─────────────────────────────────────────
function openDetail(prod) {
  currentProd = prod;
  detailQty   = 1;
  document.getElementById('detail-emoji').textContent = prod.emoji;
  document.getElementById('detail-name').textContent  = prod.name;
  document.getElementById('detail-stars').innerHTML   = stars(prod.stars);
  document.getElementById('detail-weight').textContent= prod.weight;
  document.getElementById('detail-price').textContent = `$${prod.price.toFixed(2)}`;
  document.getElementById('detail-desc').textContent  = prod.description;
  document.getElementById('detail-qty-val').textContent = detailQty;

  // peek next
  const all  = currentCat.products;
  const idx  = all.findIndex(p => p.id === prod.id);
  const next = all[(idx + 1) % all.length];
  document.getElementById('peek-icon').textContent = next.emoji;
  document.getElementById('peek-name').textContent = next.name;
  document.getElementById('peek-sub').textContent  = `$${next.price.toFixed(2)} · ${stars(next.stars, true)}`;
  document.getElementById('peek-strip').onclick    = () => openDetail(next);

  showScreen('screen-detail');
}

function changeDetailQty(delta) {
  detailQty = Math.max(1, detailQty + delta);
  document.getElementById('detail-qty-val').textContent = detailQty;
}

function addDetailToCart() {
  if (!currentProd) return;
  addToCart(currentProd.id, detailQty, currentProd);
  showScreen('screen-menu', true);
}

// ─────────────────────────────────────────
//  CART HELPERS
// ─────────────────────────────────────────
function findProduct(id) {
  for (const cat of menuData.categories) {
    const p = cat.products.find(p => p.id === id);
    if (p) return { prod: p, cat };
  }
  return null;
}

function addToCart(id, qty = 1, prodData = null) {
  const found = prodData || (findProduct(id)?.prod);
  if (!found) return;
  if (cart[id]) {
    cart[id].qty += qty;
  } else {
    cart[id] = { ...found, qty };
  }
  saveCart();
  refreshAllBadges();
  toast(`🛒 ${found.name} agregado`);
}

function quickAdd(id, event) {
  addToCart(id, 1);
  spawnSticker(event);
}

function changeCartQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  saveCart();
  refreshAllBadges();
  renderCart();
}

// ─────────────────────────────────────────
//  BADGES
// ─────────────────────────────────────────
function refreshAllBadges() {
  const total = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge, .nav-badge').forEach(b => {
    b.textContent = total;
    b.classList.toggle('visible', total > 0);
  });
}

// ─────────────────────────────────────────
//  CART SCREEN
// ─────────────────────────────────────────
function openCart() {
  renderCart();
  showScreen('screen-cart');
}

function renderCart() {
  const listEl    = document.getElementById('cart-list');
  const summaryEl = document.getElementById('summary-box');
  const checkoutEl= document.getElementById('checkout-wrap');
  const items     = Object.values(cart);

  if (!items.length) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <div class="empty-title">Tu carrito está vacío</div>
        <div class="empty-sub">Explora nuestro menú y agrega<br>lo que más te antoje.</div>
        <button class="btn-empty-shop" id="btn-go-shop">Ver menú</button>
      </div>`;
    document.getElementById('btn-go-shop')?.addEventListener('click', () => showScreen('screen-home', true));
    summaryEl.style.display  = 'none';
    checkoutEl.style.display = 'none';
    return;
  }

  summaryEl.style.display  = 'block';
  checkoutEl.style.display = 'block';
  listEl.innerHTML = '';

  items.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'cart-card';
    el.style.animationDelay = `${i * 0.06}s`;
    el.innerHTML = `
      <div class="cart-img">${item.emoji}</div>
      <div class="cart-info">
        <div class="cart-name">${item.name}</div>
        <div class="cart-weight">${item.weight}</div>
      </div>
      <div class="cart-right">
        <div class="cart-price">$${(item.price * item.qty).toFixed(2)}</div>
        <div class="qty-mini">
          <button class="qty-mini-btn minus" onclick="changeCartQty(${item.id}, -1)">−</button>
          <span class="qty-mini-val">${item.qty}</span>
          <button class="qty-mini-btn plus"  onclick="changeCartQty(${item.id},  1)">+</button>
        </div>
      </div>`;
    listEl.appendChild(el);
  });

  updateSummary();
}

function updateSummary() {
  const items    = Object.values(cart);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax      = 1.00;
  const total    = subtotal + tax;
  const count    = items.reduce((s, i) => s + i.qty, 0);
  document.getElementById('sum-items')   .textContent = count;
  document.getElementById('sum-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('sum-tax')     .textContent = `$${tax.toFixed(2)}`;
  document.getElementById('sum-total')   .textContent = `$${total.toFixed(2)}`;
}

function toggleSummary() {
  const body   = document.getElementById('summary-body');
  const chev   = document.querySelector('.summary-chevron');
  const isOpen = body.classList.toggle('open');
  chev.classList.toggle('open', isOpen);
}

// ─────────────────────────────────────────
//  WHATSAPP CHECKOUT
// ─────────────────────────────────────────
function checkout() {
  const items = Object.values(cart);
  if (!items.length) return;

  const lines    = items.map(i => `  • ${i.qty}x ${i.name}`).join('\n');
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = (subtotal + 1).toFixed(2);

  const msg = `Hola!  Quiero hacer un pedido:\n\n*Pedido:*\n${lines}\n\n Total: $${total}\n\n¡Gracias! `;

  const phone   = menuData.whatsapp;
  const encoded = encodeURIComponent(msg);
  const url     = `https://wa.me/${phone}?text=${encoded}`;

  window.open(url, '_blank');

  // clear cart after sending
  cart = {};
  saveCart();
  refreshAllBadges();
  setTimeout(() => renderCart(), 400);
  toast('✅ Pedido enviado por WhatsApp');
}

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────
function stars(filled, plain = false) {
  let h = '';
  for (let i = 1; i <= 5; i++) {
    h += `<span class="star" style="color:${i <= filled ? '#FFBA08' : '#E0E0E8'};">★</span>`;
  }
  return plain ? ('★'.repeat(filled) + '☆'.repeat(5 - filled)) : h;
}

let _toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

function spawnSticker(event) {
  const s    = document.createElement('div');
  s.className = 'sticker';
  s.textContent = '+1';
  s.style.left = event.clientX + 'px';
  s.style.top  = event.clientY + 'px';
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 700);
}

// ─────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  init();

  // ── Back buttons ──
  document.getElementById('btn-back-menu')  .addEventListener('click', () => showScreen('screen-home', true));
  document.getElementById('btn-back-detail').addEventListener('click', () => showScreen('screen-menu', true));
  document.getElementById('btn-back-cart')  .addEventListener('click', () => showScreen('screen-home', true));

  // ── Cart icon buttons ──
  document.querySelectorAll('.open-cart-btn').forEach(b => b.addEventListener('click', openCart));

  // ── Detail qty ──
  document.getElementById('btn-qty-minus').addEventListener('click', () => changeDetailQty(-1));
  document.getElementById('btn-qty-plus') .addEventListener('click', () => changeDetailQty(1));
  document.getElementById('btn-add-cart') .addEventListener('click', addDetailToCart);

  // ── Summary toggle ──
  const summaryToggle = document.querySelector('.summary-toggle');

if (summaryToggle) {
    summaryToggle.addEventListener('click', toggleSummary);
}
  // ── Checkout ──
  document.getElementById('btn-checkout').addEventListener('click', checkout);

  // ── Bottom nav ──
  document.getElementById('nav-home').addEventListener('click', () => showScreen('screen-home', true));
  document.getElementById('nav-cart').addEventListener('click', openCart);
});
