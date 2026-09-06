// Stainless Steel Collection - Supabase Integration
// State management
let activeTab = 'women';
let activeFilter = 'all';
let searchTerm = '';
let showExpandedView = false;
let stainlessProducts = [];
let availablePromoCodes = [];
let appliedPromoCode = '';

// Load products from Supabase
async function loadStainlessProducts() {
  if (typeof supabaseClient === 'undefined') {
    console.error('Supabase client not available');
    return;
  }

  // Determine material based on page context
  const material = window.pageMaterial || 'stainless';

  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('material', material)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Failed to load ${material} products:`, error);
    return;
  }

  stainlessProducts = data || [];
  renderApp();
}

// Subscribe to realtime updates
function subscribeToProductUpdates() {
  if (typeof supabaseClient === 'undefined') return;

  const material = window.pageMaterial || 'stainless';

  supabaseClient
    .channel('products')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'products',
      filter: `material=eq.${material}`
    }, (payload) => {
      console.log('Product update:', payload);
      loadStainlessProducts();
    })
    .subscribe();
}

function normalizePromoCode(code) {
  return String(code || '').trim().toUpperCase();
}

function isPromoValidationSkippableError(error) {
  const message = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '');

  if (code === '42501' || code === '42P01') {
    return true;
  }

  return (
    message.includes('permission denied') ||
    message.includes('row-level security') ||
    message.includes('does not exist') ||
    message.includes('relation')
  );
}

function parsePromoCodes(rawValue) {
  if (Array.isArray(rawValue)) {
    return rawValue.map(normalizePromoCode).filter(Boolean);
  }

  if (!rawValue) {
    return [];
  }

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizePromoCode).filter(Boolean);
      }
    } catch {
      // Fall through to newline/comma split.
    }

    return trimmed
      .split(/\r?\n|,/)
      .map(normalizePromoCode)
      .filter(Boolean);
  }

  return [normalizePromoCode(String(rawValue))].filter(Boolean);
}

async function loadPromoCodes() {
  if (typeof supabaseClient === 'undefined') return;

  const { data, error } = await supabaseClient
    .from('site_settings')
    .select('value')
    .eq('key', 'promo_codes')
    .maybeSingle();

  if (error) {
    console.error('Failed to load promo codes:', error);
    availablePromoCodes = [];
    return;
  }

  availablePromoCodes = parsePromoCodes(data?.value);
}

function getCartSubtotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getPromoDiscountAmount(subtotal) {
  if (!appliedPromoCode) return 0;
  return Math.round(subtotal * 0.1);
}

// Calculate "Buy 2 Get 1 Free" discount for all products including sets (Stainless site only)
function getBuy2Get1FreeDiscount() {
  // Get all cart items, expanding by quantity
  const allItems = [];
  cart.forEach(item => {
    if (!item || !item.price) return;
    
    // Add item for each quantity
    for (let i = 0; i < (item.quantity || 1); i++) {
      allItems.push({
        price: item.price,
        title: item.title,
        type: item.type
      });
    }
  });
  
  // If we have fewer than 3 items, no discount
  if (allItems.length < 3) {
    return 0;
  }
  
  // Sort by price (lowest first) to make the cheapest items free
  allItems.sort((a, b) => (a.price || 0) - (b.price || 0));
  
  // For every 3 items, make the cheapest one free
  let discount = 0;
  const numGroups = Math.floor(allItems.length / 3);
  
  for (let group = 0; group < numGroups; group++) {
    // The first item in each group of 3 is the free one (after sorting by price)
    const freeItem = allItems[group * 3];
    if (freeItem && freeItem.price) {
      discount += freeItem.price;
    }
  }
  
  return discount;
}

function setPromoMessage(message, isSuccess = false) {
  const promoMessage = document.getElementById('promoMessage');
  if (!promoMessage) return;

  promoMessage.textContent = message || '';
  promoMessage.style.color = isSuccess ? '#2ecc71' : '#ff7b7b';
}

async function isPromoUsedByPhone(promoCode, phone) {
  const { data, error } = await supabaseClient
    .from('coupon_redemptions')
    .select('id')
    .eq('coupon_code', promoCode)
    .eq('phone', phone)
    .limit(1);

  if (error) {
    throw error;
  }

  return Array.isArray(data) && data.length > 0;
}

async function applyPromoCode() {
  const promoInput = document.getElementById('promoInput');
  const phone = document.getElementById('buyerPhone')?.value.trim() || '';
  const code = normalizePromoCode(promoInput?.value);

  await loadPromoCodes();

  if (!code) {
    setPromoMessage('Enter a promo code first.');
    return;
  }

  if (availablePromoCodes.length === 0) {
    appliedPromoCode = '';
    setPromoMessage('No promo codes are currently available.');
    updateCartSummary();
    return;
  }

  if (!phone) {
    setPromoMessage('Enter your phone number first so the coupon can be checked.');
    return;
  }

  if (!availablePromoCodes.includes(code)) {
    appliedPromoCode = '';
    setPromoMessage('Invalid promo code.');
    updateCartSummary();
    return;
  }

  try {
    const usedBefore = await isPromoUsedByPhone(code, phone);
    if (usedBefore) {
      appliedPromoCode = '';
      setPromoMessage('This promo code was already used with this phone number.');
      updateCartSummary();
      return;
    }
  } catch (error) {
    console.warn('Promo usage verification skipped:', error);
  }

  appliedPromoCode = code;
  setPromoMessage(`Promo code ${code} applied. You saved 10%.`, true);
  updateCartSummary();
}

// Utility functions
function handleAddToCart(product) {
  if (product.type === 'ring') {
    if (window.openSizeModal) window.openSizeModal(product);
  } else {
    if (window.addToCart) window.addToCart(product, 1);
  }
}

function handleAddToCartFromCard(button) {
  const card = button.closest('.product-card');
  const productData = card.getAttribute('data-product');
  const product = JSON.parse(productData);
  handleAddToCart(product);
}

function handleTabChange(tab) {
  activeTab = tab;
  activeFilter = 'all';
  showExpandedView = false;
  renderApp();
}

function handleFilterChange(filter) {
  activeFilter = filter;
  showExpandedView = false;
  renderApp();
}

function handleShowMore() {
  showExpandedView = true;
  renderApp();
}

function handleCloseExpanded() {
  showExpandedView = false;
  renderApp();
}

function handleSearchChange(value) {
  searchTerm = value;
  renderApp();
}

function handleSearchItemClick(product) {
  searchTerm = product.title;
  renderApp();
  // Scroll to product
  setTimeout(() => {
    const productElement = document.querySelector(`[data-product-id="${product.id}"]`);
    if (productElement) {
      productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      productElement.classList.add('highlight');
      setTimeout(() => productElement.classList.remove('highlight'), 2000);
    }
  }, 100);
}

function handleClearSearch() {
  searchTerm = '';
  renderApp();
}

// HTML generation functions
function generateProductCard(product) {
  const priceMaterial = product.material || window.pageMaterial || null;
  const priceAttrs = `${priceMaterial ? ' data-live-price="' + priceMaterial + '"' : ''}${product.weight ? ' data-weight="' + product.weight + '"' : ''}`;

  return `
    <div class="product-card" data-product-id="${product.id}" data-product='${JSON.stringify(product)}'>
      <div class="product-image">
        <img src="${product.img}" alt="${product.title}" />
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.title}</h3>
        <p class="product-description">${product.desc}</p>
        <div class="product-price">
          <span class="price"${priceAttrs}>EGP ${product.price}</span>
        </div>
        <button class="btn add-to-cart-btn" onclick="handleAddToCartFromCard(this)">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

