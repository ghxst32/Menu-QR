'use strict';

// ─────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────
let menuData      = null;
let cart          = loadCart();   // { [productId]: { ...product, qty } }
let currentCat    = null;
let currentProd   = null;
let detailQty     = 1;
let deliveryMode  = 'pickup';     // 'pickup' | 'delivery'
const DELIVERY_FEE = 1.00;

// ─────────────────────────────────────────
//  PERSIST CART
// ─────────────────────────────────────────
function loadCart() {
  try { return JSON.parse(localStorage.getItem('fc_cart') || '{}'); }
  catch { return {}; }
}
function saveCart() {
  localStorage.setItem('fc_cart', JSON.stringify(cart));
}

// ─────────────────────────────────────────
//  IMAGE / EMOJI HELPER
//  Devuelve HTML listo para insertar dentro
//  de cualquier contenedor cuadrado.
//  Si el producto tiene "img" usa la foto;
//  si no, cae en el emoji del producto o
//  el emoji de la categoría.
// ─────────────────────────────────────────
function thumb(prod, cat, size = 'sm') {
  const fallback = prod.emoji || cat?.emoji || '🍽️';
  if (prod.img) {
    return `<img
      src="${prod.img}"
      alt="${prod.name}"
      class="thumb-img thumb-img--${size}"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
    /><span class="thumb-fallback" style="display:none;">${fallback}</span>`;
  }
  return `<span class="thumb-emoji">${fallback}</span>`;
}

// ─────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────
async function init() {
  const res = await fetch('data/menu.json');
  menuData  = await res.json();
  renderHome();
  refreshAllBadges();
}

// ─────────────────────────────────────────
//  SCREEN TRANSITIONS
// ─────────────────────────────────────────
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
    // Categorías: si tiene img propia úsala, si no el emoji
    const catThumb = cat.img
      ? `<img src="${cat.img}" alt="${cat.name}" class="thumb-img thumb-img--sm"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
         <span class="thumb-fallback" style="display:none;">${cat.emoji}</span>`
      : `<span class="thumb-emoji">${cat.emoji}</span>`;

    el.innerHTML = `
      <div class="cat-icon" style="background:${cat.bg};">${catThumb}</div>
      <div class="cat-info">
        <div class="cat-name">${cat.name}</div>
        <div class="cat-count">${cat.items} artículos</div>
      </div>
      <div class="cat-chevron">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="#A0A0B0" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round"/>
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
      <div class="prod-img" style="background:${cat.bg};">${thumb(prod, cat, 'sm')}</div>
      <div class="prod-info">
        <div class="prod-name">${prod.name}</div>
        <div class="stars">${stars(prod.stars)}</div>
        <div class="prod-weight">${prod.weight}</div>
      </div>
      <div class="prod-right">
        <div class="prod-price">$${prod.price.toFixed(2)}</div>
        <button class="btn-plus" title="Agregar"
          onclick="event.stopPropagation(); quickAdd(${prod.id}, event)">+</button>
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

  // Imagen grande en detalle
  const heroEl  = document.getElementById('detail-hero-img');
  const fallback = prod.emoji || currentCat?.emoji || '🍽️';
  if (prod.img) {
    heroEl.innerHTML = `
      <img src="${prod.img}" alt="${prod.name}" class="thumb-img thumb-img--hero"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <span class="thumb-fallback thumb-fallback--hero" style="display:none;">${fallback}</span>`;
  } else {
    heroEl.innerHTML = `<span class="thumb-emoji thumb-emoji--hero">${fallback}</span>`;
  }

  document.getElementById('detail-name').textContent    = prod.name;
  document.getElementById('detail-stars').innerHTML     = stars(prod.stars);
  document.getElementById('detail-weight').textContent  = prod.weight;
  document.getElementById('detail-price').textContent   = `$${prod.price.toFixed(2)}`;
  document.getElementById('detail-desc').textContent    = prod.description;
  document.getElementById('detail-qty-val').textContent = detailQty;

  // Peek: siguiente producto
  const all  = currentCat.products;
  const idx  = all.findIndex(p => p.id === prod.id);
  const next = all[(idx + 1) % all.length];

  const peekImgEl = document.getElementById('peek-icon');
  const peekFallback = next.emoji || currentCat?.emoji || '🍽️';
  if (next.img) {
    peekImgEl.innerHTML = `
      <img src="${next.img}" alt="${next.name}" class="thumb-img thumb-img--peek"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <span class="thumb-fallback" style="display:none;">${peekFallback}</span>`;
  } else {
    peekImgEl.textContent = peekFallback;
  }

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
  const listEl     = document.getElementById('cart-list');
  const summaryEl  = document.getElementById('summary-box');
  const checkoutEl = document.getElementById('checkout-wrap');
  const customerEl = document.getElementById('customer-box');
  const modeEl     = document.getElementById('mode-box');
  const items      = Object.values(cart);

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
    customerEl.style.display = 'none';
    modeEl.style.display     = 'none';
    return;
  }

  summaryEl.style.display  = 'block';
  checkoutEl.style.display = 'block';
  customerEl.style.display = 'block';
  modeEl.style.display     = 'block';
  listEl.innerHTML = '';

  items.forEach((item, i) => {
    // thumb en carrito: pequeño
    const itemThumb = item.img
      ? `<img src="${item.img}" alt="${item.name}" class="thumb-img thumb-img--sm"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
         <span class="thumb-fallback" style="display:none;">${item.emoji || '🍽️'}</span>`
      : `<span class="thumb-emoji">${item.emoji || '🍽️'}</span>`;

    const el = document.createElement('div');
    el.className = 'cart-card';
    el.style.animationDelay = `${i * 0.06}s`;
    el.innerHTML = `
      <div class="cart-img">${itemThumb}</div>
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
  syncModeUI();
}

