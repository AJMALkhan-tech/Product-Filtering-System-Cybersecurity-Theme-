let PRODUCTS_DATA = [];
const state = { search: '', category: 'all', sort: 'default' };

const searchInput    = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortOrder      = document.getElementById('sortOrder');
const productGrid    = document.getElementById('productGrid');
const resultsCount   = document.getElementById('resultsCount');
const emptyState     = document.getElementById('emptyState');
const clearBtn       = document.getElementById('clearBtn');

function filterBySearch(products, term) {
  if (!term.trim()) return products;
  const q = term.toLowerCase().replace(/['"]/g, '');
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
}

function filterByCategory(products, cat) {
  return cat === 'all' ? products : products.filter(p => p.category === cat);
}

function sortByPrice(products, order) {
  if (order === 'default') return products;
  return [...products].sort((a, b) => order === 'asc' ? a.price - b.price : b.price - a.price);
}

function applyFilters(products, { search, category, sort }) {
  return sortByPrice(filterByCategory(filterBySearch(products, search), category), sort);
}

function getCategories(products) {
  return [...new Set(products.map(p => p.category))].sort();
}

// this is ui interface 

function buildStars(rating) {
  const full = Math.round(rating);
  return '█'.repeat(full) + '░'.repeat(5 - full);
}

function formatPrice(price) {
  if (price === 0) return '<span class="card-price free">FREE / OSS</span>';
  return `<span class="card-price">$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>`;
}

function createCard(product) {
  const el = document.createElement('article');
  el.className = 'card';
  el.setAttribute('role', 'listitem');

  el.innerHTML = `
    <div class="card-header">
      <div class="card-icon-wrap">${product.icon}</div>
      <div class="card-meta">
        <div class="card-name">${product.name}</div>
        <span class="card-cat">${product.category}</span>
      </div>
    </div>
    <div class="card-body">
      <div class="card-desc"># ${product.description}</div>
    </div>
    <div class="card-footer">
      <div class="card-rating">
        <span>${buildStars(product.rating)}</span>
        <span class="val">${product.rating.toFixed(1)}</span>
      </div>
      <div class="card-price-wrap">
        ${formatPrice(product.price)}
        <button class="card-btn" data-id="${product.id}" aria-label="Add ${product.name}">
          <span>./add</span> <span class="arrow">▶</span>
        </button>
      </div>
    </div>
  `;

  el.querySelector('.card-btn').addEventListener('click', e => {
    e.stopPropagation();
    const btn = e.currentTarget;
    btn.innerHTML = '<span>✓ ADDED</span>';
    btn.classList.add('added');
    setTimeout(() => {
      btn.innerHTML = '<span>./add</span> <span class="arrow">▶</span>';
      btn.classList.remove('added');
    }, 1800);
  });

  return el;
}

function renderProducts(products) {
  const isEmpty = products.length === 0;
  emptyState.classList.toggle('visible', isEmpty);
  productGrid.style.display = isEmpty ? 'none' : '';

  resultsCount.innerHTML = isEmpty
    ? `<span class="label">OUTPUT:</span> <span class="num" style="color:var(--red)">0</span> results — no match`
    : `<span class="label">OUTPUT:</span> <span class="num">${products.length}</span> module${products.length !== 1 ? 's' : ''} found`;

  if (isEmpty) { productGrid.innerHTML = ''; return; }

  const frag = document.createDocumentFragment();
  products.forEach(p => frag.appendChild(createCard(p)));
  productGrid.innerHTML = '';
  productGrid.appendChild(frag);
}

function populateCategories() {
  const frag = document.createDocumentFragment();
  getCategories(PRODUCTS_DATA).forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat.toLowerCase();
    frag.appendChild(opt);
  });
  categoryFilter.appendChild(frag);
}

function update() {
  renderProducts(applyFilters(PRODUCTS_DATA, state));
}

// this section belong to sidebar
window.filterCat = function(cat) {
  state.category = cat;
  categoryFilter.value = cat;
  update();
  document.querySelectorAll('.sidebar .tree-item').forEach(el => el.classList.remove('active'));
};

// this section is for clock
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toTimeString().slice(0, 8);
}
setInterval(updateClock, 1000);
updateClock();

// this is kindaa fake cpu thing
function fakeMetrics() {
  const cpu = (35 + Math.random() * 40).toFixed(1);
  const mem = (3.2 + Math.random() * 1.2).toFixed(1);
  const cpuEl = document.getElementById('cpu');
  const memEl = document.getElementById('mem');
  if (cpuEl) {
    cpuEl.textContent = cpu + '%';
    cpuEl.className = 'val ' + (parseFloat(cpu) > 60 ? 'danger' : 'warn');
  }
  if (memEl) memEl.textContent = mem + 'GB';
}
setInterval(fakeMetrics, 2000);
fakeMetrics();

// ── this listen events for search, category, and sort changes 
function debounce(fn, ms = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

searchInput.addEventListener('input', debounce(e => { state.search = e.target.value; update(); }));
categoryFilter.addEventListener('change', e => { state.category = e.target.value; update(); });
sortOrder.addEventListener('change', e => { state.sort = e.target.value; update(); });

clearBtn.addEventListener('click', () => {
  state.search = ''; state.category = 'all'; state.sort = 'default';
  searchInput.value = ''; categoryFilter.value = 'all'; sortOrder.value = 'default';
  update();
});
async function init() {
  const res = await fetch('products.json');
  PRODUCTS_DATA = await res.json();
  populateCategories();
  update();
}
init();