function generateCollectionTabs() {
  const tabs = [
    { id: 'women', label: 'Women', icon: '👩' },
    { id: 'men', label: 'Men', icon: '👨' }
  ];

  return `
    <div class="collection-tabs">
      ${tabs.map(tab => `
        <button
          class="tab-btn ${activeTab === tab.id ? 'active' : ''}"
          onclick="handleTabChange('${tab.id}')"
        >
          <span class="tab-icon">${tab.icon}</span>
          <span class="tab-label">${tab.label}</span>
        </button>
      `).join('')}
    </div>
  `;
}

function generateSubcategoryFilters() {
  const filters = {
    women: [
      { id: 'all', label: 'All Women', icon: '💍' },
      { id: 'necklaces', label: 'Necklaces', icon: '📿' },
      { id: 'bracelets', label: 'Bracelets', icon: '💍' },
      { id: 'rings', label: 'Rings', icon: '💍' },
      { id: 'sets', label: 'Sets', icon: '✨' }
    ],
    men: [
      { id: 'all', label: 'All Men', icon: '💍' },
      { id: 'bracelets', label: 'Bracelets', icon: '💍' },
      { id: 'rings', label: 'Rings', icon: '💍' },
      { id: 'necklaces', label: 'Necklaces', icon: '📿' },
      { id: 'sets', label: 'Sets', icon: '✨' }
    ]
  };

  const currentFilters = filters[activeTab] || [];

  return `
    <div class="subcategory-filters">
      ${currentFilters.map(filter => `
        <button
          class="filter-btn ${activeFilter === filter.id ? 'active' : ''}"
          onclick="handleFilterChange('${filter.id}')"
        >
          <span class="filter-icon">${filter.icon}</span>
          <span class="filter-label">${filter.label}</span>
        </button>
      `).join('')}
    </div>
  `;
}