function updateSummary() {
  const items    = Object.values(cart);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const fee      = deliveryMode === 'delivery' ? DELIVERY_FEE : 0;
  const total    = subtotal + fee;
  const count    = items.reduce((s, i) => s + i.qty, 0);

  document.getElementById('sum-items')   .textContent = count;
  document.getElementById('sum-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('sum-delivery').textContent = `$${fee.toFixed(2)}`;
  document.getElementById('sum-total')   .textContent = `$${total.toFixed(2)}`;

  const deliveryRow = document.getElementById('sum-row-delivery');
  if (deliveryRow) deliveryRow.classList.toggle('hidden', deliveryMode !== 'delivery');
}

function toggleSummary() {
  const body   = document.getElementById('summary-body');
  const chev   = document.querySelector('.summary-chevron');
  const isOpen = body.classList.toggle('open');
  chev.classList.toggle('open', isOpen);
}

// ─────────────────────────────────────────
//  DELIVERY MODE
// ─────────────────────────────────────────
function setMode(mode) {
  deliveryMode = mode;
  syncModeUI();
  updateSummary();
}

function syncModeUI() {
  const pickup   = document.getElementById('btn-pickup');
  const delivery = document.getElementById('btn-delivery');
  if (!pickup || !delivery) return;
  pickup.classList.toggle('selected',   deliveryMode === 'pickup');
  delivery.classList.toggle('selected', deliveryMode === 'delivery');
}

// ─────────────────────────────────────────
//  WHATSAPP CHECKOUT
// ─────────────────────────────────────────
function checkout() {
  const items = Object.values(cart);
  if (!items.length) return;

  const customerName = document.getElementById('customer-name')?.value.trim();
  if (!customerName) {
    document.getElementById('customer-name')?.focus();
    toast('⚠️ Por favor escribe tu nombre');
    return;
  }

  const lines    = items.map(i => `  • ${i.qty}x ${i.name}`).join('\n');
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const fee      = deliveryMode === 'delivery' ? DELIVERY_FEE : 0;
  const total    = (subtotal + fee).toFixed(2);

  const modeLabel = deliveryMode === 'delivery'
    ? 'Servicio a domicilio'
    : 'Pedir y recoger en local';

  const feeLine = deliveryMode === 'delivery'
    ? `Envío: $${fee.toFixed(2)}\n`
    : '';

  const msg =
`Hola! Quiero hacer un pedido.

*Nombre:* ${customerName}
*Tipo:* ${modeLabel}

*Pedido:*
${lines}

Subtotal: $${subtotal.toFixed(2)}
${feeLine}*Total: $${total}*

¡Gracias! `;

  const phone   = menuData.whatsapp;
  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');

  cart = {};
  saveCart();
  refreshAllBadges();
  if (document.getElementById('customer-name'))
    document.getElementById('customer-name').value = '';
  deliveryMode = 'pickup';
  setTimeout(() => renderCart(), 400);
  toast('✅ Pedido enviado por WhatsApp');
}

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────
function stars(filled, plain = false) {
  if (plain) return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  let h = '';
  for (let i = 1; i <= 5; i++)
    h += `<span class="star" style="color:${i <= filled ? '#FFBA08' : '#E0E0E8'};">★</span>`;
  return h;
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
  const s = document.createElement('div');
  s.className   = 'sticker';
  s.textContent = '+1';
  s.style.left  = event.clientX + 'px';
  s.style.top   = event.clientY + 'px';
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 700);
}

// ─────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  init();

  document.getElementById('btn-back-menu')  .addEventListener('click', () => showScreen('screen-home', true));
  document.getElementById('btn-back-detail').addEventListener('click', () => showScreen('screen-menu', true));
  document.getElementById('btn-back-cart')  .addEventListener('click', () => showScreen('screen-home', true));

  document.querySelectorAll('.open-cart-btn').forEach(b => b.addEventListener('click', openCart));

  document.getElementById('btn-qty-minus').addEventListener('click', () => changeDetailQty(-1));
  document.getElementById('btn-qty-plus') .addEventListener('click', () => changeDetailQty(1));
  document.getElementById('btn-add-cart') .addEventListener('click', addDetailToCart);

  document.querySelector('.summary-toggle').addEventListener('click', toggleSummary);
  document.getElementById('btn-checkout')  .addEventListener('click', checkout);

  document.getElementById('nav-home').addEventListener('click', () => showScreen('screen-home', true));
  document.getElementById('nav-cart').addEventListener('click', openCart);
});
