// Stainless Steel Collection - Supabase Integration
// State management
let activeTab = 'women';
let activeFilter = 'all';
let searchTerm = '';
let showExpandedView = false;
let stainlessProducts = [];
let availablePromoCodes = [];
let appliedPromoCode = '';
let loyaltyProgramState = null;
let loyaltyPhoneKey = '';
let loyaltyAvailablePoints = 0;
let loyaltyRedeemPoints = 0;
let discountRules = [];
let discountCountdownTimerId = null;
let openedSourceCard = null;
let storefrontAutoRefreshTimerId = null;
let storefrontRefreshInFlight = false;
let storefrontRealtimeRefreshDebounceId = null;

const FIRST_ORDER_COUPON_CODE = 'FIRSTORDER';
const LOYALTY_SETTING_KEY = 'loyalty_program_state';
const LOYALTY_DISCOUNT_PER_1000_POINTS = 100;
const STOREFRONT_AUTO_REFRESH_INTERVAL_MS = 60000;

function normalizeDiscountType(type) {
  return String(type || '').trim().toLowerCase().replace(/s$/, '');
}

function parseDiscountRules(rawValue) {
  if (!rawValue) {
    return [];
  }

  let parsed = rawValue;
  if (typeof rawValue === 'string') {
    try {
      parsed = JSON.parse(rawValue);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .filter(rule => rule && rule.active !== false)
    .map(rule => ({
      scope: rule.scope === 'category' ? 'category' : 'product',
      productId: rule.productId != null ? String(rule.productId) : null,
      material: rule.material ? String(rule.material).trim().toLowerCase() : null,
      category: rule.category ? normalizeDiscountType(rule.category) : null,
      gender: rule.gender ? String(rule.gender).trim().toLowerCase() : null,
      startAt: rule.startAt || null,
      endAt: rule.endAt || null,
      percent: Number(rule.percent || 0)
    }))
    .filter(rule => rule.percent > 0 && rule.percent <= 90);
}

function isDiscountRuleActiveNow(rule) {
  if (!rule) return false;

  const now = Date.now();
  const startTime = rule.startAt ? new Date(rule.startAt).getTime() : null;
  const endTime = rule.endAt ? new Date(rule.endAt).getTime() : null;

  if (startTime && !Number.isNaN(startTime) && startTime > now) {
    return false;
  }

  if (endTime && !Number.isNaN(endTime) && endTime < now) {
    return false;
  }

  return true;
}

async function loadDiscountRules() {
  if (typeof supabaseClient === 'undefined') return;

  const { data, error } = await supabaseClient
    .from('site_settings')
    .select('value')
    .eq('key', 'discount_rules')
    .maybeSingle();

  if (error) {
    console.error('Failed to load discount rules:', error);
    discountRules = [];
    return;
  }

  discountRules = parseDiscountRules(data?.value);
}

function getDiscountPercentForProduct(product) {
  const productId = String(product?.id || '');
  const normalizedType = normalizeDiscountType(product?.type || product?.category);

  const activeRules = discountRules.filter(isDiscountRuleActiveNow);

  const productRules = activeRules.filter(rule => rule.scope === 'product' && String(rule.productId || '') === productId);
  if (productRules.length > 0) {
    return Math.max(...productRules.map(rule => Number(rule.percent || 0)));
  }

  const categoryRules = activeRules.filter(rule => rule.scope === 'category' && normalizeDiscountType(rule.category) === normalizedType);
  if (categoryRules.length > 0) {
    return Math.max(...categoryRules.map(rule => Number(rule.percent || 0)));
  }

  return 0;
}

function getRuleScopePriority(rule) {
  return rule?.scope === 'product' ? 2 : 1;
}

function formatCountdownDistance(targetTimeMs) {
  const diffMs = Math.max(0, targetTimeMs - Date.now());
  const totalMinutes = Math.ceil(diffMs / 60000);

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const totalHours = Math.ceil(totalMinutes / 60);
  if (totalHours < 24) {
    return `${totalHours}h`;
  }

  const totalDays = Math.ceil(totalHours / 24);
  return `${totalDays}d`;
}

function getDiscountContextForProduct(product) {
  const productId = String(product?.id || '');
  const normalizedType = normalizeDiscountType(product?.type || product?.category);
  const normalizedGender = String(product?.gender || '').trim().toLowerCase();
  const normalizedMaterial = String(product?.material || '').trim().toLowerCase();

  const matchedRules = discountRules.filter((rule) => {
    if (rule.scope === 'product') {
      return String(rule.productId || '') === productId;
    }
    if (rule.scope === 'category') {
      const categoryMatches = normalizeDiscountType(rule.category) === normalizedType;
      if (!categoryMatches) return false;

      if (rule.material && String(rule.material).toLowerCase() !== normalizedMaterial) {
        return false;
      }

      if (!rule.gender) return true;
      return String(rule.gender).toLowerCase() === normalizedGender;
    }
    return false;
  });

  const activeRules = matchedRules.filter(isDiscountRuleActiveNow);

  let selectedActiveRule = null;
  if (activeRules.length > 0) {
    selectedActiveRule = activeRules
      .slice()
      .sort((a, b) => {
        const percentDiff = Number(b.percent || 0) - Number(a.percent || 0);
        if (percentDiff !== 0) return percentDiff;
        return getRuleScopePriority(b) - getRuleScopePriority(a);
      })[0];
  }

  let discountPercent = 0;
  let countdownLabel = '';
  let countdownType = '';

  if (selectedActiveRule) {
    discountPercent = Number(selectedActiveRule.percent || 0);
    if (selectedActiveRule.endAt) {
      const endTimeMs = new Date(selectedActiveRule.endAt).getTime();
      if (!Number.isNaN(endTimeMs) && endTimeMs > Date.now()) {
        countdownLabel = `Ends in ${formatCountdownDistance(endTimeMs)}`;
        countdownType = 'ending';
      }
    }
  } else {
    const upcomingRules = matchedRules
      .filter((rule) => {
        if (!rule.startAt) return false;
        const startMs = new Date(rule.startAt).getTime();
        return !Number.isNaN(startMs) && startMs > Date.now();
      })
      .sort((a, b) => {
        const scopeDiff = getRuleScopePriority(b) - getRuleScopePriority(a);
        if (scopeDiff !== 0) return scopeDiff;
        const aStart = new Date(a.startAt).getTime();
        const bStart = new Date(b.startAt).getTime();
        return aStart - bStart;
      });

    const nextRule = upcomingRules[0];
    if (nextRule?.startAt) {
      const nextStartMs = new Date(nextRule.startAt).getTime();
      if (!Number.isNaN(nextStartMs) && nextStartMs > Date.now()) {
        countdownLabel = `Starts in ${formatCountdownDistance(nextStartMs)}`;
        countdownType = 'upcoming';
      }
    }
  }

  return {
    discountPercent,
    countdownLabel,
    countdownType
  };
}

function applyDiscountsToProducts(products) {
  return (products || []).map((product) => {
    const basePrice = Number(product?.basePrice ?? product?.price ?? 0);
    const discountContext = getDiscountContextForProduct(product);
    const discountPercent = Number(discountContext.discountPercent || 0);

    if (!discountPercent || basePrice <= 0) {
      return {
        ...product,
        basePrice,
        originalPrice: null,
        discountPercent: 0,
        countdownLabel: discountContext.countdownLabel || '',
        countdownType: discountContext.countdownType || ''
      };
    }

    const discountedPrice = Math.max(0, Math.round(basePrice * (1 - discountPercent / 100)));

    return {
      ...product,
      basePrice,
      originalPrice: basePrice,
      discountPercent,
      countdownLabel: discountContext.countdownLabel || '',
      countdownType: discountContext.countdownType || '',
      price: discountedPrice
    };
  });
}

function startDiscountCountdownTimer() {
  if (discountCountdownTimerId) return;

  discountCountdownTimerId = setInterval(() => {
    if (!stainlessProducts.length) return;
    stainlessProducts = applyDiscountsToProducts(stainlessProducts);
    renderApp();
  }, 60000);
}

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

  await loadDiscountRules();
  stainlessProducts = applyDiscountsToProducts(data || []);
  renderApp();
  startDiscountCountdownTimer();
}

async function refreshStorefrontData() {
  if (storefrontRefreshInFlight) return;
  storefrontRefreshInFlight = true;

  try {
    await loadStainlessProducts();
    await loadPromoCodes();
    await refreshLoyaltyForCurrentPhone();

    if (window.loadLivePrices) {
      window.loadLivePrices();
    }

    updateCartSummary();
  } catch (error) {
    console.error('Auto refresh failed:', error);
  } finally {
    storefrontRefreshInFlight = false;
  }
}

function queueStorefrontRealtimeRefresh() {
  if (storefrontRealtimeRefreshDebounceId) {
    clearTimeout(storefrontRealtimeRefreshDebounceId);
  }

  storefrontRealtimeRefreshDebounceId = setTimeout(() => {
    storefrontRealtimeRefreshDebounceId = null;
    refreshStorefrontData();
  }, 400);
}

function startStorefrontAutoRefresh() {
  if (storefrontAutoRefreshTimerId) return;

  storefrontAutoRefreshTimerId = setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    refreshStorefrontData();
  }, STOREFRONT_AUTO_REFRESH_INTERVAL_MS);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshStorefrontData();
    }
  });
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
    }, () => {
      queueStorefrontRealtimeRefresh();
    })
    .subscribe();

  supabaseClient
    .channel('discount_rules_settings')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'site_settings',
      filter: 'key=eq.discount_rules'
    }, () => {
      queueStorefrontRealtimeRefresh();
    })
    .subscribe();

  supabaseClient
    .channel('loyalty_settings')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'site_settings',
      filter: `key=eq.${LOYALTY_SETTING_KEY}`
    }, () => {
      queueStorefrontRealtimeRefresh();
    })
    .subscribe();

  supabaseClient
    .channel('promo_codes_settings')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'site_settings',
      filter: 'key=eq.promo_codes'
    }, () => {
      queueStorefrontRealtimeRefresh();
    })
    .subscribe();
}