function generateProductGrid(products) {
  const displayProducts = showExpandedView ? products : products.slice(0, 8);

  return `
    <div class="product-grid-section">
      <div class="desktop-grid product-grid">
        ${displayProducts.map(product => generateProductCard(product)).join('')}
      </div>
      <div class="mobile-slider">
        <div class="product-slider">
          ${displayProducts.map(product => generateProductCard(product)).join('')}
        </div>
      </div>
      ${!showExpandedView && products.length > 8 ? `
        <div class="show-more-container">
          <button class="btn show-more-btn" onclick="handleShowMore()">
            See More Products
          </button>
        </div>
      ` : ''}
    </div>
    ${showExpandedView ? `
      <div class="expanded-modal-overlay" onclick="handleCloseExpanded()">
        <div class="expanded-modal" onclick="event.stopPropagation()">
          <button class="modal-close" onclick="handleCloseExpanded()">×</button>
          <div class="expanded-grid">
            ${products.map(product => generateProductCard(product)).join('')}
          </div>
        </div>
      </div>
    ` : ''}
  `;
}

function generateSearchDropdown(searchResults) {
  if (searchTerm.length === 0 || searchResults.length === 0) return '';

  return `
    <div class="search-dropdown">
      ${searchResults.map(product => `
        <div class="search-item" onclick="handleSearchItemClick(${JSON.stringify(product).replace(/"/g, '&quot;')})">
          <div class="search-item-image">
            <img src="${product.img}" alt="${product.title}" />
          </div>
          <div class="search-item-info">
            <div class="search-item-title">${product.title}</div>
            <div class="search-item-price"${product.material || window.pageMaterial ? ' data-live-price="' + (product.material || window.pageMaterial) + '"' : ''}${product.weight ? ' data-weight="' + product.weight + '"' : ''}>EGP ${product.price}</div>
            <div class="search-item-type">${product.gender} • ${product.type}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function generateAppHTML(layout = 'full') {
  // Filter products
  const filteredProducts = stainlessProducts.filter(product => {
    const matchesGender = activeTab === 'women' ? product.gender === 'Women' : product.gender === 'Men';
    const matchesFilter = activeFilter === 'all' || product.type === activeFilter.slice(0, -1);
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGender && matchesFilter && matchesSearch;
  });

  const searchResults = searchTerm.length > 0
    ? stainlessProducts.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.desc.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8)
    : [];

  if (layout === 'collections-only') {
    return `
      <div class="stainless-app">
        <section id="collections" class="collections-section container">
          <div class="section-header">
            <h2>Stainless Steel Collection</h2>
            <p>Discover our most beloved stainless steel pieces, carefully selected for their durability and style</p>
          </div>
          ${generateCollectionTabs()}
          ${generateSubcategoryFilters()}
          ${generateProductGrid(filteredProducts)}
        </section>
        <section class="cta-section">
          <div class="container">
            <h2>Ready to Find Your Perfect Stainless Steel Piece?</h2>
            <p>Browse our complete stainless steel collection and discover jewelry that combines durability with style</p>
            <a class="btn" href="#collections">Shop Now</a>
          </div>
        </section>
      </div>
    `;
  }

  return `
    <div class="stainless-app">
      <div class="search-container">
        <input
          type="text"
          placeholder="Search products..."
          value="${searchTerm}"
          oninput="handleSearchChange(this.value)"
          class="search-input"
        />
        <button class="search-clear" onclick="handleClearSearch()">×</button>
        ${generateSearchDropdown(searchResults)}
      </div>

      <section class="hero">
        <div class="hero-inner container">
          <div class="hero-text">
            <h1>Stainless Steel Excellence</h1>
            <p>Discover durable, hypoallergenic jewelry that combines modern design with lasting quality. Perfect for everyday elegance and active lifestyles.</p>
            <a class="btn" href="#collections">Explore Collections</a>
          </div>
          <div class="hero-image">
            <img src="/Vector logo.svg" alt="Duha's Jewellery - Premium stainless steel jewelry collection" />
          </div>
        </div>
      </section>

      <section class="trust-badges">
        <div class="container">
          <h2>Why Choose Stainless Steel</h2>
          <p>Experience the perfect blend of durability, style, and affordability</p>
          <div class="trust-grid">
            <div class="trust-item">
              <span class="icon">🔒</span>
              <h3>Hypoallergenic</h3>
              <p>Safe for sensitive skin with no nickel content</p>
            </div>
            <div class="trust-item">
              <span class="icon">💪</span>
              <h3>Durable Quality</h3>
              <p>Resistant to corrosion and maintains its shine</p>
            </div>
            <div class="trust-item">
              <span class="icon">💰</span>
              <h3>Affordable Luxury</h3>
              <p>Premium design at accessible price points</p>
            </div>
            <div class="trust-item">
              <span class="icon">👌</span>
              <h3>Modern Styles</h3>
              <p>Premium stainless steel jewelry specially designed for you</p>
            </div>
          </div>
        </div>
      </section>

      <section class="shipping-section">
        <div class="container">
          <h2>Shipping & Delivery</h2>
          <p>Your beautiful jewelry delivered with care and precision</p>
          <div class="shipping-grid">
            <div class="shipping-item">
              <span class="icon">📦</span>
              <h3>Free Shipping</h3>
              <p>Complimentary delivery across all of Egypt on every order</p>
            </div>
            <div class="shipping-item">
              <span class="icon">⚡</span>
              <h3>Fast Delivery</h3>
              <p>Receive your order within 2-4 business days after placement</p>
            </div>
            <div class="shipping-item">
              <span class="icon">🛡️</span>
              <h3>Secure Packaging</h3>
              <p>Each piece is carefully packaged to ensure safe arrival</p>
            </div>
          </div>
        </div>
      </section>

      <section class="brand-story">
        <div class="container">
          <div class="brand-story-content">
            <h2>Our Story</h2>
            <p>Duha's Jewellery was born from a passion for creating timeless pieces that celebrate individuality and elegance. What started as a small workshop has grown into a brand dedicated to crafting stainless steel jewelry that combines modern design with exceptional quality.</p>
            <p>Every piece in our collection tells a story of craftsmanship, attention to detail, and the joy of wearing something truly special. We believe that jewelry should be as unique as the person wearing it.</p>
            <div class="quote">"Elegance is not about being noticed, it's about being remembered."</div>
          </div>
          <div class="brand-story-image">
            <img src="/Vector logo.svg" alt="Duha's Jewellery craftsmanship" />
          </div>
        </div>
      </section>

      <section class="exchange-policy">
        <div class="container">
          <h2>Exchange & Return Policy</h2>
          <p>We stand behind the quality of our jewelry with our straightforward policy</p>
          <div class="policy-grid">
            <div class="policy-item">
              <span class="icon">🔄</span>
              <h3>Exchange</h3>
              <p>Exchange for a different size or style within 7 days of delivery</p>
            </div>
            <div class="policy-item">
              <span class="icon">↩️</span>
              <h3>Return</h3>
              <p>Return items with manufacturing defects or damage before use</p>
            </div>
            <div class="policy-item">
              <span class="icon">💬</span>
              <h3>Contact Us</h3>
              <p>Reach out via WhatsApp or DM for any concerns or questions</p>
            </div>
          </div>
        </div>
      </section>

      <section id="collections" class="collections-section container">
        <div class="section-header">
          <h2>Stainless Steel Collection</h2>
          <p>Discover our most beloved stainless steel pieces, carefully selected for their durability and style</p>
        </div>
        ${generateCollectionTabs()}
        ${generateSubcategoryFilters()}
        ${generateProductGrid(filteredProducts)}
      </section>

      <section class="cta-section">
        <div class="container">
          <h2>Ready to Find Your Perfect Stainless Steel Piece?</h2>
          <p>Browse our complete stainless steel collection and discover jewelry that combines durability with style</p>
          <a class="btn" href="#collections">Shop Now</a>
        </div>
      </section>
    </div>
  `;
}

