// =============================================================================
// AMAVI — Catálogo (versão 100% HTML + CSS + JavaScript, sem build/servidor)
// Replica a funcionalidade do protótipo React original:
//   catálogo, detalhe de produto, carrinho com checkout via WhatsApp,
//   login/cadastro e painel administrativo — tudo salvo no localStorage.
// =============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // Configuração da loja
  // ---------------------------------------------------------------------
   const STORE_CONFIG = {
    name: 'AMAVI',
    tagline: 'Coisas boas acontecem quando você coloca um look novo',
    whatsappNumber: '5511999999999',
    instagramHandle: 'amavi.moda',
    instagramUrl: 'https://instagram.com/amavi.moda',
    freeShippingThreshold: 300,
  };

  const CATEGORIES = ['Blusas', 'Vestidos', 'Calças', 'Saias', 'Conjuntos', 'Acessórios'];
  const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

  const FASHION_ICON_SVG = `<svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="130" cy="130" r="118" fill="#ECE9E8"/>
    <path d="M130 55c0-12 9-21 21-21 10 0 18 7 20 16 2 10-4 19-13 23l-20 9c-5 2-8 7-8 12" stroke="#8E8A89" stroke-width="9" stroke-linecap="round"/>
    <path d="M130 93L64 150c-7 6-3 18 6 18h120c9 0 13-12 6-18l-66-57Z" stroke="#6F6B6A" stroke-width="9" stroke-linejoin="round"/>
    <path d="M92 168c8 22 20 39 38 52 18-13 30-30 38-52" stroke="#AAA6A5" stroke-width="8" stroke-linecap="round"/>
    <path d="M107 123c9 7 37 7 46 0" stroke="#B9B5B4" stroke-width="7" stroke-linecap="round"/>
  </svg>`;
  const FASHION_ICON_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(FASHION_ICON_SVG)}`;

  // ---------------------------------------------------------------------
  // Armazenadores locais
  // ---------------------------------------------------------------------
  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.error(`Falha ao ler "${key}" do armazenamento local`, err);
      return fallback;
    }
  }
  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Falha ao gravar "${key}" no armazenamento local`, err);
    }
  }

  // ---------------------------------------------------------------------
  // Produtos de demonstração
  // ---------------------------------------------------------------------
  function placeholder(label, bg, fg = '3A3532') {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
        <rect width="600" height="750" fill="#${bg}" />
        <text x="300" y="375" font-family="Georgia, serif" font-size="30" fill="#${fg}"
          text-anchor="middle" dominant-baseline="middle">${label}</text>
      </svg>
    `.trim();
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  const SEED_PRODUCTS = [
    {
      id: 'p-001',
      name: 'Blusa Cetim Manga Longa',
      description: 'Blusa de cetim com caimento fluido e manga longa. Peça versátil, do trabalho ao happy hour, pensada para valorizar diferentes tipos de corpo.',
      category: 'Blusas',
      price: 189.9,
      stock: 14,
      sizes: ['P', 'M', 'G', 'GG'],
      colors: ['Preto', 'Off White'],
      isNew: true,
      images: [placeholder('Blusa Cetim', 'F7D9D4'), placeholder('Blusa Cetim 2', 'E4DDD9')],
    },
    {
      id: 'p-002',
      name: 'Vestido Midi Floral',
      description: 'Vestido midi em viscose leve, estampa floral exclusiva Amavi. Alças reguláveis e forro interno.',
      category: 'Vestidos',
      price: 259.0,
      stock: 8,
      sizes: ['PP', 'P', 'M', 'G'],
      colors: ['Rosa', 'Azul'],
      isNew: true,
      images: [placeholder('Vestido Floral', 'F1C4BD')],
    },
    {
      id: 'p-003',
      name: 'Calça Alfaiataria Wide Leg',
      description: 'Calça de alfaiataria com modelagem wide leg, cintura alta e elastano para maior conforto no dia a dia.',
      category: 'Calças',
      price: 219.9,
      stock: 20,
      sizes: ['P', 'M', 'G', 'GG', 'XG'],
      colors: ['Bege', 'Preto'],
      isNew: false,
      images: [placeholder('Calça Wide Leg', 'D6CDC8')],
    },
    {
      id: 'p-004',
      name: 'Saia Midi Plissada',
      description: 'Saia midi plissada em tecido leve, ótima para compor looks casuais ou mais elegantes.',
      category: 'Saias',
      price: 159.9,
      stock: 11,
      sizes: ['PP', 'P', 'M', 'G'],
      colors: ['Verde', 'Terracota'],
      isNew: false,
      images: [placeholder('Saia Plissada', 'F7D9D4')],
    },
    {
      id: 'p-005',
      name: 'Conjunto Blazer + Short Alfaiataria',
      description: 'Conjunto de blazer estruturado e short de alfaiataria, ideal para eventos e reuniões de trabalho.',
      category: 'Conjuntos',
      price: 349.9,
      stock: 6,
      sizes: ['P', 'M', 'G'],
      colors: ['Preto'],
      isNew: true,
      images: [placeholder('Conjunto Alfaiataria', 'E4DDD9')],
    },
    {
      id: 'p-006',
      name: 'Cinto de Couro Ecológico',
      description: 'Cinto em couro ecológico com fivela dourada, acabamento premium.',
      category: 'Acessórios',
      price: 79.9,
      stock: 25,
      sizes: ['Único'],
      colors: ['Caramelo', 'Preto'],
      isNew: false,
      images: [placeholder('Cinto Couro', 'C2B7B1')],
    },
  ];

  // ---------------------------------------------------------------------
  // Camada de dados: produtos
  // ---------------------------------------------------------------------
  const PRODUCTS_KEY = 'amavi:products';

  const ProductsDB = {
    list() {
      return readStorage(PRODUCTS_KEY, SEED_PRODUCTS);
    },
    get(id) {
      return this.list().find((p) => p.id === id) || null;
    },
    create(data) {
      const products = this.list();
      const newProduct = { id: 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), isNew: true, ...data };
      products.unshift(newProduct);
      writeStorage(PRODUCTS_KEY, products);
      return newProduct;
    },
    update(id, data) {
      const products = this.list();
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Produto não encontrado');
      products[index] = { ...products[index], ...data, id };
      writeStorage(PRODUCTS_KEY, products);
      return products[index];
    },
    remove(id) {
      const products = this.list().filter((p) => p.id !== id);
      writeStorage(PRODUCTS_KEY, products);
    },
  };

  // ---------------------------------------------------------------------
  // Camada de dados: autenticação
  // ---------------------------------------------------------------------
  const SESSION_KEY = 'amavi:session';
  const USERS_KEY = 'amavi:users';
  const DEFAULT_ADMIN = {
    id: 'admin-default',
    name: 'Equipe Amavi',
    email: 'admin@amavi.com.br',
    password: 'amavi123',
    role: 'admin',
  };

  const AuthDB = {
    getUsers() {
      const stored = readStorage(USERS_KEY, []);
      const hasDefaultAdmin = stored.some((u) => u.email === DEFAULT_ADMIN.email);
      return hasDefaultAdmin ? stored : [DEFAULT_ADMIN, ...stored];
    },
    register({ name, email, password, role }) {
      const normalizedEmail = email.trim().toLowerCase();
      const users = this.getUsers();
      if (users.some((u) => u.email === normalizedEmail)) {
        throw new Error('Já existe uma conta cadastrada com este e-mail.');
      }
      const newUser = {
        id: 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: role === 'admin' ? 'admin' : 'user',
        createdAt: Date.now(),
      };
      const persistedUsers = users.filter((u) => u.id !== DEFAULT_ADMIN.id);
      writeStorage(USERS_KEY, [...persistedUsers, newUser]);
      return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    },
    login(email, password) {
      const normalizedEmail = email.trim().toLowerCase();
      const user = this.getUsers().find((u) => u.email === normalizedEmail && u.password === password);
      if (!user) throw new Error('E-mail ou senha inválidos.');
      const session = { id: user.id, email: user.email, name: user.name, role: user.role, loggedAt: Date.now() };
      writeStorage(SESSION_KEY, session);
      return session;
    },
    logout() {
      localStorage.removeItem(SESSION_KEY);
    },
    getSession() {
      return readStorage(SESSION_KEY, null);
    },
  };

  // ---------------------------------------------------------------------
  // Camada de dados: carrinho
  // ---------------------------------------------------------------------
  const CART_KEY = 'amavi:cart';

  function lineId(productId, size, color) {
    return `${productId}__${size}__${color}`;
  }

  const CartDB = {
    getItems() {
      return readStorage(CART_KEY, []);
    },
    saveItems(items) {
      writeStorage(CART_KEY, items);
    },
    addItem(product, { size, color, qty = 1 }) {
      const items = this.getItems();
      const id = lineId(product.id, size, color);
      const existing = items.find((item) => item.lineId === id);
      let next;
      if (existing) {
        next = items.map((item) => (item.lineId === id ? { ...item, qty: item.qty + qty } : item));
      } else {
        next = [
          ...items,
          {
            lineId: id,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images && product.images[0],
            size,
            color,
            qty,
          },
        ];
      }
      this.saveItems(next);
    },
    removeItem(lineIdToRemove) {
      this.saveItems(this.getItems().filter((item) => item.lineId !== lineIdToRemove));
    },
    updateQty(lineIdToUpdate, qty) {
      if (qty < 1) return this.removeItem(lineIdToUpdate);
      this.saveItems(this.getItems().map((item) => (item.lineId === lineIdToUpdate ? { ...item, qty } : item)));
    },
    clear() {
      this.saveItems([]);
    },
    totals() {
      const items = this.getItems();
      const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
      const totalPrice = items.reduce((sum, item) => sum + item.qty * item.price, 0);
      return { totalItems, totalPrice };
    },
  };

  // ---------------------------------------------------------------------
  // Utilitários: moeda + WhatsApp
  // ---------------------------------------------------------------------
  function formatCurrency(value) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function buildWhatsappCheckoutUrl(items, totalPrice) {
    const lines = [
      `Olá, ${STORE_CONFIG.name}! Quero fazer o seguinte pedido:`,
      '',
      ...items.map(
        (item) => `• ${item.qty}x ${item.name} — Tam. ${item.size} / Cor: ${item.color} — ${formatCurrency(item.price * item.qty)}`
      ),
      '',
      `Total: ${formatCurrency(totalPrice)}`,
      '',
      'Podem me confirmar disponibilidade e forma de pagamento?',
    ];
    const text = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${text}`;
  }

  function buildWhatsappProductInquiryUrl(product) {
    const text = encodeURIComponent(`Olá! Tenho interesse na peça "${product.name}" (${formatCurrency(product.price)}). Ainda está disponível?`);
    return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${text}`;
  }

  // ---------------------------------------------------------------------
  // Helpers gerais
  // ---------------------------------------------------------------------
  function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
      reader.readAsDataURL(file);
    });
  }
  async function filesToDataUrls(fileList) {
    return Promise.all(Array.from(fileList).map(fileToDataUrl));
  }

  // ---------------------------------------------------------------------
  // Roteador (hash-based)
  // ---------------------------------------------------------------------
  function parseHash() {
    let hash = window.location.hash || '#/';
    hash = hash.replace(/^#/, '');
    if (!hash) hash = '/';
    const [path, queryStr] = hash.split('?');
    const query = {};
    if (queryStr) {
      queryStr.split('&').forEach((pair) => {
        const [k, v] = pair.split('=');
        if (k) query[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
      });
    }
    return { path: path || '/', query };
  }

  function navigate(path) {
    window.location.hash = path;
  }

  const ROUTES = [
    { name: 'home', pattern: '/' },
    { name: 'product', pattern: '/produto/:id' },
    { name: 'cart', pattern: '/carrinho' },
    { name: 'login', pattern: '/login' },
    { name: 'register', pattern: '/cadastro' },
    { name: 'admin', pattern: '/admin' },
    { name: 'admin-new', pattern: '/admin/produtos/novo' },
    { name: 'admin-edit', pattern: '/admin/produtos/:id/editar' },
  ];

  function matchRoute(path) {
    const cleanPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
    const segments = cleanPath.split('/').filter((s) => s !== '' || cleanPath === '/');
    for (const route of ROUTES) {
      const routeSegments = route.pattern.split('/').filter((s) => s !== '' || route.pattern === '/');
      const pathSegs = cleanPath === '/' ? [''] : cleanPath.split('/').filter(Boolean);
      const routeSegs = route.pattern === '/' ? [''] : route.pattern.split('/').filter(Boolean);
      if (pathSegs.length !== routeSegs.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < routeSegs.length; i++) {
        const rs = routeSegs[i];
        const ps = pathSegs[i];
        if (rs.startsWith(':')) {
          params[rs.slice(1)] = decodeURIComponent(ps || '');
        } else if (rs !== ps) {
          ok = false;
          break;
        }
      }
      if (ok) return { name: route.name, params };
    }
    return { name: 'notfound', params: {} };
  }

  // ---------------------------------------------------------------------
  // Estado de UI efêmero (não persistido)
  // ---------------------------------------------------------------------
  const ui = {
    cartOpen: false,
    homeFilters: { search: '', category: 'Todas', size: 'Todos' },
    productDetail: { activeImage: 0, size: '', color: '', qty: 1, feedback: '' },
    adminSearch: '',
    pendingDeleteId: null,
    authError: '',
    authLoading: false,
  };

  const appEl = document.getElementById('app');

  // ---------------------------------------------------------------------
  // Header
  // ---------------------------------------------------------------------
  function isAuthenticated() {
    return Boolean(AuthDB.getSession());
  }
  function isAdmin() {
    const s = AuthDB.getSession();
    return Boolean(s && s.role === 'admin');
  }

  function headerHtml(activeRoute) {
    const session = AuthDB.getSession();
    const { totalItems } = CartDB.totals();
    const authed = Boolean(session);
    const admin = authed && session.role === 'admin';

    return `
    <header class="site-header">
      <div class="header-inner">
        <a href="#/" class="brand">${STORE_CONFIG.name}</a>
        <nav class="main-nav">
          <a href="#/" class="${activeRoute === 'home' ? 'active' : ''}">Roupas</a>
          <a href="#/?destaque=lancamentos">Lançamentos</a>
          ${admin ? `<a href="#/admin" class="${activeRoute.startsWith('admin') ? 'active' : ''}">Painel admin</a>` : ''}
        </nav>
        <div class="header-actions">
          <button type="button" id="open-cart-btn" class="icon-btn" aria-label="Abrir carrinho de compras">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6h15l-1.5 9h-12z" stroke-linecap="round" stroke-linejoin="round" /><path d="M6 6L4.5 2H2" stroke-linecap="round" stroke-linejoin="round" /><circle cx="9.5" cy="20" r="1.3" /><circle cx="17.5" cy="20" r="1.3" /></svg>
            ${totalItems > 0 ? `<span class="cart-badge">${totalItems}</span>` : ''}
          </button>

          ${authed ? `
            <div class="desktop-user">
              <span class="greeting">Olá, ${escapeHtml((session.name || '').split(' ')[0])}</span>
              ${admin ? `<a href="#/admin" class="btn-primary">Admin</a>` : ''}
              <button id="logout-btn" class="link-muted">Sair</button>
            </div>
          ` : `<a href="#/login" class="btn-primary login-link">Login</a>`}

          <button type="button" id="burger-btn" class="burger-btn" aria-label="Abrir menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round" /></svg>
          </button>
        </div>
      </div>

      <nav id="mobile-nav" class="mobile-nav" style="display:none;">
        <a href="#/">Roupas</a>
        <a href="#/?destaque=lancamentos">Lançamentos</a>
        ${admin ? `<a href="#/admin">Painel admin</a>` : ''}
        ${!authed ? `<a href="#/login">Login</a>` : `<button id="mobile-logout-btn">Sair</button>`}
      </nav>
    </header>`;
  }

  function initHeader() {
    const openCartBtn = document.getElementById('open-cart-btn');
    if (openCartBtn) openCartBtn.addEventListener('click', () => { ui.cartOpen = true; renderCartDrawer(); });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { AuthDB.logout(); render(); });
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', () => { AuthDB.logout(); render(); });

    const burgerBtn = document.getElementById('burger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (burgerBtn && mobileNav) {
      burgerBtn.addEventListener('click', () => {
        mobileNav.style.display = mobileNav.style.display === 'none' ? 'flex' : 'none';
      });
    }
  }

  // ---------------------------------------------------------------------
  // Cart drawer
  // ---------------------------------------------------------------------
  function cartDrawerHtml() {
    const items = CartDB.getItems();
    const { totalItems, totalPrice } = CartDB.totals();

    return `
    <div id="cart-overlay" class="cart-overlay ${ui.cartOpen ? 'open' : ''}">
      <button id="cart-scrim" class="cart-scrim" aria-label="Fechar carrinho"></button>
      <aside class="cart-drawer">
        <div class="cart-drawer-head">
          <h2>Seu carrinho (${totalItems})</h2>
          <button id="cart-close-btn" class="close-btn" aria-label="Fechar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" /></svg>
          </button>
        </div>
        <div class="cart-drawer-body">
          ${items.length === 0 ? `
            <div class="cart-empty">
              <p>Seu carrinho está vazio.</p>
              <a href="#/" id="cart-empty-link" class="link-underline">Ver o catálogo</a>
            </div>
          ` : `
            <ul class="cart-items">
              ${items.map((item) => `
                <li class="cart-item">
                  <img src="${item.image || ''}" alt="${escapeHtml(item.name)}" />
                  <div class="cart-item-info">
                    <span class="cart-item-name">${escapeHtml(item.name)}</span>
                    <span class="cart-item-meta">Tam. ${escapeHtml(item.size)} · ${escapeHtml(item.color)}</span>
                    <div class="qty-row">
                      <button class="qty-btn cart-qty-dec" data-line="${item.lineId}" aria-label="Diminuir quantidade">−</button>
                      <span class="qty-val">${item.qty}</span>
                      <button class="qty-btn cart-qty-inc" data-line="${item.lineId}" aria-label="Aumentar quantidade">+</button>
                      <button class="remove-link cart-remove" data-line="${item.lineId}">Remover</button>
                    </div>
                  </div>
                  <span class="cart-item-price">${formatCurrency(item.price * item.qty)}</span>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
        ${items.length > 0 ? `
          <div class="cart-drawer-foot">
            <div class="cart-total-row"><span>Total</span><span class="cart-total-value">${formatCurrency(totalPrice)}</span></div>
            <a href="${buildWhatsappCheckoutUrl(items, totalPrice)}" target="_blank" rel="noreferrer" class="checkout-btn">Finalizar pelo WhatsApp</a>
            <a href="#/carrinho" id="cart-view-full-link" class="checkout-btn-outline">Ver carrinho completo</a>
          </div>
        ` : ''}
      </aside>
    </div>`;
  }

  function renderCartDrawer() {
    const mount = document.getElementById('cart-drawer-root');
    if (!mount) return;
    mount.outerHTML = `<div id="cart-drawer-root">${cartDrawerHtml()}</div>`;
    initCartDrawer();
    initHeader(); // cart badge count in header must refresh too
    refreshHeaderCartBadge();
  }

  function refreshHeaderCartBadge() {
    const btn = document.getElementById('open-cart-btn');
    if (!btn) return;
    const { totalItems } = CartDB.totals();
    const existingBadge = btn.querySelector('.cart-badge');
    if (totalItems > 0) {
      if (existingBadge) existingBadge.textContent = totalItems;
      else btn.insertAdjacentHTML('beforeend', `<span class="cart-badge">${totalItems}</span>`);
    } else if (existingBadge) {
      existingBadge.remove();
    }
  }

  function initCartDrawer() {
    const scrim = document.getElementById('cart-scrim');
    const closeBtn = document.getElementById('cart-close-btn');
    const emptyLink = document.getElementById('cart-empty-link');
    const viewFullLink = document.getElementById('cart-view-full-link');
    function closeDrawer() { ui.cartOpen = false; renderCartDrawer(); }
    if (scrim) scrim.addEventListener('click', closeDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (emptyLink) emptyLink.addEventListener('click', closeDrawer);
    if (viewFullLink) viewFullLink.addEventListener('click', closeDrawer);

    document.querySelectorAll('.cart-qty-dec').forEach((btn) => {
      btn.addEventListener('click', () => {
        const line = btn.getAttribute('data-line');
        const item = CartDB.getItems().find((i) => i.lineId === line);
        if (item) CartDB.updateQty(line, item.qty - 1);
        renderCartDrawer();
        refreshCartPageIfPresent();
      });
    });
    document.querySelectorAll('.cart-qty-inc').forEach((btn) => {
      btn.addEventListener('click', () => {
        const line = btn.getAttribute('data-line');
        const item = CartDB.getItems().find((i) => i.lineId === line);
        if (item) CartDB.updateQty(line, item.qty + 1);
        renderCartDrawer();
        refreshCartPageIfPresent();
      });
    });
    document.querySelectorAll('.cart-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        CartDB.removeItem(btn.getAttribute('data-line'));
        renderCartDrawer();
        refreshCartPageIfPresent();
      });
    });
  }

  function refreshCartPageIfPresent() {
    // If we're currently on the /carrinho page, re-render its main content too.
    const { path } = parseHash();
    const route = matchRoute(path);
    if (route.name === 'cart') {
      const main = document.getElementById('main-content');
      if (main) {
        main.innerHTML = renderCartPage();
        initCartPage();
      }
    }
  }

  // ---------------------------------------------------------------------
  // Footer
  // ---------------------------------------------------------------------
  function footerHtml() {
    return `
    <footer class="site-footer">
      <div class="footer-inner">
        <span class="footer-brand">${STORE_CONFIG.name}</span>
        <div class="footer-links">
          <a href="${STORE_CONFIG.instagramUrl}" target="_blank" rel="noreferrer" aria-label="Instagram da Amavi">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
            </svg>
            @${STORE_CONFIG.instagramHandle}
          </a>
          <a href="https://wa.me/${STORE_CONFIG.whatsappNumber}" target="_blank" rel="noreferrer" aria-label="WhatsApp da Amavi">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" stroke-linejoin="round" />
              <path d="M8.5 8.7c.2-.6.7-.6 1-.6h.5c.2 0 .4 0 .6.5.2.5.6 1.6.6 1.7.1.1.1.3 0 .5-.1.2-.2.3-.3.4l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.6-.7c.2-.2.4-.2.6-.1l1.5.7c.2.1.4.2.4.4 0 .6-.2 1.3-.5 1.6-.4.4-1.2.7-2.1.5-1.8-.4-3.7-1.4-5.1-2.9-1.2-1.2-2-2.5-2.4-3.5-.3-.9-.2-1.7.3-2.1Z" />
            </svg>
            Fale com a gente
          </a>
        </div>
        <p class="footer-copy">© ${new Date().getFullYear()} ${STORE_CONFIG.name}. Consulte disponibilidade antes de garantir sua peça.</p>
      </div>
    </footer>`;
  }

  // ---------------------------------------------------------------------
  // Página: Home / Catálogo
  // ---------------------------------------------------------------------
  function filterProducts(products, filters, isLancamentos) {
    return products.filter((product) => {
      if (isLancamentos && !product.isNew) return false;
      if (filters.category !== 'Todas' && product.category !== filters.category) return false;
      if (filters.size !== 'Todos' && !(product.sizes || []).includes(filters.size)) return false;
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        if (!product.name.toLowerCase().includes(q) && !product.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  function productCardHtml(product) {
    const outOfStock = product.stock <= 0;
    return `
    <a href="#/produto/${product.id}" class="product-card">
      <div class="product-thumb">
        <img class="product-img" src="${(product.images && product.images[0]) || ''}" alt="${escapeHtml(product.name)}" loading="lazy" />
        ${product.isNew ? `<span class="badge-new">Novo</span>` : ''}
        ${outOfStock ? `<span class="badge-out">Esgotado</span>` : ''}
      </div>
      <div class="product-info">
        <span class="product-cat">${escapeHtml(product.category)}</span>
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        <span class="product-price">${formatCurrency(product.price)}</span>
      </div>
    </a>`;
  }

  function renderProductGridSection(filters, isLancamentos) {
    const products = ProductsDB.list();
    const filtered = filterProducts(products, filters, isLancamentos);
    if (filtered.length === 0) {
      return `
        <div class="empty-state">
          <p>Nenhuma peça encontrada com esses filtros.</p>
          <button id="clear-filters-btn" class="link-underline">Limpar filtros</button>
        </div>`;
    }
    return `<div class="product-grid">${filtered.map(productCardHtml).join('')}</div>`;
  }

  function renderHomePage(query) {
    const isLancamentos = query.destaque === 'lancamentos';
    ui.homeFilters = { search: '', category: 'Todas', size: 'Todos' };

    return `
    <div>
      <section class="hero">
        <div class="hero-inner">
          <p class="hero-eyebrow">Moda feminina inclusiva</p>
          <h1>${escapeHtml(STORE_CONFIG.tagline)}</h1>
        </div>
      </section>

      <section id="catalogo" class="catalog-section">
        <div class="catalog-head">
          <h2>${isLancamentos ? 'Lançamentos' : 'Catálogo'}</h2>
          <div class="catalog-filters">
            <input type="search" id="home-search" class="input search-input" placeholder="Buscar peça..." value="" />
            <select id="home-category" class="select">
              <option>Todas</option>
              ${CATEGORIES.map((c) => `<option>${c}</option>`).join('')}
            </select>
            <select id="home-size" class="select">
              <option>Todos</option>
              ${SIZES.map((s) => `<option>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <div id="product-grid-container">${renderProductGridSection(ui.homeFilters, isLancamentos)}</div>
      </section>
    </div>`;
  }

  function initHomePage(isLancamentos) {
    const searchInput = document.getElementById('home-search');
    const categorySelect = document.getElementById('home-category');
    const sizeSelect = document.getElementById('home-size');
    const gridContainer = document.getElementById('product-grid-container');

    function refreshGrid() {
      gridContainer.innerHTML = renderProductGridSection(ui.homeFilters, isLancamentos);
      const clearBtn = document.getElementById('clear-filters-btn');
      if (clearBtn) clearBtn.addEventListener('click', () => {
        ui.homeFilters = { search: '', category: 'Todas', size: 'Todos' };
        searchInput.value = '';
        categorySelect.value = 'Todas';
        sizeSelect.value = 'Todos';
        refreshGrid();
      });
    }

    if (searchInput) searchInput.addEventListener('input', (e) => { ui.homeFilters.search = e.target.value; refreshGrid(); });
    if (categorySelect) categorySelect.addEventListener('change', (e) => { ui.homeFilters.category = e.target.value; refreshGrid(); });
    if (sizeSelect) sizeSelect.addEventListener('change', (e) => { ui.homeFilters.size = e.target.value; refreshGrid(); });

    const clearBtn = document.getElementById('clear-filters-btn');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      ui.homeFilters = { search: '', category: 'Todas', size: 'Todos' };
      refreshGrid();
    });
  }

  // ---------------------------------------------------------------------
  // Página: Detalhe do produto
  // ---------------------------------------------------------------------
  function renderProductDetailPage(id) {
    const product = ProductsDB.get(id);

    if (!product) {
      return `
      <div class="simple-page">
        <p>Produto não encontrado.</p>
        <a href="#/" class="link-underline">Voltar ao catálogo</a>
      </div>`;
    }

    ui.productDetail = {
      activeImage: 0,
      size: (product.sizes && product.sizes[0]) || '',
      color: (product.colors && product.colors[0]) || '',
      qty: 1,
      feedback: '',
    };

    return renderProductDetailInner(product);
  }

  function renderProductDetailInner(product) {
    const state = ui.productDetail;
    const products = ProductsDB.list();
    const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);
    const images = product.images || [];

    return `
    <div class="detail-wrap">
      <button id="pd-back-btn" class="back-link">← Voltar</button>

      <div class="detail-grid">
        <div>
          <div class="detail-main-img">
            <img src="${images[state.activeImage] || ''}" alt="${escapeHtml(product.name)}" />
          </div>
          ${images.length > 1 ? `
            <div class="thumb-row">
              ${images.map((img, i) => `
                <button class="thumb-btn pd-thumb ${i === state.activeImage ? 'active' : ''}" data-i="${i}">
                  <img src="${img}" alt="" />
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div>
          <span class="detail-cat">${escapeHtml(product.category)}</span>
          <h1 class="detail-title">${escapeHtml(product.name)}</h1>
          <p class="detail-price">${formatCurrency(product.price)}</p>
          <p class="detail-desc">${escapeHtml(product.description)}</p>

          <div class="option-block">
            <span class="option-label">Tamanho</span>
            <div class="option-list">
              ${(product.sizes || []).map((s) => `<button class="option-btn pd-size ${state.size === s ? 'selected' : ''}" data-s="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}
            </div>
          </div>

          <div class="option-block">
            <span class="option-label">Cor</span>
            <div class="option-list">
              ${(product.colors || []).map((c) => `<button class="option-btn pd-color ${state.color === c ? 'selected' : ''}" data-c="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}
            </div>
          </div>

          <div class="qty-selector">
            <span class="qty-label">Qtd.</span>
            <div class="qty-box">
              <button id="pd-qty-dec" class="qty-btn" aria-label="Diminuir">−</button>
              <span class="qty-val">${state.qty}</span>
              <button id="pd-qty-inc" class="qty-btn" aria-label="Aumentar">+</button>
            </div>
            <span class="stock-note">${product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}</span>
          </div>

          ${state.feedback ? `<p class="feedback-msg">${escapeHtml(state.feedback)}</p>` : ''}

          <div class="detail-actions">
            <button id="pd-add-cart" class="btn-primary" ${product.stock <= 0 ? 'disabled' : ''}>Adicionar ao carrinho</button>
            <a href="${buildWhatsappProductInquiryUrl(product)}" target="_blank" rel="noreferrer" class="btn-outline">Perguntar no WhatsApp</a>
          </div>
        </div>
      </div>

      ${related.length > 0 ? `
        <section class="related-section">
          <h2>Produtos relacionados</h2>
          <div class="related-grid">${related.map(productCardHtml).join('')}</div>
        </section>
      ` : ''}
    </div>`;
  }

  function initProductDetailPage(id) {
    const product = ProductsDB.get(id);
    if (!product) {
      return;
    }

    document.getElementById('pd-back-btn').addEventListener('click', () => window.history.back());

    function refresh() {
      const main = document.getElementById('main-content');
      main.innerHTML = renderProductDetailInner(product);
      initProductDetailPage(id);
    }

    document.querySelectorAll('.pd-thumb').forEach((btn) => {
      btn.addEventListener('click', () => { ui.productDetail.activeImage = Number(btn.getAttribute('data-i')); refresh(); });
    });
    document.querySelectorAll('.pd-size').forEach((btn) => {
      btn.addEventListener('click', () => { ui.productDetail.size = btn.getAttribute('data-s'); refresh(); });
    });
    document.querySelectorAll('.pd-color').forEach((btn) => {
      btn.addEventListener('click', () => { ui.productDetail.color = btn.getAttribute('data-c'); refresh(); });
    });
    const decBtn = document.getElementById('pd-qty-dec');
    const incBtn = document.getElementById('pd-qty-inc');
    if (decBtn) decBtn.addEventListener('click', () => { ui.productDetail.qty = Math.max(1, ui.productDetail.qty - 1); refresh(); });
    if (incBtn) incBtn.addEventListener('click', () => { ui.productDetail.qty = ui.productDetail.qty + 1; refresh(); });

    const addBtn = document.getElementById('pd-add-cart');
    if (addBtn) addBtn.addEventListener('click', () => {
      const { size, color, qty } = ui.productDetail;
      if (!size || !color) {
        ui.productDetail.feedback = 'Selecione tamanho e cor antes de continuar.';
        refresh();
        return;
      }
      CartDB.addItem(product, { size, color, qty });
      ui.productDetail.feedback = '';
      ui.cartOpen = true;
      refresh();
      renderCartDrawer();
    });
  }

  // ---------------------------------------------------------------------
  // Página: Carrinho
  // ---------------------------------------------------------------------
  function renderCartPage() {
    const items = CartDB.getItems();
    const { totalPrice } = CartDB.totals();

    if (items.length === 0) {
      return `
      <div class="cartpage-empty">
        <h1>Seu carrinho está vazio</h1>
        <p>Que tal dar uma olhada nas nossas peças?</p>
        <a href="#/" class="btn-primary">Ver catálogo</a>
      </div>`;
    }

    const missingForFreeShipping = Math.max(0, STORE_CONFIG.freeShippingThreshold - totalPrice);

    return `
    <div class="cartpage-wrap">
      <h1>Meu carrinho</h1>
      <p class="sub">Revise os itens antes de enviar seu pedido.</p>

      <ul class="cartpage-list">
        ${items.map((item) => `
          <li class="cartpage-item">
            <img src="${item.image || ''}" alt="${escapeHtml(item.name)}" />
            <div class="cartpage-item-body">
              <div class="cartpage-item-top">
                <div>
                  <h3>${escapeHtml(item.name)}</h3>
                  <p>Tam. ${escapeHtml(item.size)} · Cor: ${escapeHtml(item.color)}</p>
                </div>
                <span class="price">${formatCurrency(item.price * item.qty)}</span>
              </div>
              <div class="cartpage-row-actions">
                <div class="qty-box">
                  <button class="qty-btn cp-qty-dec" data-line="${item.lineId}" aria-label="Diminuir">−</button>
                  <span class="qty-val">${item.qty}</span>
                  <button class="qty-btn cp-qty-inc" data-line="${item.lineId}" aria-label="Aumentar">+</button>
                </div>
                <button class="remove-link cp-remove" data-line="${item.lineId}">Remover</button>
              </div>
            </div>
          </li>
        `).join('')}
      </ul>

      <div class="cartpage-actions-line">
        <button id="cp-clear" class="link-underline">Esvaziar carrinho</button>
        <a href="#/" class="link-underline">Continuar comprando</a>
      </div>

      <div class="cartpage-box">
        ${missingForFreeShipping > 0
          ? `<p class="ship-note">Faltam ${formatCurrency(missingForFreeShipping)} para frete grátis*.</p>`
          : `<p class="ship-note">Seu pedido já garante frete grátis*.</p>`}
        <div class="cartpage-total"><span>Total</span><span>${formatCurrency(totalPrice)}</span></div>
        <div class="cartpage-cta">
          <a href="${buildWhatsappCheckoutUrl(items, totalPrice)}" target="_blank" rel="noreferrer" class="btn-primary">Finalizar pelo WhatsApp</a>
          <a href="${STORE_CONFIG.instagramUrl}" target="_blank" rel="noreferrer" class="btn-outline">Finalizar pelo Instagram</a>
        </div>
        <p class="fine-print">*Condições de frete confirmadas diretamente com a equipe Amavi. Ao finalizar, você será direcionada ao nosso canal de vendas para confirmar disponibilidade e pagamento.</p>
      </div>
    </div>`;
  }

  function initCartPage() {
    const clearBtn = document.getElementById('cp-clear');
    if (clearBtn) clearBtn.addEventListener('click', () => { CartDB.clear(); refreshCartPageAndDrawer(); });

    document.querySelectorAll('.cp-qty-dec').forEach((btn) => {
      btn.addEventListener('click', () => {
        const line = btn.getAttribute('data-line');
        const item = CartDB.getItems().find((i) => i.lineId === line);
        if (item) CartDB.updateQty(line, item.qty - 1);
        refreshCartPageAndDrawer();
      });
    });
    document.querySelectorAll('.cp-qty-inc').forEach((btn) => {
      btn.addEventListener('click', () => {
        const line = btn.getAttribute('data-line');
        const item = CartDB.getItems().find((i) => i.lineId === line);
        if (item) CartDB.updateQty(line, item.qty + 1);
        refreshCartPageAndDrawer();
      });
    });
    document.querySelectorAll('.cp-remove').forEach((btn) => {
      btn.addEventListener('click', () => { CartDB.removeItem(btn.getAttribute('data-line')); refreshCartPageAndDrawer(); });
    });
  }

  function refreshCartPageAndDrawer() {
    const main = document.getElementById('main-content');
    if (main) { main.innerHTML = renderCartPage(); initCartPage(); }
    renderCartDrawer();
  }

  // ---------------------------------------------------------------------
  // Página: Login
  // ---------------------------------------------------------------------
  function renderLoginPage(query) {
    const adminHint = query.tipo === 'admin';
    return `
    <main class="auth-page">
      <section class="auth-card auth-card-login">
        <div class="auth-visual">
          <div class="auth-brand">AMAVI</div>
          <div class="auth-welcome">
            <img src="${FASHION_ICON_DATA_URL}" alt="Ícone de cabide relacionado à moda feminina" />
            <h2>Bem-vinda à Amavi</h2>
            <p>Moda feminina, leveza e estilo em cada detalhe.</p>
          </div>
          <p class="auth-switch">Ainda não possui conta? <a href="#/cadastro">Cadastre-se</a></p>
        </div>

        <form id="login-form" class="auth-form">
          <div class="auth-title"><span>Acesse sua conta</span><h1>Login</h1></div>

          <label class="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4zM4 7l8 6 8-6" /></svg>
            <input type="email" id="login-email" placeholder="E-mail" required />
          </label>

          <label class="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0110 0v2M5 10h14v10H5z" /></svg>
            <input type="password" id="login-password" placeholder="Senha" required />
          </label>

          <div class="auth-help-row"><span>Entram aqui contas de usuário e administrador.</span></div>

          <p id="login-error" class="auth-error" style="display:none;"></p>
          ${adminHint ? `<p class="auth-info">Acesse com uma conta de administrador para abrir o painel.</p>` : ''}

          <button id="login-submit" class="auth-submit" type="submit">Entrar</button>

          <p class="auth-demo">Admin de demonstração: <strong>admin@amavi.com.br</strong> / <strong>amavi123</strong></p>
        </form>
      </section>
    </main>`;
  }

  function initLoginPage() {
    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');
    const submitBtn = document.getElementById('login-submit');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Entrando...';
      errorEl.style.display = 'none';

      setTimeout(() => {
        try {
          const session = AuthDB.login(email, password);
          navigate(session.role === 'admin' ? '/admin' : '/');
          render();
        } catch (err) {
          errorEl.textContent = err.message;
          errorEl.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Entrar';
        }
      }, 200);
    });
  }

  // ---------------------------------------------------------------------
  // Página: Cadastro
  // ---------------------------------------------------------------------
  function renderRegisterPage() {
    return `
    <main class="auth-page">
      <section class="auth-card auth-card-register">
        <div class="auth-visual auth-visual-register">
          <div class="auth-brand">AMAVI</div>
          <div class="auth-welcome">
            <img src="${FASHION_ICON_DATA_URL}" alt="Ícone de cabide relacionado à moda feminina" />
            <h2>Seu espaço Amavi</h2>
            <p>Crie sua conta para acessar a loja ou administrar o catálogo.</p>
          </div>
          <p class="auth-switch">Já possui uma conta? <a href="#/login">Entrar</a></p>
        </div>

        <form id="register-form" class="auth-form auth-form-register">
          <div class="auth-title"><span>Faça parte da Amavi</span><h1>Cadastro</h1></div>

          <label class="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <input id="reg-name" type="text" placeholder="Nome completo" required />
          </label>

          <label class="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4zM4 7l8 6 8-6" /></svg>
            <input id="reg-email" type="email" placeholder="E-mail" required />
          </label>

          <label class="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0110 0v2M5 10h14v10H5z" /></svg>
            <input id="reg-password" type="password" placeholder="Senha" required />
          </label>

          <label class="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0110 0v2M5 10h14v10H5z" /></svg>
            <input id="reg-confirm" type="password" placeholder="Confirmar senha" required />
          </label>

          <label class="auth-field auth-select-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20v-9l8-5 8 5v9M8 20v-6h8v6" /></svg>
            <select id="reg-role" aria-label="Tipo de conta">
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </label>

          <p id="register-error" class="auth-error" style="display:none;"></p>

          <button id="register-submit" class="auth-submit" type="submit">Cadastrar</button>

          <p class="auth-security-note">Neste protótipo, o cadastro é salvo no navegador. Em produção, contas admin devem ser autorizadas pelo back-end.</p>
        </form>
      </section>
    </main>`;
  }

  function initRegisterPage() {
    const form = document.getElementById('register-form');
    const errorEl = document.getElementById('register-error');
    const submitBtn = document.getElementById('register-submit');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm').value;
      const role = document.getElementById('reg-role').value;

      errorEl.style.display = 'none';

      if (password.length < 6) {
        errorEl.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        errorEl.style.display = 'block';
        return;
      }
      if (password !== confirmPassword) {
        errorEl.textContent = 'As senhas não coincidem.';
        errorEl.style.display = 'block';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Cadastrando...';

      setTimeout(() => {
        try {
          AuthDB.register({ name, email, password, role });
          navigate('/login');
          render();
        } catch (err) {
          errorEl.textContent = err.message;
          errorEl.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Cadastrar';
        }
      }, 200);
    });
  }

  // ---------------------------------------------------------------------
  // Página: Não encontrada
  // ---------------------------------------------------------------------
  function renderNotFoundPage() {
    return `
    <div class="simple-page">
      <h1>Página não encontrada</h1>
      <p>O endereço acessado não existe.</p>
      <a href="#/" class="btn-primary">Voltar ao catálogo</a>
    </div>`;
  }

  // ---------------------------------------------------------------------
  // Admin: layout header
  // ---------------------------------------------------------------------
  function adminHeaderHtml(activeRoute) {
    const session = AuthDB.getSession();
    return `
    <header class="admin-header">
      <div class="admin-header-inner">
        <div class="admin-brand-row">
          <a href="#/admin" class="admin-brand">${STORE_CONFIG.name} <span>admin</span></a>
          <nav class="admin-nav">
            <a href="#/admin" class="${activeRoute === 'admin' ? 'active' : ''}">Produtos</a>
            <a href="#/admin/produtos/novo" class="${activeRoute === 'admin-new' ? 'active' : ''}">Novo produto</a>
            <a href="#/">Ver loja</a>
          </nav>
        </div>
        <div class="admin-user">
          <span class="name">${escapeHtml(session ? session.name : '')}</span>
          <button id="admin-logout-btn" class="btn-ghost">Sair</button>
        </div>
      </div>
    </header>`;
  }

  function initAdminHeader() {
    const btn = document.getElementById('admin-logout-btn');
    if (btn) btn.addEventListener('click', () => { AuthDB.logout(); navigate('/'); render(); });
  }

  // ---------------------------------------------------------------------
  // Admin: dashboard (lista de produtos)
  // ---------------------------------------------------------------------
  function renderAdminDashboardPage() {
    ui.adminSearch = '';
    ui.pendingDeleteId = null;
    return renderAdminDashboardInner();
  }

  function renderAdminDashboardInner() {
    const products = ProductsDB.list();
    const filtered = products.filter((p) => p.name.toLowerCase().includes(ui.adminSearch.toLowerCase()));

    return `
    <div>
      <div class="admin-toolbar">
        <div>
          <h1>Produtos</h1>
          <p class="sub">${products.length} peças cadastradas na vitrine.</p>
        </div>
        <div class="admin-toolbar-actions">
          <input type="search" id="admin-search-input" class="input" placeholder="Buscar produto..." value="${escapeHtml(ui.adminSearch)}" />
          <a href="#/admin/produtos/novo" class="btn-primary">+ Novo produto</a>
        </div>
      </div>

      ${filtered.length === 0 ? `<p class="state-msg">Nenhum produto encontrado.</p>` : `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Peça</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th class="right">Ações</th>
            </tr>
          </thead>
          <tbody id="admin-table-body">
            ${filtered.map((product) => renderAdminRow(product)).join('')}
          </tbody>
        </table>
      </div>`}
    </div>`;
  }

  function renderAdminRow(product) {
    const stockClass = product.stock <= 0 ? 'stock-none' : product.stock <= 3 ? 'stock-low' : 'stock-ok';
    return `
    <tr>
      <td>
        <div class="table-product-cell">
          <img src="${(product.images && product.images[0]) || ''}" alt="" />
          <span>${escapeHtml(product.name)}</span>
        </div>
      </td>
      <td>${escapeHtml(product.category)}</td>
      <td>${formatCurrency(product.price)}</td>
      <td><span class="${stockClass}">${product.stock}</span></td>
      <td>
        <div class="table-actions">
          <a href="#/admin/produtos/${product.id}/editar">Editar</a>
          ${ui.pendingDeleteId === product.id ? `
            <button class="danger admin-confirm-delete" data-id="${product.id}">Confirmar</button>
            <button class="admin-cancel-delete">Cancelar</button>
          ` : `<button class="admin-ask-delete" data-id="${product.id}">Excluir</button>`}
        </div>
      </td>
    </tr>`;
  }

  function initAdminDashboardPage() {
    const searchInput = document.getElementById('admin-search-input');
    function refresh() {
      const main = document.getElementById('main-content');
      main.innerHTML = renderAdminDashboardInner();
      initAdminDashboardPage();
      const newSearch = document.getElementById('admin-search-input');
      if (newSearch) newSearch.focus();
    }

    if (searchInput) searchInput.addEventListener('input', (e) => {
      ui.adminSearch = e.target.value;
      const tbodyWrap = document.querySelector('.admin-table-wrap') || document.querySelector('.admin-toolbar').parentElement;
      const main = document.getElementById('main-content');
      const caretPos = searchInput.selectionStart;
      main.innerHTML = renderAdminDashboardInner();
      const newInput = document.getElementById('admin-search-input');
      newInput.focus();
      newInput.setSelectionRange(caretPos, caretPos);
      initAdminDashboardPage();
    });

    document.querySelectorAll('.admin-ask-delete').forEach((btn) => {
      btn.addEventListener('click', () => { ui.pendingDeleteId = btn.getAttribute('data-id'); refresh(); });
    });
    document.querySelectorAll('.admin-cancel-delete').forEach((btn) => {
      btn.addEventListener('click', () => { ui.pendingDeleteId = null; refresh(); });
    });
    document.querySelectorAll('.admin-confirm-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        ProductsDB.remove(btn.getAttribute('data-id'));
        ui.pendingDeleteId = null;
        refresh();
      });
    });
  }

  // ---------------------------------------------------------------------
  // Admin: formulário de produto (criar/editar)
  // ---------------------------------------------------------------------
  let adminFormState = null;

  function emptyProductForm() {
    return {
      name: '', description: '', category: CATEGORIES[0], price: '', stock: '',
      sizes: [], colors: '', isNew: true, images: [],
    };
  }

  function renderAdminProductFormPage(id) {
    const isEditing = Boolean(id);
    if (isEditing) {
      const existing = ProductsDB.get(id);
      adminFormState = existing
        ? { ...existing, price: String(existing.price), stock: String(existing.stock), colors: (existing.colors || []).join(', ') }
        : emptyProductForm();
    } else {
      adminFormState = emptyProductForm();
    }
    return renderAdminProductFormInner(id, isEditing, '');
  }

  function renderAdminProductFormInner(id, isEditing, error) {
    const f = adminFormState;
    return `
    <div class="form-wrap">
      <h1>${isEditing ? 'Editar produto' : 'Novo produto'}</h1>
      <p class="sub">Esses dados aparecem imediatamente na vitrine pública do catálogo.</p>

      <form id="product-form">
        <label class="form-field">Nome do produto
          <input id="pf-name" value="${escapeHtml(f.name)}" placeholder="Ex: Vestido Midi Floral" />
        </label>

        <label class="form-field">Descrição
          <textarea id="pf-description" rows="4" placeholder="Tecido, caimento, ocasião de uso...">${escapeHtml(f.description)}</textarea>
        </label>

        <div class="form-row-2">
          <label class="form-field">Categoria
            <select id="pf-category">
              ${CATEGORIES.map((c) => `<option ${f.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </label>
          <label class="form-checkbox-row">
            <input type="checkbox" id="pf-isnew" ${f.isNew ? 'checked' : ''} />
            Marcar como lançamento
          </label>
        </div>

        <div class="form-row-2">
          <label class="form-field">Preço (R$)
            <input id="pf-price" type="number" min="0" step="0.01" value="${escapeHtml(f.price)}" placeholder="0,00" />
          </label>
          <label class="form-field">Estoque
            <input id="pf-stock" type="number" min="0" value="${escapeHtml(f.stock)}" placeholder="0" />
          </label>
        </div>

        <div class="form-field">
          <span>Tamanhos disponíveis</span>
          <div class="option-list" id="pf-sizes">
            ${SIZES.map((s) => `<button type="button" class="option-btn pf-size-btn ${f.sizes.includes(s) ? 'selected' : ''}" data-s="${s}">${s}</button>`).join('')}
          </div>
        </div>

        <label class="form-field">Cores (separadas por vírgula)
          <input id="pf-colors" value="${escapeHtml(f.colors)}" placeholder="Preto, Off White, Rosa" />
        </label>

        <div class="form-field">
          <span>Fotos do produto</span>
          <input type="file" id="pf-images" accept="image/*" multiple />
          <div class="image-preview-row" id="pf-image-preview">
            ${f.images.map((img, i) => `
              <div class="image-preview">
                <img src="${img}" alt="" />
                <button type="button" class="pf-remove-image" data-i="${i}" aria-label="Remover imagem">×</button>
              </div>
            `).join('')}
          </div>
        </div>

        ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}

        <div class="form-actions">
          <button type="submit" class="btn-primary">${isEditing ? 'Salvar alterações' : 'Cadastrar produto'}</button>
          <button type="button" id="pf-cancel" class="btn-outline">Cancelar</button>
        </div>
      </form>
    </div>`;
  }

  function initAdminProductFormPage(id) {
    const isEditing = Boolean(id);

    function refresh(error) {
      const main = document.getElementById('main-content');
      main.innerHTML = renderAdminProductFormInner(id, isEditing, error || '');
      initAdminProductFormPage(id);
    }

    document.getElementById('pf-name').addEventListener('input', (e) => { adminFormState.name = e.target.value; });
    document.getElementById('pf-description').addEventListener('input', (e) => { adminFormState.description = e.target.value; });
    document.getElementById('pf-category').addEventListener('change', (e) => { adminFormState.category = e.target.value; });
    document.getElementById('pf-isnew').addEventListener('change', (e) => { adminFormState.isNew = e.target.checked; });
    document.getElementById('pf-price').addEventListener('input', (e) => { adminFormState.price = e.target.value; });
    document.getElementById('pf-stock').addEventListener('input', (e) => { adminFormState.stock = e.target.value; });
    document.getElementById('pf-colors').addEventListener('input', (e) => { adminFormState.colors = e.target.value; });

    document.querySelectorAll('.pf-size-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = btn.getAttribute('data-s');
        if (adminFormState.sizes.includes(s)) adminFormState.sizes = adminFormState.sizes.filter((x) => x !== s);
        else adminFormState.sizes = [...adminFormState.sizes, s];
        btn.classList.toggle('selected');
      });
    });

    const fileInput = document.getElementById('pf-images');
    fileInput.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (!files || !files.length) return;
      const dataUrls = await filesToDataUrls(files);
      adminFormState.images = [...adminFormState.images, ...dataUrls];
      refresh();
    });

    document.querySelectorAll('.pf-remove-image').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-i'));
        adminFormState.images = adminFormState.images.filter((_, idx) => idx !== i);
        refresh();
      });
    });

    document.getElementById('pf-cancel').addEventListener('click', () => { navigate('/admin'); render(); });

    document.getElementById('product-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = adminFormState;

      if (!f.name.trim()) return refresh('Informe o nome do produto.');
      if (f.sizes.length === 0) return refresh('Selecione ao menos um tamanho.');
      if (f.images.length === 0) return refresh('Adicione ao menos uma foto do produto.');
      if (Number(f.price) <= 0 || isNaN(Number(f.price))) return refresh('Informe um preço válido.');

      const payload = {
        name: f.name.trim(),
        description: f.description.trim(),
        category: f.category,
        price: Number(f.price),
        stock: Number(f.stock) || 0,
        sizes: f.sizes,
        colors: f.colors.split(',').map((c) => c.trim()).filter(Boolean),
        isNew: f.isNew,
        images: f.images,
      };

      try {
        if (isEditing) ProductsDB.update(id, payload);
        else ProductsDB.create(payload);
        navigate('/admin');
        render();
      } catch (err) {
        refresh(err.message || 'Não foi possível salvar o produto.');
      }
    });
  }

  // ---------------------------------------------------------------------
  // Render principal / roteamento
  // ---------------------------------------------------------------------
  function render() {
    const { path, query } = parseHash();
    const route = matchRoute(path);

    // Guarda de rota para o painel admin
    if ((route.name === 'admin' || route.name === 'admin-new' || route.name === 'admin-edit') && !isAdmin()) {
      window.location.hash = '/login?tipo=admin';
      return;
    }
    // Se já autenticada e tentando acessar login/cadastro, redireciona
    if ((route.name === 'login' || route.name === 'register') && isAuthenticated()) {
      const session = AuthDB.getSession();
      window.location.hash = session.role === 'admin' ? '/admin' : '/';
      return;
    }

    let bodyHtml = '';

    if (route.name === 'login') {
      bodyHtml = renderLoginPage(query);
      appEl.innerHTML = bodyHtml;
      initLoginPage();
      return;
    }
    if (route.name === 'register') {
      bodyHtml = renderRegisterPage();
      appEl.innerHTML = bodyHtml;
      initRegisterPage();
      return;
    }

    if (route.name === 'admin' || route.name === 'admin-new' || route.name === 'admin-edit') {
      let mainHtml = '';
      if (route.name === 'admin') mainHtml = renderAdminDashboardPage();
      else if (route.name === 'admin-new') mainHtml = renderAdminProductFormPage(null);
      else mainHtml = renderAdminProductFormPage(route.params.id);

      appEl.innerHTML = `
        <div class="admin-shell">
          ${adminHeaderHtml(route.name)}
          <main class="admin-main" id="main-content">${mainHtml}</main>
        </div>`;
      initAdminHeader();
      if (route.name === 'admin') initAdminDashboardPage();
      else initAdminProductFormPage(route.name === 'admin-edit' ? route.params.id : null);
      return;
    }

    // Layout padrão da loja (header + main + footer + drawer)
    let mainHtml = '';
    if (route.name === 'home') mainHtml = renderHomePage(query);
    else if (route.name === 'product') mainHtml = renderProductDetailPage(route.params.id);
    else if (route.name === 'cart') mainHtml = renderCartPage();
    else mainHtml = renderNotFoundPage();

    appEl.innerHTML = `
      ${headerHtml(route.name)}
      <main class="page-main" id="main-content">${mainHtml}</main>
      ${footerHtml()}
      <div id="cart-drawer-root">${cartDrawerHtml()}</div>
    `;

    initHeader();
    initCartDrawer();

    if (route.name === 'home') initHomePage(query.destaque === 'lancamentos');
    else if (route.name === 'product') initProductDetailPage(route.params.id);
    else if (route.name === 'cart') initCartPage();
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', render);
  // Caso o script rode após DOMContentLoaded já ter disparado:
  if (document.readyState !== 'loading') render();
})();