function normalizePromoCode(code) {
  return String(code || '').trim().toUpperCase();
}

function normalizePhoneKey(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 11);
}

function parseLoyaltyProgramState(rawValue) {
  const emptyState = {
    accounts: {},
    awardedOrderIds: [],
    transactions: []
  };

  if (!rawValue) return emptyState;

  let parsed = rawValue;
  if (typeof rawValue === 'string') {
    try {
      parsed = JSON.parse(rawValue);
    } catch {
      return emptyState;
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return emptyState;
  }

  return {
    accounts: parsed.accounts && typeof parsed.accounts === 'object' ? parsed.accounts : {},
    awardedOrderIds: Array.isArray(parsed.awardedOrderIds) ? parsed.awardedOrderIds : [],
    transactions: Array.isArray(parsed.transactions) ? parsed.transactions : []
  };
}

async function upsertSiteSettingValue(key, value) {
  const payload = {
    key,
    value,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseClient
    .from('site_settings')
    .upsert(payload, { onConflict: 'key' });

  if (error) {
    throw error;
  }
}

async function loadLoyaltyProgramState() {
  const { data, error } = await supabaseClient
    .from('site_settings')
    .select('value')
    .eq('key', LOYALTY_SETTING_KEY)
    .maybeSingle();

  if (error) {
    console.warn('Failed to load loyalty state:', error);
    loyaltyProgramState = parseLoyaltyProgramState(null);
    return loyaltyProgramState;
  }

  loyaltyProgramState = parseLoyaltyProgramState(data?.value);
  return loyaltyProgramState;
}

function getLoyaltyAccountPoints(phoneKey) {
  if (!phoneKey) return 0;
  const rawPoints = loyaltyProgramState?.accounts?.[phoneKey]?.points;
  const points = Number(rawPoints || 0);
  return Number.isFinite(points) && points > 0 ? Math.floor(points) : 0;
}

function getFirstOrderCouponDiscountAmount(subtotal) {
  return Math.round(Number(subtotal || 0) * 0.1);
}

async function isFirstOrderEligible(phone) {
  const normalizedPhone = normalizePhoneKey(phone);
  if (!normalizedPhone) return false;

  const { data, error } = await supabaseClient
    .from('customer_orders')
    .select('id')
    .eq('phone', normalizedPhone)
    .limit(1);

  if (error) {
    throw error;
  }

  return !Array.isArray(data) || data.length === 0;
}

function getLoyaltyRedeemDiscountAmount(subtotalAfterPromo) {
  const sanitizedSubtotal = Math.max(0, Number(subtotalAfterPromo || 0));
  const sanitizedRedeemPoints = Math.max(0, Number(loyaltyRedeemPoints || 0));
  if (!sanitizedRedeemPoints || !sanitizedSubtotal) return 0;

  const baseDiscount = Math.floor(sanitizedRedeemPoints / 1000) * LOYALTY_DISCOUNT_PER_1000_POINTS;
  return Math.min(baseDiscount, sanitizedSubtotal);
}

function renderLoyaltyPanel() {
  const pointsEl = document.getElementById('loyaltyPointsValue');
  const moneyEl = document.getElementById('loyaltyMoneyValue');
  const redeemInput = document.getElementById('loyaltyRedeemInput');
  const summaryEl = document.getElementById('loyaltySummaryMessage');

  if (pointsEl) {
    pointsEl.textContent = String(loyaltyAvailablePoints || 0);
  }

  const maxMoney = Math.floor((Number(loyaltyAvailablePoints || 0) / 1000)) * LOYALTY_DISCOUNT_PER_1000_POINTS;
  if (moneyEl) {
    moneyEl.textContent = `EGP ${maxMoney}`;
  }

  if (redeemInput) {
    redeemInput.max = String(loyaltyAvailablePoints || 0);
    if (!redeemInput.value) {
      redeemInput.value = String(loyaltyRedeemPoints || 0);
    }
  }

  if (summaryEl) {
    if (!loyaltyPhoneKey) {
      summaryEl.textContent = `Enter your phone number to load loyalty points. First order coupon: ${FIRST_ORDER_COUPON_CODE}.`;
      summaryEl.style.color = '#8f7f6f';
    } else {
      summaryEl.textContent = `Every 1000 points gives EGP ${LOYALTY_DISCOUNT_PER_1000_POINTS} off. First order coupon: ${FIRST_ORDER_COUPON_CODE}.`;
      summaryEl.style.color = '#2c241d';
    }
  }
}

async function refreshLoyaltyForCurrentPhone() {
  const phone = normalizePhoneKey(document.getElementById('buyerPhone')?.value || '');
  loyaltyPhoneKey = phone;

  if (!phone) {
    loyaltyAvailablePoints = 0;
    loyaltyRedeemPoints = 0;
    const redeemInput = document.getElementById('loyaltyRedeemInput');
    if (redeemInput) redeemInput.value = '0';
    renderLoyaltyPanel();
    updateCartSummary();
    return;
  }

  await loadLoyaltyProgramState();
  loyaltyAvailablePoints = getLoyaltyAccountPoints(phone);

  if (loyaltyRedeemPoints > loyaltyAvailablePoints) {
    loyaltyRedeemPoints = Math.floor(loyaltyAvailablePoints / 1000) * 1000;
    const redeemInput = document.getElementById('loyaltyRedeemInput');
    if (redeemInput) redeemInput.value = String(loyaltyRedeemPoints);
  }

  renderLoyaltyPanel();
  updateCartSummary();
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
  if (appliedPromoCode === FIRST_ORDER_COUPON_CODE) {
    return getFirstOrderCouponDiscountAmount(subtotal);
  }
  return Math.round(subtotal * 0.1);
}

// Calculate "Buy 2 Get 1 Free" discount for all products including sets (Stainless site only)
function getBuy2Get1FreeDiscount() {
  // Only apply to stainless material
  const material = window.pageMaterial || '';
  if (material !== 'stainless') {
    return 0;
  }
  
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
  const phone = normalizePhoneKey(document.getElementById('buyerPhone')?.value || '');
  const code = normalizePromoCode(promoInput?.value);
  const isFirstOrderCoupon = code === FIRST_ORDER_COUPON_CODE;

  await loadPromoCodes();

  if (!code) {
    setPromoMessage('Enter a promo code first.');
    return;
  }

  if (!isFirstOrderCoupon && availablePromoCodes.length === 0) {
    appliedPromoCode = '';
    setPromoMessage('No promo codes are currently available.');
    updateCartSummary();
    return;
  }

  if (!phone) {
    setPromoMessage('Enter your phone number first so the coupon can be checked.');
    return;
  }

  if (!isFirstOrderCoupon && !availablePromoCodes.includes(code)) {
    appliedPromoCode = '';
    setPromoMessage('Invalid promo code.');
    updateCartSummary();
    return;
  }

  if (isFirstOrderCoupon) {
    try {
      const eligible = await isFirstOrderEligible(phone);
      if (!eligible) {
        appliedPromoCode = '';
        setPromoMessage('First-order coupon is only available before your first order.');
        updateCartSummary();
        return;
      }
    } catch (error) {
      console.warn('First-order eligibility check failed:', error);
      appliedPromoCode = '';
      setPromoMessage('Could not validate first-order coupon right now.');
      updateCartSummary();
      return;
    }
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
  if (isFirstOrderCoupon) {
    setPromoMessage('First-order coupon applied. You saved 10%.', true);
  } else {
    setPromoMessage(`Promo code ${code} applied. You saved 10%.`, true);
  }
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

function handleAddToCartFromCard(event, button) {
  if (event) event.stopPropagation();
  const card = button.closest('.product-card');
  const productData = card.getAttribute('data-product');
  const product = JSON.parse(productData);
  handleAddToCart(product);
}

function openProductModalFromCard(card) {
  const productData = card.getAttribute('data-product');
  if (!productData) return;

  const product = JSON.parse(productData);
  openedSourceCard = card;
  openedSourceCard.classList.add('product-card-opened');
  openProductModal(product);
}

function handleCardActivate(event, card) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openProductModalFromCard(card);
  }
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
  closeProductModal();
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

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeProductType(type) {
  return String(type || '').toLowerCase().trim().replace(/s$/, '');
}

function getBaseLookCategories(gender) {
  const normalizedGender = String(gender || '').toLowerCase();
  return normalizedGender === 'women'
    ? ['bracelet', 'necklace', 'ring']
    : ['bracelet', 'necklace'];
}

function getTargetSuggestionTypes(product) {
  const selectedType = normalizeProductType(product?.type);

  if (selectedType === 'pendant') {
    return ['necklace', 'necklace'];
  }

  const lookCategories = getBaseLookCategories(product?.gender);
  const remaining = lookCategories.filter((type) => type !== selectedType);

  if (remaining.length > 0) {
    return remaining;
  }

  return lookCategories;
}

function getStyleTokens(product) {
  const source = `${String(product?.title || '')} ${String(product?.desc || '')}`.toLowerCase();
  const tokens = source.match(/[a-z0-9]+/g) || [];
  const stopWords = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'your', 'from', 'made', 'look', 'style', 'set']);

  return tokens.filter((token) => token.length > 2 && !stopWords.has(token));
}

const STYLE_GROUPS = {
  minimal: ['minimal', 'dainty', 'sleek', 'clean', 'simple', 'thin', 'delicate'],
  chunky: ['chunky', 'bold', 'thick', 'statement', 'oversized', 'heavy'],
  classic: ['classic', 'timeless', 'vintage', 'elegant', 'refined', 'heritage']
};

const STONE_COLOR_GROUPS = {
  clear: ['clear', 'crystal', 'diamond', 'white', 'transparent'],
  green: ['green', 'emerald', 'olive', 'mint'],
  red: ['red', 'ruby', 'garnet', 'burgundy'],
  blue: ['blue', 'sapphire', 'navy', 'aqua', 'turquoise'],
  pink: ['pink', 'rose', 'fuchsia'],
  purple: ['purple', 'amethyst', 'violet', 'lilac'],
  black: ['black', 'onyx', 'jet'],
  pearl: ['pearl', 'motherofpearl', 'ivory'],
  multicolor: ['multicolor', 'rainbow', 'colorful']
};

function extractStyleGroups(product) {
  const tokenSet = new Set(getStyleTokens(product));
  return Object.entries(STYLE_GROUPS)
    .filter(([, keywords]) => keywords.some((keyword) => tokenSet.has(keyword)))
    .map(([group]) => group);
}

function extractStoneColorGroups(product) {
  const normalized = `${String(product?.title || '')} ${String(product?.desc || '')}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');

  return Object.entries(STONE_COLOR_GROUPS)
    .filter(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))
    .map(([group]) => group);
}

function scoreSuggestion(baseProduct, candidate, targetType) {
  const basePrice = Number(baseProduct?.price) || 0;
  const candidatePrice = Number(candidate?.price) || 0;

  let score = 0;

  if (normalizeProductType(candidate?.type) === targetType) {
    score += 120;
  }

  if (String(candidate?.gender || '').toLowerCase() === String(baseProduct?.gender || '').toLowerCase()) {
    score += 45;
  }

  if (String(candidate?.material || window.pageMaterial || '').toLowerCase() === String(baseProduct?.material || window.pageMaterial || '').toLowerCase()) {
    score += 35;
  }

  const priceGap = Math.abs(basePrice - candidatePrice);
  score += Math.max(0, 35 - Math.floor(priceGap / 25));

  const baseTokens = getStyleTokens(baseProduct);
  const candidateTokens = new Set(getStyleTokens(candidate));
  const sharedStyleTerms = baseTokens.filter((term) => candidateTokens.has(term)).length;
  score += Math.min(40, sharedStyleTerms * 10);

  const baseStyleGroups = extractStyleGroups(baseProduct);
  const candidateStyleGroups = extractStyleGroups(candidate);
  const sharedStyleGroups = baseStyleGroups.filter((group) => candidateStyleGroups.includes(group));

  if (sharedStyleGroups.length > 0) {
    score += sharedStyleGroups.length * 28;
  } else if (baseStyleGroups.length > 0 && candidateStyleGroups.length > 0) {
    // Penalize conflicting style families (e.g., minimal vs chunky).
    score -= 18;
  }

  const baseStoneColors = extractStoneColorGroups(baseProduct);
  const candidateStoneColors = extractStoneColorGroups(candidate);
  const sharedStoneColors = baseStoneColors.filter((color) => candidateStoneColors.includes(color));

  if (sharedStoneColors.length > 0) {
    score += Math.min(60, sharedStoneColors.length * 30);
  } else if (baseStoneColors.length > 0 && candidateStoneColors.length > 0) {
    score -= 24;
  } else if (baseStoneColors.length > 0 || candidateStoneColors.length > 0) {
    score -= 6;
  }

  return score;
}

function pickSmartSuggestions(product) {
  const targets = getTargetSuggestionTypes(product);
  const suggestions = [];
  const selectedIds = new Set([product.id]);
  const baseGender = String(product?.gender || '').toLowerCase();

  targets.forEach((targetType) => {
    const pool = stainlessProducts
      .filter((item) => item && !selectedIds.has(item.id))
      .filter((item) => normalizeProductType(item.type) === targetType)
      .filter((item) => String(item.gender || '').toLowerCase() === baseGender)
      .map((item) => ({
        item,
        score: scoreSuggestion(product, item, targetType)
      }))
      .sort((a, b) => b.score - a.score);

    const best = pool[0]?.item;
    if (!best) return;

    selectedIds.add(best.id);
    suggestions.push(best);
  });

  return suggestions;
}

function getSuggestionHeadline(product, count) {
  const type = normalizeProductType(product?.type);

  if (type === 'pendant') {
    return 'Complete Your Look with Matching Necklaces';
  }

  if (count > 1) {
    return 'Complete Your Look with Curated Matches';
  }

  return 'Complete Your Look';
}

function buildPriceAttributes(product) {
  const priceMaterial = product.material || window.pageMaterial || null;
  return `${priceMaterial ? ' data-live-price="' + priceMaterial + '"' : ''}${product.weight ? ' data-weight="' + product.weight + '"' : ''}`;
}

function getProductPriceMarkup(product) {
  const priceAttrs = buildPriceAttributes(product);
  const currentPrice = Number(product?.price || 0);
  const originalPrice = Number(product?.originalPrice || 0);

  if (originalPrice > currentPrice) {
    return `
      <span class="price strike-red">EGP ${originalPrice}</span>
      <span class="price discounted">EGP ${currentPrice}</span>
    `;
  }

  return `<span class="price"${priceAttrs}>EGP ${currentPrice}</span>`;
}

function getQuickViewOfferMarkup(product) {
  const discountPercent = Number(product?.discountPercent || 0);
  const countdownLabel = String(product?.countdownLabel || '').trim();

  if (!discountPercent && !countdownLabel) {
    return '';
  }

  const textParts = [];
  if (discountPercent) {
    textParts.push(`Discount ${discountPercent.toFixed(0)}%`);
  }
  if (countdownLabel) {
    textParts.push(countdownLabel);
  }

  return `<p class="quick-view-offer-text">${escapeHtml(textParts.join(' • '))}</p>`;
}

function buildProductQuickViewHTML(product) {
  const suggestions = pickSmartSuggestions(product);
  const suggestionTitle = getSuggestionHeadline(product, suggestions.length);
  const isPendant = normalizeProductType(product.type) === 'pendant';
  const suggestionSubtitle = isPendant
    ? 'Choose 1 of these 2 necklaces to pair with your pendant.'
    : 'Smart picks based on gender, material, style groups, stone colors, and close price range.';

  return `
    <div class="quick-view-grid">
      <div class="quick-view-media">
        <img src="${escapeHtml(product.img)}" alt="${escapeHtml(product.title)}" />
      </div>
      <div class="quick-view-info">
        <p class="quick-view-chip">${escapeHtml(product.gender || 'Collection')} • ${escapeHtml(product.type || '')}</p>
        <h2>${escapeHtml(product.title)}</h2>
        <p class="quick-view-description">${escapeHtml(product.desc || 'Timeless design crafted for everyday elegance.')}</p>
        ${getQuickViewOfferMarkup(product)}
        <div class="quick-view-price">
          ${getProductPriceMarkup(product)}
        </div>
        <button class="btn" onclick="closeProductModal(); handleAddToCart(${JSON.stringify(product).replace(/\"/g, '&quot;')})">Add to Cart</button>
      </div>
    </div>
    ${suggestions.length ? `
      <section class="complete-look">
        <h3>${suggestionTitle}</h3>
        <p class="complete-look-subtitle">${suggestionSubtitle}</p>
        ${isPendant ? '<p class="complete-look-choice-note">Pick one necklace style that fits your pendant mood.</p>' : ''}
        <div class="complete-look-grid">
          ${suggestions.map((suggestion) => {
            return `
              <article class="complete-look-card">
                <img src="${escapeHtml(suggestion.img)}" alt="${escapeHtml(suggestion.title)}" />
                <div class="complete-look-meta">
                  <div class="complete-look-topline">
                    <span class="look-type">${escapeHtml(String(suggestion.type || '').toUpperCase())}</span>
                    <span class="look-gender">${escapeHtml(suggestion.gender || '')}</span>
                  </div>
                  <h4>${escapeHtml(suggestion.title)}</h4>
                  <p>${escapeHtml(suggestion.desc || 'Designed to complement your selected piece.')}</p>
                  <div class="complete-look-actions">
                    <div class="look-price-stack">${getProductPriceMarkup(suggestion)}</div>
                    <button class="btn" onclick="closeProductModal(); handleAddToCart(${JSON.stringify(suggestion).replace(/\"/g, '&quot;')})">Add Match</button>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
        ${suggestions.length > 1 && !isPendant ? `
          <button class="btn complete-look-add-all" onclick='closeProductModal(); addMultipleSuggestions(${JSON.stringify(suggestions).replace(/'/g, '&#039;')})'>Add All Matches</button>
        ` : ''}
      </section>
    ` : ''}
  `;
}

function closeEmbeddedProductModal() {
  const embeddedModal = document.querySelector('.embedded-product-modal');
  if (embeddedModal) {
    embeddedModal.remove();
  }
}

function isMobileBottomSheetViewport() {
  return window.matchMedia('(max-width: 520px)').matches;
}

function resetSheetTransform(sheetElement) {
  if (!sheetElement) return;
  sheetElement.classList.remove('sheet-swiping');
  sheetElement.style.transition = '';
  sheetElement.style.transform = '';
}

function attachSwipeDownClose(sheetElement, onClose) {
  if (!sheetElement || sheetElement.dataset.swipeCloseBound === '1') return;

  sheetElement.dataset.swipeCloseBound = '1';

  let startY = 0;
  let currentY = 0;
  let activePull = false;
  let isDragging = false;

  sheetElement.addEventListener('touchstart', (event) => {
    if (!isMobileBottomSheetViewport()) return;
    if (!event.touches || event.touches.length !== 1) return;

    startY = event.touches[0].clientY;
    currentY = startY;
    activePull = sheetElement.scrollTop <= 0;
    isDragging = false;
    resetSheetTransform(sheetElement);
  }, { passive: true });

  sheetElement.addEventListener('touchmove', (event) => {
    if (!activePull || !isMobileBottomSheetViewport()) return;
    if (!event.touches || event.touches.length !== 1) return;

    currentY = event.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY <= 0) return;

    isDragging = true;
    sheetElement.classList.add('sheet-swiping');
    sheetElement.style.transform = `translateY(${Math.min(deltaY, 260)}px)`;
    event.preventDefault();
  }, { passive: false });

  const finalizeSwipe = () => {
    if (!isMobileBottomSheetViewport()) {
      resetSheetTransform(sheetElement);
      return;
    }

    const deltaY = currentY - startY;

    if (isDragging && deltaY > 90) {
      sheetElement.style.transition = 'transform 180ms ease';
      sheetElement.style.transform = 'translateY(100%)';
      setTimeout(() => {
        resetSheetTransform(sheetElement);
        onClose();
      }, 180);
      return;
    }

    sheetElement.style.transition = 'transform 180ms ease';
    sheetElement.style.transform = 'translateY(0)';
    setTimeout(() => {
      resetSheetTransform(sheetElement);
    }, 180);
  };

  sheetElement.addEventListener('touchend', finalizeSwipe, { passive: true });
  sheetElement.addEventListener('touchcancel', finalizeSwipe, { passive: true });
}

function closeProductModal() {
  document.body.classList.remove('quick-view-open');

  if (openedSourceCard) {
    openedSourceCard.classList.remove('product-card-opened');
    openedSourceCard = null;
  }

  closeEmbeddedProductModal();

  const globalDialog = document.querySelector('#productModal .modal-dialog');
  resetSheetTransform(globalDialog);

  const modal = document.getElementById('productModal');
  if (!modal) return;

  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function openProductModal(product) {
  document.body.classList.add('quick-view-open');

  if (openedSourceCard && !openedSourceCard.isConnected) {
    openedSourceCard = null;
  }

  const expandedModal = showExpandedView ? document.querySelector('.expanded-modal') : null;
  if (expandedModal) {
    let embeddedModal = expandedModal.querySelector('.embedded-product-modal');

    if (!embeddedModal) {
      embeddedModal = document.createElement('div');
      embeddedModal.className = 'embedded-product-modal';
      embeddedModal.innerHTML = `
        <div class="embedded-product-modal-backdrop"></div>
        <div class="embedded-product-modal-dialog">
          <button class="modal-close embedded-product-close">×</button>
          <div class="modal-content"></div>
        </div>
      `;
      expandedModal.appendChild(embeddedModal);

      const backdrop = embeddedModal.querySelector('.embedded-product-modal-backdrop');
      const closeBtn = embeddedModal.querySelector('.embedded-product-close');
      const embeddedDialog = embeddedModal.querySelector('.embedded-product-modal-dialog');

      backdrop?.addEventListener('click', closeProductModal);
      closeBtn?.addEventListener('click', closeProductModal);
      attachSwipeDownClose(embeddedDialog, closeProductModal);
    }

    const modalContent = embeddedModal.querySelector('.modal-content');
    if (!modalContent) return;

    modalContent.innerHTML = buildProductQuickViewHTML(product);

    if (window.applyLivePrices) {
      window.applyLivePrices();
    }
    return;
  }

  const modal = document.getElementById('productModal');
  const modalContent = modal?.querySelector('.modal-content');
  const modalDialog = modal?.querySelector('.modal-dialog');
  if (!modal || !modalContent || !product) return;
  modalContent.innerHTML = buildProductQuickViewHTML(product);
  attachSwipeDownClose(modalDialog, closeProductModal);

  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  if (window.applyLivePrices) {
    window.applyLivePrices();
  }
}

function addMultipleSuggestions(suggestions) {
  if (!Array.isArray(suggestions)) return;

  suggestions.forEach((item) => {
    handleAddToCart(item);
  });
}

// HTML generation functions
function generateProductCard(product) {
  const badgeMarkup = Number(product?.discountPercent || 0) > 0
    ? `<span class="discount-badge">-${Number(product.discountPercent).toFixed(0)}%</span>`
    : '';
  const countdownBadgeMarkup = product?.countdownLabel
    ? `<span class="discount-countdown-badge ${product.countdownType === 'upcoming' ? 'upcoming' : 'ending'}">${escapeHtml(product.countdownLabel)}</span>`
    : '';

  return `
    <div
      class="product-card"
      data-product-id="${product.id}"
      data-product='${JSON.stringify(product)}'
      role="button"
      tabindex="0"
      aria-label="Open details for ${escapeHtml(product.title)}"
      onclick="openProductModalFromCard(this)"
      onkeydown="handleCardActivate(event, this)"
    >
      <div class="product-image">
        ${badgeMarkup}
        ${countdownBadgeMarkup}
        <img src="${product.img}" alt="${product.title}" />
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.title}</h3>
        <p class="product-description">${product.desc}</p>
        <div class="product-price">
          ${getProductPriceMarkup(product)}
        </div>
        <button class="btn add-to-cart-btn" onclick="handleAddToCartFromCard(event, this)">
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
            <h1>${(window.pageMaterial === 'stainless') ? 'Stainless Steel Excellence' : '925K silver Excellence'}</h1>
            <p>Discover durable, hypoallergenic jewelry that combines modern design with lasting quality. Perfect for everyday elegance and active lifestyles.</p>
            <a class="btn" href="#collections">Explore Collections</a>
          </div>
          <div class="hero-image">
            <img src="/Vector logo.svg" alt="Duha's Jewellery - Premium ${(window.pageMaterial === 'stainless') ? 'stainless steel' : 'silver'} jewelry collection" />
          </div>
        </div>
      </section>

      <section class="trust-badges">
        <div class="container">
          <h2>${(window.pageMaterial === 'stainless') ? 'Why Choose Stainless' : 'Why Choose Silver'}</h2>
          <p>${(window.pageMaterial === 'stainless') ? 'Experience the perfect blend of durability, corrosion resistance, and modern style' : 'Experience the perfect blend of durability, style, and affordability'}</p>
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
                <p>${(window.pageMaterial === 'stainless') ? 'Premium stainless steel jewelry specially designed for you' : '925K customized silver jewelry specially designed for you'}</p>
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
  await refreshStorefrontData();
  subscribeToProductUpdates();
  startStorefrontAutoRefresh();
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
window.openProductModalFromCard = openProductModalFromCard;
window.handleCardActivate = handleCardActivate;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.addMultipleSuggestions = addMultipleSuggestions;

// ============ CART FUNCTIONALITY ============
// Cart state management
let cart = [];
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

const FREE_SHIPPING_THRESHOLD = 1999;

const INSTAPAY_NUMBER = '01212820666';
const EWALLET_NUMBER = '01101163565';

function getShippingCost(subtotal, government) {
  if (Number(subtotal || 0) > FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return shippingCosts[government] || 0;
}

function updatePaymentInstructions() {
  const paymentInstructionsEl = document.getElementById('paymentInstructions');
  const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked')?.value;

  if (!paymentInstructionsEl) return;

  if (selectedPayment === 'Instapay' || selectedPayment === 'E-Wallet') {
    const subtotal = getCartSubtotal();
    const government = document.getElementById('buyerGovernment')?.value || '';
    const shipping = getShippingCost(subtotal, government);
    const promoDiscount = getPromoDiscountAmount(subtotal);
    const loyaltyDiscount = getLoyaltyRedeemDiscountAmount(subtotal - promoDiscount);
    const totalDiscount = promoDiscount + loyaltyDiscount;
    const total = Math.max(0, subtotal - totalDiscount + shipping);
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
  const shipping = getShippingCost(subtotal, government);
  const promoDiscount = getPromoDiscountAmount(subtotal);
  const buy2Get1Discount = getBuy2Get1FreeDiscount();
  const loyaltyDiscount = getLoyaltyRedeemDiscountAmount(subtotal - promoDiscount - buy2Get1Discount);
  const discount = promoDiscount + loyaltyDiscount + buy2Get1Discount;
  const total = Math.max(0, subtotal - discount + shipping);
  
  document.getElementById('cartSubtotal').textContent = `EGP ${subtotal}`;
  const discountElement = document.getElementById('cartDiscount');
  if (discountElement) {
    let discountText = `- EGP ${discount}`;
    if (buy2Get1Discount > 0) {
      discountText = `- EGP ${discount} (Buy 2 Get 1 Free: EGP ${buy2Get1Discount}`;
      if (promoDiscount > 0) {
        discountText += ` + Promo: EGP ${promoDiscount}`;
      }
      discountText += ')';
    }
    discountElement.textContent = discountText;
  }
  const loyaltyUsedElement = document.getElementById('loyaltyUsedValue');
  if (loyaltyUsedElement) {
    loyaltyUsedElement.textContent = `${Math.max(0, Number(loyaltyRedeemPoints || 0))}`;
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
  const phone = normalizePhoneKey(document.getElementById('buyerPhone').value);
  const phone2 = document.getElementById('buyerPhone2').value.trim();
  const government = document.getElementById('buyerGovernment').value.trim();
  const address = document.getElementById('buyerAddress').value.trim();
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  
  if (!name || !phone || !government || !address || !paymentMethod) {
    alert('Please fill in all required fields');
    return null;
  }
  
  const subtotal = getCartSubtotal();
  const shipping = getShippingCost(subtotal, government);
  const promoDiscount = getPromoDiscountAmount(subtotal);
  const buy2Get1Discount = getBuy2Get1FreeDiscount();
  const loyaltyDiscount = getLoyaltyRedeemDiscountAmount(subtotal - promoDiscount - buy2Get1Discount);
  const discount = promoDiscount + loyaltyDiscount + buy2Get1Discount;
  const total = Math.max(0, subtotal - discount + shipping);
  
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
  if (loyaltyDiscount > 0) {
    message += `Loyalty Discount: - EGP ${loyaltyDiscount}\n`;
  }
  if (loyaltyRedeemPoints > 0) {
    message += `Loyalty Points Used: ${loyaltyRedeemPoints}\n`;
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
  const shipping = getShippingCost(subtotal, government);
  const promoDiscount = getPromoDiscountAmount(subtotal);
  const buy2Get1Discount = getBuy2Get1FreeDiscount();
  const loyaltyDiscount = getLoyaltyRedeemDiscountAmount(subtotal - promoDiscount - buy2Get1Discount);
  const discount = promoDiscount + loyaltyDiscount + buy2Get1Discount;
  const total = Math.max(0, subtotal - discount + shipping);

  // Create discount breakdown for admin visibility
  const discountBreakdown = {
    promoDiscount: promoDiscount,
    buy2Get1Discount: buy2Get1Discount,
    loyaltyDiscount: loyaltyDiscount,
    totalDiscount: discount
  };

  if (appliedPromoCode) {
    if (appliedPromoCode === FIRST_ORDER_COUPON_CODE) {
      const eligible = await isFirstOrderEligible(phone);
      if (!eligible) {
        throw new Error('First-order coupon is only available before your first order.');
      }
    }

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

  let loyaltyDeductionApplied = false;
  if (loyaltyRedeemPoints > 0) {
    await loadLoyaltyProgramState();
    const latestPoints = getLoyaltyAccountPoints(phone);
    if (latestPoints < loyaltyRedeemPoints) {
      throw new Error('Your loyalty points were updated. Please reapply points and try again.');
    }

    loyaltyProgramState.accounts[phone] = {
      ...(loyaltyProgramState.accounts[phone] || {}),
      points: latestPoints - loyaltyRedeemPoints,
      updatedAt: new Date().toISOString()
    };
    loyaltyProgramState.transactions = [
      {
        type: 'redeem',
        phone,
        points: loyaltyRedeemPoints,
        discount: loyaltyDiscount,
        createdAt: new Date().toISOString()
      },
      ...(loyaltyProgramState.transactions || [])
    ].slice(0, 500);

    await upsertSiteSettingValue(LOYALTY_SETTING_KEY, JSON.stringify(loyaltyProgramState));
    loyaltyDeductionApplied = true;
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
    discount_amount: discount,
    discount_breakdown: JSON.stringify(discountBreakdown),
    shipping,
    total,
    items: cart,
    status: 'pending'
  };

  // attach authenticated user id to satisfy RLS policies (allow guests)
  const authDebug = await getAuthDebug?.();
  console.debug('Order insert debug - auth', authDebug, 'payloadBefore=', orderPayload);
  const userId = await getCurrentUserId?.();
  if (userId) {
    orderPayload.user_id = userId;
  } else {
    // guest order: leave user_id null so RLS guest insert policy accepts it
    orderPayload.user_id = null;
    console.info('Placing order as guest (no user_id attached).');
  }

  const { error } = await supabaseClient
    .from('customer_orders')
    .insert(Object.fromEntries(Object.entries(orderPayload).filter(([_, v]) => v !== undefined && v !== '')))
    .select('id')
    .single();

  if (error) {
    if (loyaltyDeductionApplied) {
      try {
        await loadLoyaltyProgramState();
        const rollbackPoints = getLoyaltyAccountPoints(phone);
        loyaltyProgramState.accounts[phone] = {
          ...(loyaltyProgramState.accounts[phone] || {}),
          points: rollbackPoints + loyaltyRedeemPoints,
          updatedAt: new Date().toISOString()
        };
        await upsertSiteSettingValue(LOYALTY_SETTING_KEY, JSON.stringify(loyaltyProgramState));
      } catch (rollbackError) {
        console.error('Failed to rollback loyalty points after checkout failure:', rollbackError);
      }
    }
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

  if (loyaltyDeductionApplied) {
    loyaltyAvailablePoints = Math.max(0, loyaltyAvailablePoints - loyaltyRedeemPoints);
    loyaltyRedeemPoints = 0;
    const redeemInput = document.getElementById('loyaltyRedeemInput');
    if (redeemInput) redeemInput.value = '0';
    renderLoyaltyPanel();
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

  const loyaltyRedeemBtn = document.getElementById('loyaltyRedeemBtn');
  if (loyaltyRedeemBtn) {
    loyaltyRedeemBtn.addEventListener('click', () => {
      const redeemInput = document.getElementById('loyaltyRedeemInput');
      const requested = Math.floor(Number(redeemInput?.value || 0));

      if (!loyaltyPhoneKey) {
        alert('Enter your phone number first to use loyalty points.');
        return;
      }

      if (!Number.isFinite(requested) || requested < 0) {
        alert('Enter a valid points value.');
        return;
      }

      const rounded = Math.floor(requested / 1000) * 1000;
      if (rounded !== requested) {
        alert('Points must be in multiples of 1000.');
        return;
      }

      if (rounded > loyaltyAvailablePoints) {
        alert('You do not have enough loyalty points.');
        return;
      }

      loyaltyRedeemPoints = rounded;
      if (redeemInput) redeemInput.value = String(rounded);
      updateCartSummary();
    });
  }
  
  // Size modal close on overlay click
  const sizeModal = document.getElementById('sizeModal');
  if (sizeModal) {
    const overlay = sizeModal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeSizeModal);
    }
  }

  // Product modal controls
  const productModal = document.getElementById('productModal');
  const modalClose = document.getElementById('modalClose');

  if (modalClose) {
    modalClose.addEventListener('click', closeProductModal);
  }

  if (productModal) {
    productModal.addEventListener('click', (event) => {
      if (event.target === productModal) {
        closeProductModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    const hasEmbeddedModal = !!document.querySelector('.embedded-product-modal');
    const isGlobalModalOpen = productModal?.getAttribute('aria-hidden') === 'false';

    if (hasEmbeddedModal || isGlobalModalOpen) {
      closeProductModal();
    }
  });
  
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
    phoneInput.addEventListener('change', async () => {
      if (appliedPromoCode) {
        setPromoMessage('Re-check the promo code after updating the phone number.');
      }
      await refreshLoyaltyForCurrentPhone();
      updateCartSummary();
    });

    phoneInput.addEventListener('blur', async () => {
      await refreshLoyaltyForCurrentPhone();
    });
  }

  refreshLoyaltyForCurrentPhone();
  
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