function renderApp() {
  const appRoot = document.getElementById('stainless-react-root');
  if (appRoot) {
    const layoutMode = appRoot.dataset.layout || 'full';
    appRoot.innerHTML = generateAppHTML(layoutMode);
    if (window.applyLivePrices) {
      window.applyLivePrices();
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await loadStainlessProducts();
  subscribeToProductUpdates();
  await loadPromoCodes();
  if (window.loadLivePrices) {
    window.loadLivePrices();
  }
});

// Make functions global so they can be called from HTML
window.handleAddToCart = handleAddToCart;
window.handleAddToCartFromCard = handleAddToCartFromCard;
window.handleTabChange = handleTabChange;
window.handleFilterChange = handleFilterChange;
window.handleShowMore = handleShowMore;
window.handleCloseExpanded = handleCloseExpanded;
window.handleSearchChange = handleSearchChange;
window.handleSearchItemClick = handleSearchItemClick;
window.handleClearSearch = handleClearSearch;

// ============ CART FUNCTIONALITY ============
// Cart state management - reuse the global cart from script.js
// let cart = []; // REMOVED: using the global cart from script.js instead
let selectedRingProduct = null;
let selectedRingSize = null;

// Shipping costs per governorate (in EGP)
const shippingCosts = {
  // Cairo & Giza: 120
  'Cairo': 120,
  'Giza': 120,
  
  // Alexandria & Beheira: 130
  'Alexandria': 130,
  'Beheira': 130,
  
  // Delta & Canal: 140
  'Dakahlia': 140,
  'Gharbia': 140,
  'Kafr el Sheikh': 140,
  'Sharqia': 140,
  'Damietta': 140,
  'Port Said': 140,
  'Ismailia': 140,
  'Suez': 140,
  'Monufia': 140,
  'Qalyubia': 140,
  
  // Near Upper (Fayoum, Beni Suef, Minya, Assiut, Sohag): 150
  'Fayoum': 150,
  'Beni Suef': 150,
  'Minya': 150,
  'Assiut': 150,
  'Sohag': 150,
  
  // Far Upper & Matrouh (Qena, Luxor, Red Sea, Matrouh, Aswan): 160
  'Qena': 160,
  'Luxor': 160,
  'Red Sea': 160,
  'Matrouh': 160,
  'Aswan': 160,
  
  // Sinai & New Valley: 190
  'North Sinai': 190,
  'South Sinai': 190,
  'New Valley': 190
};

const INSTAPAY_NUMBER = '01212820666';
const EWALLET_NUMBER = '01101163565';

function updatePaymentInstructions() {
  const paymentInstructionsEl = document.getElementById('paymentInstructions');
  const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked')?.value;

  if (!paymentInstructionsEl) return;

  if (selectedPayment === 'Instapay' || selectedPayment === 'E-Wallet') {
    const subtotal = getCartSubtotal();
    const government = document.getElementById('buyerGovernment')?.value || '';
    const shipping = shippingCosts[government] || 0;
    const promoDiscount = getPromoDiscountAmount(subtotal);
    const buy2Get1Discount = getBuy2Get1FreeDiscount();
    const totalDiscount = promoDiscount + buy2Get1Discount;
    const total = subtotal - totalDiscount + shipping;
    const deposit = total * 0.3;
    const paymentLabel = selectedPayment === 'E-Wallet' ? 'E-Wallet' : 'Instapay';
    const transferNumber = selectedPayment === 'E-Wallet' ? EWALLET_NUMBER : INSTAPAY_NUMBER;

    paymentInstructionsEl.style.display = 'block';
    paymentInstructionsEl.innerHTML = `To secure your order and proceed with preparation, a 30% deposit via ${paymentLabel} is required as confirmation.<br><br>Required deposit total (30%): <span class="deposit-chip">EGP ${deposit.toFixed(2)}</span><br>Please transfer the amount to the following number:<br><strong>${transferNumber}</strong>.<br><br>Kindly note that orders are only confirmed and scheduled after the deposit is received.<br><br>Once the transfer is completed, please share a screenshot to finalize your order and start processing immediately.`;
    return;
  }

  paymentInstructionsEl.style.display = 'none';
  paymentInstructionsEl.innerHTML = '';
}

// Add product to cart
function addToCart(product, quantity, size = null) {
  const cartItem = {
    id: product.id,
    title: product.title,
    price: product.price,
    img: product.img,
    quantity: quantity,
    size: size,
    type: product.type
  };
  
  // Check if item with same specs already exists
  const existingIndex = cart.findIndex(item => 
    item.id === product.id && item.size === size
  );
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push(cartItem);
  }
  
  updateCartUI();
  showNotification(`${product.title} added to cart!`);
}

// Update cart UI
function updateCartUI() {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById('cartCount').textContent = cartCount;
  
  const cartItemsContainer = document.getElementById('cartItems');
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    updateCartSummary();
    return;
  }
  
  cartItemsContainer.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.title}" class="cart-item-image" />
      <div class="cart-item-details">
        <h4>${item.title}</h4>
        ${item.size ? `<p class="cart-item-size">Size: ${item.size}</p>` : ''}
        <p class="cart-item-price">EGP ${item.price}</p>
      </div>
      <div class="cart-item-quantity">
        <button onclick="updateQuantity(${index}, -1)">−</button>
        <input type="number" value="${item.quantity}" min="1" onchange="setQuantity(${index}, this.value)" />
        <button onclick="updateQuantity(${index}, 1)">+</button>
      </div>
      <div class="cart-item-total">EGP ${item.price * item.quantity}</div>
      <button class="cart-item-remove" onclick="removeFromCart(${index})">🗑</button>
    </div>
  `).join('');
  
  updateCartSummary();
}

// Update quantity
function updateQuantity(index, change) {
  const newQuantity = cart[index].quantity + change;
  if (newQuantity > 0) {
    cart[index].quantity = newQuantity;
  } else {
    removeFromCart(index);
    return;
  }
  updateCartUI();
}

// Set quantity directly
function setQuantity(index, value) {
  const qty = parseInt(value) || 1;
  if (qty > 0) {
    cart[index].quantity = qty;
    updateCartUI();
  }
}

// Remove item from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

// Update cart summary (totals)
function updateCartSummary() {
  const subtotal = getCartSubtotal();
  const government = document.getElementById('buyerGovernment').value;
  const shipping = shippingCosts[government] || 0;
  const promoDiscount = getPromoDiscountAmount(subtotal);
  const buy2Get1Discount = getBuy2Get1FreeDiscount();
  const totalDiscount = promoDiscount + buy2Get1Discount;
  const total = subtotal - totalDiscount + shipping;
  
  document.getElementById('cartSubtotal').textContent = `EGP ${subtotal}`;
  const discountElement = document.getElementById('cartDiscount');
  if (discountElement) {
    let discountText = '- EGP ' + totalDiscount;
    if (buy2Get1Discount > 0) {
      discountText += ` (Buy 2 Get 1 Free: EGP ${buy2Get1Discount}`;
      if (promoDiscount > 0) {
        discountText += ` + Promo: EGP ${promoDiscount}`;
      }
      discountText += ')';
    }
    discountElement.textContent = discountText;
  }
  document.getElementById('cartShipping').textContent = `EGP ${shipping}`;
  document.getElementById('cartTotal').textContent = `EGP ${total}`;
  updatePaymentInstructions();
}

// Open cart panel
function openCartPanel() {
  const cartPanel = document.getElementById('cartPanel');
  cartPanel.setAttribute('aria-hidden', 'false');
  updateCartUI();
}

// Close cart panel
function closeCartPanel() {
  const cartPanel = document.getElementById('cartPanel');
  cartPanel.setAttribute('aria-hidden', 'true');
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// ============ SIZE MODAL FUNCTIONALITY ============
const availableSizes = ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];

function openSizeModal(product) {
  selectedRingProduct = product;
  selectedRingSize = null;
  
  const sizeModal = document.getElementById('sizeModal');
  const sizeOptions = document.getElementById('sizeOptions');
  
  sizeOptions.innerHTML = availableSizes.map(size => `
    <button class="size-option" onclick="selectSize('${size}')">${size}</button>
  `).join('');
  
  sizeModal.setAttribute('aria-hidden', 'false');
  
  // Reset selected size text
  document.getElementById('selectedSizeText').textContent = 'No size selected';
  
  // Remove any existing add button
  const existingBtn = document.querySelector('.size-modal-add-btn');
  if (existingBtn) {
    existingBtn.remove();
  }
}

function closeSizeModal() {
  const sizeModal = document.getElementById('sizeModal');
  sizeModal.setAttribute('aria-hidden', 'true');
  selectedRingProduct = null;
  selectedRingSize = null;
}

function selectSize(size) {
  selectedRingSize = size;
  
  // Update UI to show selected size
  document.querySelectorAll('.size-option').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.classList.add('selected');
  
  document.getElementById('selectedSizeText').textContent = `Size ${size} selected`;
  
  // Add to cart button behavior
  const existingBtn = document.querySelector('.size-modal-add-btn');
  if (!existingBtn) {
    const btn = document.createElement('button');
    btn.className = 'size-modal-add-btn';
    btn.textContent = 'Add to Cart';
    btn.onclick = () => {
      if (selectedRingSize && selectedRingProduct) {
        addToCart(selectedRingProduct, 1, selectedRingSize);
        closeSizeModal();
      }
    };
    document.querySelector('.selected-size-display').appendChild(btn);
  }
}

function toggleSizeGuide() {
  const guide = document.getElementById('sizeGuide');
  guide.style.display = guide.style.display === 'none' ? 'block' : 'none';
}

// ============ CHECKOUT FUNCTIONALITY ============
function createCheckoutMessage() {
  const name = document.getElementById('buyerName')?.value.trim() || '';
  const phone = document.getElementById('buyerPhone').value.trim();
  const phone2 = document.getElementById('buyerPhone2').value.trim();
  const government = document.getElementById('buyerGovernment').value.trim();
  const address = document.getElementById('buyerAddress').value.trim();
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  
  if (!name || !phone || !government || !address || !paymentMethod) {
    alert('Please fill in all required fields');
    return null;
  }
  
  const subtotal = getCartSubtotal();
  const shipping = shippingCosts[government] || 0;
  const promoDiscount = getPromoDiscountAmount(subtotal);
  const buy2Get1Discount = getBuy2Get1FreeDiscount();
  const totalDiscount = promoDiscount + buy2Get1Discount;
  const total = subtotal - totalDiscount + shipping;
  
  let message = `*Duha's Jewellery Order*\n\n`;
  message += `*Customer Info:*\n`;
  message += `Name: ${name}\n`;
  message += `Phone: ${phone}\n`;
  if (phone2) message += `Alt Phone: ${phone2}\n`;
  message += `Government: ${government}\n`;
  message += `Address: ${address}\n\n`;
  
  message += `*Order Items:*\n`;
  cart.forEach(item => {
    message += `• ${item.title}${item.size ? ' (Size ' + item.size + ')' : ''} x${item.quantity} = EGP ${item.price * item.quantity}\n`;
  });
  
  message += `\n*Summary:*\n`;
  message += `Subtotal: EGP ${subtotal}\n`;
  if (buy2Get1Discount > 0) {
    message += `Buy 2 Get 1 Free: - EGP ${buy2Get1Discount}\n`;
  }
  if (promoDiscount > 0) {
    message += `Promo Discount: - EGP ${promoDiscount}\n`;
  }
  message += `Shipping: EGP ${shipping}\n`;
  message += `Total: EGP ${total}\n`;
  message += `Payment Method: ${paymentMethod}`;
  
  return encodeURIComponent(message);
}

async function saveCheckoutData() {
  if (typeof supabaseClient === 'undefined') {
    throw new Error('Database connection is not available.');
  }

  const name = document.getElementById('buyerName')?.value.trim() || '';
  const phone = document.getElementById('buyerPhone').value.trim();
  const phone2 = document.getElementById('buyerPhone2').value.trim();
  const government = document.getElementById('buyerGovernment').value.trim();
  const address = document.getElementById('buyerAddress').value.trim();
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  if (!name || !phone || !government || !address || !paymentMethod) {
    throw new Error('Please fill in all required fields.');
  }

  if (cart.length === 0) {
    throw new Error('Your cart is empty.');
  }

  const subtotal = getCartSubtotal();
  const shipping = shippingCosts[government] || 0;
  const promoDiscount = getPromoDiscountAmount(subtotal);
  const buy2Get1Discount = getBuy2Get1FreeDiscount();
  const totalDiscount = promoDiscount + buy2Get1Discount;
  const total = subtotal - totalDiscount + shipping;

  if (appliedPromoCode) {
    try {
      const usedBefore = await isPromoUsedByPhone(appliedPromoCode, phone);
      if (usedBefore) {
        throw new Error('This promo code was already used with this phone number.');
      }
    } catch (error) {
      if (error?.message === 'This promo code was already used with this phone number.') {
        throw error;
      }

      console.warn('Promo usage verification skipped during checkout:', error);
    }
  }

  const orderPayload = {
    name,
    government,
    address,
    phone,
    alternative_phone: phone2 || null,
    payment_method: paymentMethod,
    coupon_code: appliedPromoCode || null,
    subtotal,
    discount_amount: totalDiscount,
    shipping,
    total,
    items: cart,
    status: 'pending'
  };

  // attach authenticated user id to satisfy RLS policies (allow guests)
  const authDebug = await getAuthDebug?.();
  console.debug('Stainless order insert debug - auth', authDebug, 'payloadBefore=', orderPayload);
  const userId = await getCurrentUserId?.();
  if (userId) {
    orderPayload.user_id = userId;
  } else {
    orderPayload.user_id = null;
    console.info('Placing stainless order as guest (no user_id attached).');
  }

  const { error } = await supabaseClient
    .from('customer_orders')
    .insert(Object.fromEntries(Object.entries(orderPayload).filter(([_, v]) => v !== undefined && v !== '')));

  if (error) {
    throw error;
  }

  if (appliedPromoCode) {
  const redemptionPayload = {
    coupon_code: appliedPromoCode,
    phone,
    created_at: new Date().toISOString()
  };

  const cleanRedemption = Object.fromEntries(Object.entries(redemptionPayload).filter(([_, v]) => v !== undefined && v !== ''));
  const { error: redemptionError } = await supabaseClient
    .from('coupon_redemptions')
    .insert(cleanRedemption);

  if (redemptionError) {
      if (String(redemptionError.code || '') === '23505') {
        throw new Error('This promo code was already used with this phone number.');
      }

      if (!isPromoValidationSkippableError(redemptionError)) {
        throw redemptionError;
      }

      console.warn('Promo redemption logging skipped:', redemptionError);
  }
}
}

async function checkout() {
  const message = createCheckoutMessage();
  if (!message) return;

  try {
    await saveCheckoutData();
  } catch (error) {
    alert(error.message || 'Could not save your order. Please try again.');
    console.error('Checkout save failed:', error);
    return;
  }
  
  const whatsappNumber = '201101163565'; // Without + or 00
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
  window.open(whatsappURL, '_blank');
}

// ============ EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded', () => {
  // Cart button
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', openCartPanel);
  }
  
  // Cart close button
  const cartClose = document.getElementById('cartClose');
  if (cartClose) {
    cartClose.addEventListener('click', closeCartPanel);
  }
  
  // Cart panel close on overlay click
  const cartPanel = document.getElementById('cartPanel');
  if (cartPanel) {
    cartPanel.addEventListener('click', function(e) {
      if (e.target === this) closeCartPanel();
    });
  }
  
  // Checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', checkout);
  }

  const promoApplyBtn = document.getElementById('promoApplyBtn');
  if (promoApplyBtn) {
    promoApplyBtn.addEventListener('click', applyPromoCode);
  }
  
  // Size modal close on overlay click
  const sizeModal = document.getElementById('sizeModal');
  if (sizeModal) {
    const overlay = sizeModal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeSizeModal);
    }
  }
  
  // Government change - update shipping cost
  const governmentInput = document.getElementById('buyerGovernment');
  if (governmentInput) {
    governmentInput.addEventListener('change', updateCartSummary);
  }

  document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
    radio.addEventListener('change', updatePaymentInstructions);
  });

  updatePaymentInstructions();

  const phoneInput = document.getElementById('buyerPhone');
  if (phoneInput) {
    phoneInput.addEventListener('change', () => {
      if (appliedPromoCode) {
        setPromoMessage('Re-check the promo code after updating the phone number.');
      }
      updateCartSummary();
    });
  }
  
  // Set current year in footer
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

// Make new functions global
window.addToCart = addToCart;
window.openSizeModal = openSizeModal;
window.closeSizeModal = closeSizeModal;
window.toggleSizeGuide = toggleSizeGuide;
window.updateQuantity = updateQuantity;
window.setQuantity = setQuantity;
window.removeFromCart = removeFromCart;
window.openCartPanel = openCartPanel;
window.closeCartPanel = closeCartPanel;
window.selectSize = selectSize;
window.checkout = checkout;