const loginBox = document.getElementById("loginBox");
const adminPanel = document.getElementById("adminPanel");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

// Prices section
const silverPriceInput = document.getElementById("silverPriceInput");
const goldplatedPriceInput = document.getElementById("goldplatedPriceInput");
const stainlessProfitPercentageInput = document.getElementById("stainlessProfitPercentageInput");
const silverProfitPercentageInput = document.getElementById("silverProfitPercentageInput");
const goldplatedProfitPercentageInput = document.getElementById("goldplatedProfitPercentageInput");
const packagingCostInput = document.getElementById("packagingCostInput");
const savePricesBtn = document.getElementById("savePricesBtn");
const pricesStatusMsg = document.getElementById("pricesStatusMsg");

// Products section
const addProductBtn = document.getElementById("addProductBtn");
const removeAllProductsBtn = document.getElementById("removeAllProductsBtn");
const productForm = document.getElementById("productForm");
const formTitle = document.getElementById("formTitle");
const productId = document.getElementById("productId");
const productTitle = document.getElementById("productTitle");
const productDesc = document.getElementById("productDesc");
const productPrice = document.getElementById("productPrice");
const productWeight = document.getElementById("productWeight");
const productWeightWrap = document.getElementById("productWeightWrap");
const productImgFile = document.getElementById("productImgFile");
const productGender = document.getElementById("productGender");
const productType = document.getElementById("productType");
const productMaterial = document.getElementById("productMaterial");
const productCategory = document.getElementById("productCategory");
const removeProductCategoryBtn = document.getElementById("removeProductCategoryBtn");
const saveProductBtn = document.getElementById("saveProductBtn");
const cancelProductBtn = document.getElementById("cancelProductBtn");
const productsList = document.getElementById("productsList");
const bulkProductFormElement = document.getElementById("bulkProductFormElement");
const bulkProductImages = document.getElementById("bulkProductImages");
const bulkProductNames = document.getElementById("bulkProductNames");
const bulkProductDesc = document.getElementById("bulkProductDesc");
const bulkProductGender = document.getElementById("bulkProductGender");
const bulkProductType = document.getElementById("bulkProductType");
const bulkProductMaterial = document.getElementById("bulkProductMaterial");
const bulkProductCategory = document.getElementById("bulkProductCategory");
const removeBulkCategoryBtn = document.getElementById("removeBulkCategoryBtn");
const bulkProductWeights = document.getElementById("bulkProductWeights");
const bulkProductStatusMsg = document.getElementById("bulkProductStatusMsg");
const bulkImageCountValue = document.getElementById("bulkImageCountValue");
const bulkNameCountValue = document.getElementById("bulkNameCountValue");
const bulkCountMatchPill = document.getElementById("bulkCountMatchPill");
const bulkCountMatchValue = document.getElementById("bulkCountMatchValue");
const bulkReadyIndicator = document.getElementById("bulkReadyIndicator");
const bulkReadyTitle = document.getElementById("bulkReadyTitle");
const bulkReadyText = document.getElementById("bulkReadyText");
const bulkAttemptPreview = document.getElementById("bulkAttemptPreview");
const restoreCategorySelect = document.getElementById("restoreCategorySelect");
const restoreCategoryBtn = document.getElementById("restoreCategoryBtn");
const restoreCategoryStatusMsg = document.getElementById("restoreCategoryStatusMsg");

// Categories section
const setsCategoryInput = document.getElementById("setsCategoryInput");
const ringsCategoryInput = document.getElementById("ringsCategoryInput");
const necklacesCategoryInput = document.getElementById("necklacesCategoryInput");
const braceletsCategoryInput = document.getElementById("braceletsCategoryInput");
const promoCodesInput = document.getElementById("promoCodesInput");
const discountScopeSelect = document.getElementById("discountScopeSelect");
const discountProductWrap = document.getElementById("discountProductWrap");
const discountMaterialWrap = document.getElementById("discountMaterialWrap");
const discountCategoryWrap = document.getElementById("discountCategoryWrap");
const discountCategoryGenderWrap = document.getElementById("discountCategoryGenderWrap");
const discountProductSelect = document.getElementById("discountProductSelect");
const discountMaterialSelect = document.getElementById("discountMaterialSelect");
const discountCategorySelect = document.getElementById("discountCategorySelect");
const discountCategoryGenderSelect = document.getElementById("discountCategoryGenderSelect");
const discountPercentInput = document.getElementById("discountPercentInput");
const discountStartInput = document.getElementById("discountStartInput");
const discountEndInput = document.getElementById("discountEndInput");
const addDiscountRuleBtn = document.getElementById("addDiscountRuleBtn");
const clearDiscountRulesBtn = document.getElementById("clearDiscountRulesBtn");
const discountStatusMsg = document.getElementById("discountStatusMsg");
const discountRulesList = document.getElementById("discountRulesList");
const discountRuleSearchInput = document.getElementById("discountRuleSearchInput");
const discountRuleScopeFilter = document.getElementById("discountRuleScopeFilter");
const discountRuleStatusFilter = document.getElementById("discountRuleStatusFilter");
const categoriesStatusMsg = pricesStatusMsg;
const userSearchInput = document.getElementById("userSearchInput");
const usersList = document.getElementById("usersList");
const addOrderForm = document.getElementById("addOrderForm");
const orderCustomerNameInput = document.getElementById("orderCustomerName");
const orderCustomerPhoneInput = document.getElementById("orderCustomerPhone");
const orderCustomerPhone2Input = document.getElementById("orderCustomerPhone2");
const orderGovernmentInput = document.getElementById("orderGovernment");
const orderAddressInput = document.getElementById("orderAddress");
const orderPaymentMethodInput = document.getElementById("orderPaymentMethod");
const orderStatusInput = document.getElementById("orderStatus");
const orderSubtotalInput = document.getElementById("orderSubtotal");
const orderDiscountInput = document.getElementById("orderDiscount");
const orderShippingInput = document.getElementById("orderShipping");
const orderTotalInput = document.getElementById("orderTotal");
const orderCouponCodeInput = document.getElementById("orderCouponCode");
const orderItemsInput = document.getElementById("orderItemsInput");
const orderFormStatus = document.getElementById("orderFormStatus");
const orderProductSelect = document.getElementById("orderProductSelect");
const orderProductSearch = document.getElementById("orderProductSearch");
const orderProductSuggestions = document.getElementById("orderProductSuggestions");
const orderProductQty = document.getElementById("orderProductQty");
const addOrderItemBtn = document.getElementById("addOrderItemBtn");
const orderItemsPreview = document.getElementById("orderItemsPreview");
const loyaltyPhoneInput = document.getElementById("loyaltyPhoneInput");
const loyaltyNameInput = document.getElementById("loyaltyNameInput");
const loyaltyPointsInput = document.getElementById("loyaltyPointsInput");
const loyaltyModeSelect = document.getElementById("loyaltyModeSelect");
const saveLoyaltyManualBtn = document.getElementById("saveLoyaltyManualBtn");
const loyaltyManualStatus = document.getElementById("loyaltyManualStatus");

let allUserOrders = [];
let allProductsCatalog = [];
let manualOrderItems = [];
let activeProductsWorkspaceTab = 'catalog';
let discountRules = [];
let loyaltyProgramState = {
  accounts: {},
  awardedOrderIds: [],
  transactions: []
};

const LOYALTY_SETTING_KEY = 'loyalty_program_state';
const LOYALTY_POINTS_PER_1000_SPENT = 500;
const LOYALTY_DISCOUNT_PER_1000_POINTS = 100;

// Tab switching
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab + 'Section').classList.add('active');
  });
});

function setProductsWorkspaceTab(tabName) {
  activeProductsWorkspaceTab = tabName;

  document.querySelectorAll('.products-workspace-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.productsWorkspaceTab === tabName);
  });

  document.querySelectorAll('.products-workspace-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.productsWorkspacePanel === tabName);
  });
}

async function upsertSiteSetting(key, value) {
  const payload = {
    key,
    value,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabaseClient
    .from("site_settings")
    .upsert(payload, { onConflict: ["key"] });

  return { data, error };
}

async function uploadProductImage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { data, error } = await supabaseClient.storage
    .from('images')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabaseClient.storage
    .from('images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

function getStainlessSettingKey(category) {
  const normalized = (category || '').toLowerCase();
  if (normalized === 'sets') return 'stainless_price_sets';
  if (normalized === 'rings') return 'stainless_price_rings';
  if (normalized === 'necklaces') return 'stainless_price_necklaces';
  if (normalized === 'bracelets') return 'stainless_price_bracelets';
  return null;
}

function getStainlessCategoryFromProduct(product) {
  const category = (product.category || product.type || '').toLowerCase();
  if (category === 'set') return 'sets';
  return category;
}

async function loadStainlessPriceSettings() {
  const { data, error } = await supabaseClient
    .from("site_settings")
    .select("key,value")
    .in("key", ["stainless_price_sets", "stainless_price_rings", "stainless_price_necklaces", "stainless_price_bracelets"]);

  if (error) {
    categoriesStatusMsg.textContent = "Failed to load stainless prices.";
    categoriesStatusMsg.style.color = "red";
    return;
  }

  const settings = Array.isArray(data) ? data : [];
  settings.forEach(item => {
    if (item.key === "stainless_price_sets") setsCategoryInput.value = item.value;
    if (item.key === "stainless_price_rings") ringsCategoryInput.value = item.value;
    if (item.key === "stainless_price_necklaces") necklacesCategoryInput.value = item.value;
    if (item.key === "stainless_price_bracelets") braceletsCategoryInput.value = item.value;
  });
}

async function loadPromoCodes() {
  const { data, error } = await supabaseClient
    .from("site_settings")
    .select("value")
    .eq("key", "promo_codes")
    .maybeSingle();

  if (error) {
    pricesStatusMsg.textContent = "Failed to load promo codes.";
    pricesStatusMsg.style.color = "red";
    return;
  }

  const rawValue = data?.value || "[]";
  let codes = [];

  try {
    const parsed = JSON.parse(rawValue);
    codes = Array.isArray(parsed) ? parsed : [];
  } catch {
    codes = String(rawValue)
      .split(/\r?\n|,/) 
      .map(code => code.trim())
      .filter(Boolean);
  }

  promoCodesInput.value = codes.join("\n");
}

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
    .map(rule => ({
      id: String(rule.id || Date.now() + Math.random()),
      scope: rule.scope === 'category' ? 'category' : 'product',
      productId: rule.productId != null ? String(rule.productId) : null,
      material: rule.material ? String(rule.material).trim().toLowerCase() : null,
      category: rule.category ? normalizeDiscountType(rule.category) : null,
      gender: rule.gender ? String(rule.gender).trim().toLowerCase() : null,
      percent: Number(rule.percent || 0),
      startAt: rule.startAt || null,
      endAt: rule.endAt || null,
      active: rule.active !== false
    }))
    .filter(rule => rule.percent > 0 && rule.percent <= 90);
}

function toIsoDateTime(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function toLocalDateTimeInputValue(isoValue) {
  if (!isoValue) return '';
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function getDiscountRuleStatus(rule) {
  const now = Date.now();
  const startTime = rule?.startAt ? new Date(rule.startAt).getTime() : null;
  const endTime = rule?.endAt ? new Date(rule.endAt).getTime() : null;

  if (startTime && startTime > now) {
    return 'upcoming';
  }

  if (endTime && endTime < now) {
    return 'expired';
  }

  return 'active';
}

function formatDiscountDateRange(rule) {
  const start = rule?.startAt ? formatDateTime(rule.startAt) : 'Now';
  const end = rule?.endAt ? formatDateTime(rule.endAt) : 'No end';
  return `${start} -> ${end}`;
}

function syncDiscountScopeInputs() {
  if (!discountScopeSelect) return;

  const isProductScope = discountScopeSelect.value === 'product';
  if (discountProductSelect) {
    discountProductSelect.disabled = !isProductScope;
  }
  if (discountMaterialSelect) {
    discountMaterialSelect.disabled = isProductScope;
  }
  if (discountCategorySelect) {
    discountCategorySelect.disabled = isProductScope;
  }
  if (discountCategoryGenderSelect) {
    discountCategoryGenderSelect.disabled = isProductScope;
  }

  if (discountProductWrap) {
    discountProductWrap.style.opacity = isProductScope ? '1' : '0.55';
  }
  if (discountMaterialWrap) {
    discountMaterialWrap.style.opacity = isProductScope ? '0.55' : '1';
  }
  if (discountCategoryWrap) {
    discountCategoryWrap.style.opacity = isProductScope ? '0.55' : '1';
  }
  if (discountCategoryGenderWrap) {
    discountCategoryGenderWrap.style.opacity = isProductScope ? '0.55' : '1';
  }

  if (!isProductScope) {
    updateDiscountCategoryOptions();
  }
}

function getDiscountMaterialLabel(material) {
  const normalized = String(material || '').toLowerCase();
  if (normalized === 'silver') return 'Silver';
  if (normalized === 'goldplated') return 'Gold Plated';
  return 'Stainless Steel';
}

function getDiscountCategoryOptionsForMaterial(material) {
  const normalized = String(material || 'stainless').toLowerCase();

  if (normalized === 'silver' || normalized === 'goldplated') {
    return [
      { value: 'ring', label: 'Rings' },
      { value: 'bracelet', label: 'Bracelets' },
      { value: 'necklace', label: 'Necklaces' },
      { value: 'pendant', label: 'Pendants' }
    ];
  }

  return [
    { value: 'set', label: 'Sets' },
    { value: 'ring', label: 'Rings' },
    { value: 'bracelet', label: 'Bracelets' },
    { value: 'necklace', label: 'Necklaces' },
    { value: 'pendant', label: 'Pendants' }
  ];
}

function updateDiscountCategoryOptions() {
  if (!discountCategorySelect) return;

  const selectedMaterial = String(discountMaterialSelect?.value || 'stainless').toLowerCase();
  const currentValue = discountCategorySelect.value;
  const options = ['<option value="">Select category</option>'];

  getDiscountCategoryOptionsForMaterial(selectedMaterial).forEach((option) => {
    options.push(`<option value="${option.value}">${option.label}</option>`);
  });

  discountCategorySelect.innerHTML = options.join('');

  if ([...discountCategorySelect.options].some(option => option.value === currentValue)) {
    discountCategorySelect.value = currentValue;
  }
}

function getDiscountGenderLabel(gender) {
  const normalized = String(gender || '').toLowerCase();
  if (normalized === 'women') return 'Women';
  if (normalized === 'men') return 'Men';
  return 'All genders';
}

function getCategoryLabelFromType(type) {
  const normalized = normalizeDiscountType(type);
  if (normalized === 'ring') return 'Rings';
  if (normalized === 'bracelet') return 'Bracelets';
  if (normalized === 'necklace') return 'Necklaces';
  if (normalized === 'set') return 'Sets';
  if (normalized === 'pendant') return 'Pendants';
  return normalized;
}

function loadDiscountProductOptions() {
  if (!discountProductSelect) return;

  const options = ['<option value="">Select product</option>'];
  allProductsCatalog.forEach(product => {
    const productId = String(product.id);
    options.push(`<option value="${escapeHtml(productId)}">${escapeHtml(product.title || 'Product')} (${escapeHtml(product.material || '-')})</option>`);
  });

  discountProductSelect.innerHTML = options.join('');
}

function getProductTitleById(productId) {
  const found = allProductsCatalog.find(product => String(product.id) === String(productId));
  return found?.title || `Product #${productId}`;
}

function renderDiscountRules() {
  if (!discountRulesList) return;

  const searchQuery = String(discountRuleSearchInput?.value || '').trim().toLowerCase();
  const scopeFilter = String(discountRuleScopeFilter?.value || 'all').toLowerCase();
  const statusFilter = String(discountRuleStatusFilter?.value || 'all').toLowerCase();

  const visibleRules = discountRules.filter((rule) => {
    const scopeMatch = scopeFilter === 'all' || rule.scope === scopeFilter;
    if (!scopeMatch) return false;

    const status = getDiscountRuleStatus(rule);
    const statusMatch = statusFilter === 'all' || status === statusFilter;
    if (!statusMatch) return false;

    const target = rule.scope === 'product'
      ? getProductTitleById(rule.productId)
      : getCategoryLabelFromType(rule.category);

    if (!searchQuery) return true;
    return target.toLowerCase().includes(searchQuery);
  });

  if (!visibleRules.length) {
    discountRulesList.innerHTML = discountRules.length
      ? '<p class="helper-text">No rules match your current filters.</p>'
      : '<p class="helper-text">No discount rules yet.</p>';
    return;
  }

  discountRulesList.innerHTML = visibleRules.map(rule => {
    const target = rule.scope === 'product'
      ? getProductTitleById(rule.productId)
      : getCategoryLabelFromType(rule.category);
    const status = getDiscountRuleStatus(rule);
    const statusClass = status === 'active' ? 'discount-status-active' : status === 'upcoming' ? 'discount-status-upcoming' : 'discount-status-expired';
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

    return `
      <div class="discount-rule-item">
        <div class="discount-rule-head">
          <p><strong>${rule.scope === 'product' ? 'Product' : 'Category'}:</strong> ${escapeHtml(target)}</p>
          <span class="discount-status-pill ${statusClass}">${statusLabel}</span>
        </div>
        ${rule.scope === 'category' ? `<p><strong>Material:</strong> ${escapeHtml(getDiscountMaterialLabel(rule.material))}</p>` : ''}
        ${rule.scope === 'category' ? `<p><strong>Gender:</strong> ${escapeHtml(getDiscountGenderLabel(rule.gender))}</p>` : ''}
        <p><strong>Discount:</strong> ${Number(rule.percent).toFixed(0)}%</p>
        <p class="discount-rule-meta"><strong>Schedule:</strong> ${escapeHtml(formatDiscountDateRange(rule))}</p>
        <button type="button" class="delete-btn discount-rule-remove-btn" data-discount-rule-id="${escapeHtml(rule.id)}">Remove</button>
      </div>
    `;
  }).join('');
}

async function saveDiscountRules() {
  const payload = discountRules.map(rule => ({
    id: rule.id,
    scope: rule.scope,
    productId: rule.scope === 'product' ? String(rule.productId) : null,
    material: rule.scope === 'category' ? (rule.material || null) : null,
    category: rule.scope === 'category' ? normalizeDiscountType(rule.category) : null,
    gender: rule.scope === 'category' ? (rule.gender || null) : null,
    percent: Number(rule.percent),
    startAt: rule.startAt || null,
    endAt: rule.endAt || null,
    active: true
  }));

  const { error } = await upsertSiteSetting('discount_rules', JSON.stringify(payload));
  if (error) {
    throw error;
  }
}

async function loadDiscountRules() {
  const { data, error } = await supabaseClient
    .from('site_settings')
    .select('value')
    .eq('key', 'discount_rules')
    .maybeSingle();

  if (error) {
    discountRules = [];
    if (discountStatusMsg) {
      discountStatusMsg.textContent = 'Failed to load discount rules.';
      discountStatusMsg.style.color = 'red';
    }
    renderDiscountRules();
    return;
  }

  discountRules = parseDiscountRules(data?.value);
  renderDiscountRules();
}

async function addDiscountRuleFromForm() {
  if (!discountScopeSelect || !discountPercentInput) return;

  const scope = discountScopeSelect.value === 'category' ? 'category' : 'product';
  const percent = Number(discountPercentInput.value || 0);
  const startAt = toIsoDateTime(discountStartInput?.value || '');
  const endAt = toIsoDateTime(discountEndInput?.value || '');

  if ((discountStartInput?.value && !startAt) || (discountEndInput?.value && !endAt)) {
    if (discountStatusMsg) {
      discountStatusMsg.textContent = 'Enter valid start/end date values.';
      discountStatusMsg.style.color = 'red';
    }
    return;
  }

  if (startAt && endAt && new Date(endAt).getTime() <= new Date(startAt).getTime()) {
    if (discountStatusMsg) {
      discountStatusMsg.textContent = 'End date must be after start date.';
      discountStatusMsg.style.color = 'red';
    }
    return;
  }

  if (!Number.isFinite(percent) || percent <= 0 || percent > 90) {
    if (discountStatusMsg) {
      discountStatusMsg.textContent = 'Enter a valid discount between 1% and 90%.';
      discountStatusMsg.style.color = 'red';
    }
    return;
  }

  if (scope === 'product') {
    const productId = String(discountProductSelect?.value || '').trim();
    if (!productId) {
      if (discountStatusMsg) {
        discountStatusMsg.textContent = 'Select a product first.';
        discountStatusMsg.style.color = 'red';
      }
      return;
    }

    discountRules = discountRules.filter(rule => !(rule.scope === 'product' && String(rule.productId) === productId));
    discountRules.push({
      id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      scope: 'product',
      productId,
      category: null,
      percent,
      startAt,
      endAt,
      active: true
    });
  } else {
    const material = String(discountMaterialSelect?.value || 'stainless').trim().toLowerCase();
    const category = normalizeDiscountType(discountCategorySelect?.value || '');
    const selectedGender = String(discountCategoryGenderSelect?.value || 'all').trim().toLowerCase();
    const gender = selectedGender === 'women' || selectedGender === 'men' ? selectedGender : null;
    if (!category) {
      if (discountStatusMsg) {
        discountStatusMsg.textContent = 'Select a category first.';
        discountStatusMsg.style.color = 'red';
      }
      return;
    }

    discountRules = discountRules.filter(rule => !(
      rule.scope === 'category' &&
      normalizeDiscountType(rule.category) === category &&
      String(rule.material || '') === String(material || '') &&
      String(rule.gender || '') === String(gender || '')
    ));
    discountRules.push({
      id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      scope: 'category',
      productId: null,
      material,
      category,
      gender,
      percent,
      startAt,
      endAt,
      active: true
    });
  }

  renderDiscountRules();
  discountPercentInput.value = '';
  if (discountStartInput) discountStartInput.value = '';
  if (discountEndInput) discountEndInput.value = '';

  try {
    await saveDiscountRules();
    if (discountStatusMsg) {
      discountStatusMsg.textContent = 'Discount rule added and published.';
      discountStatusMsg.style.color = 'lightgreen';
    }
  } catch (error) {
    if (discountStatusMsg) {
      discountStatusMsg.textContent = 'Rule added locally, but failed to publish. Use Save Settings.';
      discountStatusMsg.style.color = 'orange';
    }
    console.error(error);
  }
}

async function removeDiscountRuleById(ruleId) {
  discountRules = discountRules.filter(rule => rule.id !== ruleId);
  renderDiscountRules();

  try {
    await saveDiscountRules();
    if (discountStatusMsg) {
      discountStatusMsg.textContent = 'Discount rule removed and published.';
      discountStatusMsg.style.color = 'lightgreen';
    }
  } catch (error) {
    if (discountStatusMsg) {
      discountStatusMsg.textContent = 'Rule removed locally, but failed to publish. Use Save Settings.';
      discountStatusMsg.style.color = 'orange';
    }
    console.error(error);
  }
}

async function clearDiscountRulesDraft() {
  discountRules = [];
  renderDiscountRules();

  try {
    await saveDiscountRules();
    if (discountStatusMsg) {
      discountStatusMsg.textContent = 'All discount rules cleared and published.';
      discountStatusMsg.style.color = 'lightgreen';
    }
  } catch (error) {
    if (discountStatusMsg) {
      discountStatusMsg.textContent = 'Rules cleared locally, but failed to publish. Use Save Settings.';
      discountStatusMsg.style.color = 'orange';
    }
    console.error(error);
  }
}

function getStainlessBasePrice(category) {
  const normalized = (category || '').toLowerCase();
  if (normalized === 'sets') return Number(setsCategoryInput.value || 0);
  if (normalized === 'rings') return Number(ringsCategoryInput.value || 0);
  if (normalized === 'necklaces') return Number(necklacesCategoryInput.value || 0);
  if (normalized === 'bracelets') return Number(braceletsCategoryInput.value || 0);
  return 0;
}

function getStainlessInputByCategory(category) {
  const normalized = String(category || '').trim().toLowerCase();
  if (normalized === 'sets') return setsCategoryInput;
  if (normalized === 'rings') return ringsCategoryInput;
  if (normalized === 'necklaces') return necklacesCategoryInput;
  if (normalized === 'bracelets') return braceletsCategoryInput;
  return null;
}

function getCategoryLabel(category) {
  const normalized = String(category || '').trim().toLowerCase();
  if (normalized === 'sets') return 'Sets';
  if (normalized === 'rings') return 'Rings';
  if (normalized === 'necklaces') return 'Necklaces';
  if (normalized === 'bracelets') return 'Bracelets';
  return normalized;
}

function getTypeFromCategory(category) {
  const normalized = String(category || '').trim().toLowerCase();
  if (normalized === 'sets') return 'set';
  if (normalized === 'rings') return 'ring';
  if (normalized === 'necklaces') return 'necklace';
  if (normalized === 'bracelets') return 'bracelet';
  return '';
}

function removeCategoryOptionFromSelect(selectElement, category) {
  if (!selectElement) return;
  const optionToRemove = selectElement.querySelector(`option[value="${category}"]`);
  if (optionToRemove) {
    optionToRemove.remove();
  }
}

function addCategoryOptionToSelect(selectElement, category) {
  if (!selectElement) return;
  const hasOption = !!selectElement.querySelector(`option[value="${category}"]`);
  if (hasOption) return;

  const newOption = document.createElement('option');
  newOption.value = category;
  newOption.textContent = getCategoryLabel(category);
  selectElement.appendChild(newOption);
}

async function restoreDeletedCategoryFromProducts(rawCategory) {
  const category = String(rawCategory || '').trim().toLowerCase();
  const label = getCategoryLabel(category);

  if (!category) {
    if (restoreCategoryStatusMsg) {
      restoreCategoryStatusMsg.textContent = 'Choose a category to restore.';
      restoreCategoryStatusMsg.style.color = 'red';
    }
    return;
  }

  const priceInput = prompt('Enter stainless base price (EGP) for ' + label + ':');
  if (priceInput === null) {
    if (restoreCategoryStatusMsg) {
      restoreCategoryStatusMsg.textContent = 'Restore canceled.';
      restoreCategoryStatusMsg.style.color = 'orange';
    }
    return;
  }

  const basePrice = Number(priceInput);
  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    if (restoreCategoryStatusMsg) {
      restoreCategoryStatusMsg.textContent = 'Enter a valid positive price to restore ' + label + '.';
      restoreCategoryStatusMsg.style.color = 'red';
    }
    return;
  }

  const settingKey = getStainlessSettingKey(category);
  if (!settingKey) {
    if (restoreCategoryStatusMsg) {
      restoreCategoryStatusMsg.textContent = 'Unsupported category.';
      restoreCategoryStatusMsg.style.color = 'red';
    }
    return;
  }

  const { error } = await upsertSiteSetting(settingKey, String(basePrice));
  if (error) {
    if (restoreCategoryStatusMsg) {
      restoreCategoryStatusMsg.textContent = 'Failed to restore category: ' + (error.message || 'Unknown error');
      restoreCategoryStatusMsg.style.color = 'red';
    }
    return;
  }

  const stainlessInput = getStainlessInputByCategory(category);
  if (stainlessInput) {
    stainlessInput.value = String(basePrice);
  }

  addCategoryOptionToSelect(productCategory, category);
  addCategoryOptionToSelect(bulkProductCategory, category);

  if (productMaterial?.value === 'stainless') {
    productCategory.value = category;
  }
  if (bulkProductMaterial?.value === 'stainless') {
    bulkProductCategory.value = category;
  }

  syncStainlessBasePrice();
  updateBulkLiveStatus();

  if (restoreCategoryStatusMsg) {
    restoreCategoryStatusMsg.textContent = label + ' restored successfully.';
    restoreCategoryStatusMsg.style.color = 'lightgreen';
  }
}

async function deleteCategoryFromSite(rawCategory) {
  const category = String(rawCategory || '').trim().toLowerCase();
  if (!category) {
    alert('Select a category first.');
    return;
  }

  const firstConfirm = confirm(`Delete category "${category}" from the site?`);
  if (!firstConfirm) return;

  const secondConfirm = confirm('This will permanently delete products in that category and remove its pricing setting. Continue?');
  if (!secondConfirm) return;

  const productType = getTypeFromCategory(category);
  const categoryFilter = productType
    ? `category.eq.${category},and(category.is.null,type.eq.${productType})`
    : `category.eq.${category}`;

  const { error: deleteProductsError } = await supabaseClient
    .from('products')
    .delete()
    .eq('material', 'stainless')
    .or(categoryFilter);

  if (deleteProductsError) {
    alert('Failed to delete category products: ' + deleteProductsError.message);
    return;
  }

  const settingKey = getStainlessSettingKey(category);
  if (settingKey) {
    const { error: settingDeleteError } = await supabaseClient
      .from('site_settings')
      .delete()
      .eq('key', settingKey);

    if (settingDeleteError) {
      alert('Category removed from products, but failed to remove setting: ' + settingDeleteError.message);
      return;
    }

    const stainlessInput = getStainlessInputByCategory(category);
    if (stainlessInput) {
      stainlessInput.value = '';
    }
  }

  productCategory.value = '';
  bulkProductCategory.value = '';
  removeCategoryOptionFromSelect(productCategory, category);
  removeCategoryOptionFromSelect(bulkProductCategory, category);
  syncStainlessBasePrice();
  updateBulkLiveStatus();
  await loadProducts();

  alert(`Category "${category}" was deleted from the site.`);
}

function updateBulkProductFormState() {
  if (!bulkProductMaterial || !bulkProductWeights || !bulkProductCategory) {
    return;
  }

  const isStainless = bulkProductMaterial.value === 'stainless';
  bulkProductCategory.required = isStainless;
  bulkProductWeights.disabled = isStainless;
  bulkProductWeights.required = !isStainless;

  if (isStainless) {
    bulkProductWeights.value = '';
  }

  updateBulkLiveStatus();
}

function getBulkNameCount() {
  return String(bulkProductNames?.value || '')
    .split(/\r?\n/)
    .map(name => name.trim())
    .filter(Boolean)
    .length;
}

function updateBulkLiveStatus() {
  if (!bulkImageCountValue || !bulkNameCountValue || !bulkCountMatchValue || !bulkReadyIndicator || !bulkReadyTitle || !bulkReadyText || !bulkAttemptPreview) {
    return;
  }

  const imageCount = Array.from(bulkProductImages?.files || []).length;
  const nameCount = getBulkNameCount();
  const material = bulkProductMaterial?.value || '';
  const category = String(bulkProductCategory?.value || '').trim();
  const sharedDesc = String(bulkProductDesc?.value || '').trim();
  const hasCountMatch = imageCount > 0 && nameCount > 0 && imageCount === nameCount;

  bulkImageCountValue.textContent = String(imageCount);
  bulkNameCountValue.textContent = String(nameCount);
  bulkCountMatchValue.textContent = hasCountMatch ? 'Yes' : 'No';

  if (bulkCountMatchPill) {
    bulkCountMatchPill.classList.remove('bulk-count-ok', 'bulk-count-bad');
    bulkCountMatchPill.classList.add(hasCountMatch ? 'bulk-count-ok' : 'bulk-count-bad');
  }

  const attemptCount = hasCountMatch ? imageCount : Math.min(imageCount, nameCount);
  bulkAttemptPreview.textContent = String(attemptCount) + ' products will be attempted.';

  let isReady = true;
  let reason = 'Ready to save all valid products.';

  if (imageCount === 0) {
    isReady = false;
    reason = 'Upload at least one image.';
  } else if (nameCount === 0) {
    isReady = false;
    reason = 'Enter at least one product name.';
  } else if (!hasCountMatch) {
    isReady = false;
    reason = 'Image count must match names count.';
  } else if (!sharedDesc) {
    isReady = false;
    reason = 'Add a shared description.';
  } else if (!['stainless', 'silver', 'goldplated'].includes(material)) {
    isReady = false;
    reason = 'Choose a valid material.';
  } else if (material === 'stainless' && !category) {
    isReady = false;
    reason = 'Choose a stainless category.';
  } else if (material === 'stainless') {
    const stainlessBasePrice = getStainlessBasePrice(category);
    if (!stainlessBasePrice || stainlessBasePrice <= 0) {
      isReady = false;
      reason = 'Set a valid stainless base price for "' + category + '" in Prices first.';
    }
  } else if (material === 'silver' || material === 'goldplated') {
    const parsedWeightsResult = parseBulkWeights(bulkProductWeights?.value || '', nameCount || 1);
    if (parsedWeightsResult.error) {
      isReady = false;
      reason = parsedWeightsResult.error;
    }
  }

  bulkReadyIndicator.classList.remove('ready', 'not-ready');
  bulkReadyIndicator.classList.add(isReady ? 'ready' : 'not-ready');
  bulkReadyTitle.textContent = isReady ? 'Ready to save' : 'Not ready';
  bulkReadyText.textContent = reason;
}

function parseBulkWeights(rawWeights, productCount) {
  const normalizedText = String(rawWeights || '').trim();
  if (!normalizedText) {
    return { error: 'Weights are required for silver and goldplated products.' };
  }

  const tokens = normalizedText
    .split(/[\n,]+/)
    .map(value => value.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return { error: 'Please enter at least one weight value.' };
  }

  if (tokens.length !== 1 && tokens.length !== productCount) {
    return {
      error: 'Weights count mismatch: provide exactly 1 weight or ' + productCount + ' weights.'
    };
  }

  const parsed = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const weightValue = Number(tokens[i]);
    if (!Number.isFinite(weightValue) || weightValue <= 0) {
      return {
        error: 'Invalid weight on line ' + (i + 1) + ': "' + tokens[i] + '". Please use positive numbers only.'
      };
    }
    parsed.push(weightValue);
  }

  if (parsed.length === 1) {
    return { weights: Array(productCount).fill(parsed[0]) };
  }

  return { weights: parsed };
}

async function loadPricingSettingsMap() {
  const pricingKeys = [
    'silver_price_per_gram',
    'goldplated_price_per_gram',
    'stainless_profit_percentage',
    'silver_profit_percentage',
    'goldplated_profit_percentage',
    'packaging_cost'
  ];

  const { data, error } = await supabaseClient
    .from('site_settings')
    .select('key,value')
    .in('key', pricingKeys);

  if (error) {
    throw error;
  }

  const settingsMap = {};
  pricingKeys.forEach(key => {
    settingsMap[key] = 0;
  });

  (data || []).forEach(item => {
    settingsMap[item.key] = Number(item.value) || 0;
  });

  return settingsMap;
}

function calculateProductPrice(material, category, weight, pricingSettingsMap) {
  if (material === 'stainless') {
    const basePrice = getStainlessBasePrice(category);
    if (!basePrice || basePrice <= 0) {
      return { error: 'Missing valid stainless base price for category "' + category + '".' };
    }

    const stainlessProfit = Number(pricingSettingsMap.stainless_profit_percentage || 0);
    const packagingCost = Number(pricingSettingsMap.packaging_cost || 0);
    const finalPrice = Math.round(basePrice + (basePrice * stainlessProfit / 100) + packagingCost);
    return { price: finalPrice };
  }

  if (material === 'silver') {
    const materialCost = Number(weight || 0) * Number(pricingSettingsMap.silver_price_per_gram || 0);
    const profitRate = Number(pricingSettingsMap.silver_profit_percentage || 0);
    const packagingCost = Number(pricingSettingsMap.packaging_cost || 0);
    const finalPrice = Math.round(materialCost + (materialCost * profitRate / 100) + packagingCost);
    return { price: finalPrice };
  }

  if (material === 'goldplated') {
    const materialCost = Number(weight || 0) * Number(pricingSettingsMap.goldplated_price_per_gram || 0);
    const profitRate = Number(pricingSettingsMap.goldplated_profit_percentage || 0);
    const packagingCost = Number(pricingSettingsMap.packaging_cost || 0);
    const finalPrice = Math.round(materialCost + (materialCost * profitRate / 100) + packagingCost);
    return { price: finalPrice };
  }

  return { error: 'Unsupported material: ' + material };
}

async function saveBulkProducts(event) {
  event.preventDefault();

  if (!bulkProductStatusMsg) {
    return;
  }

  bulkProductStatusMsg.textContent = '';

  const files = Array.from(bulkProductImages?.files || []);
  const names = String(bulkProductNames?.value || '')
    .split(/\r?\n/)
    .map(name => name.trim())
    .filter(Boolean);
  const sharedDesc = String(bulkProductDesc?.value || '').trim();
  const gender = bulkProductGender?.value || 'Women';
  const type = bulkProductType?.value || 'ring';
  const material = bulkProductMaterial?.value || '';
  const category = (bulkProductCategory?.value || '').trim();

  if (files.length === 0) {
    bulkProductStatusMsg.textContent = 'Please upload at least one image.';
    bulkProductStatusMsg.style.color = 'red';
    return;
  }

  if (names.length === 0) {
    bulkProductStatusMsg.textContent = 'Please enter at least one product name.';
    bulkProductStatusMsg.style.color = 'red';
    return;
  }

  if (files.length !== names.length) {
    bulkProductStatusMsg.textContent = 'Count mismatch: ' + files.length + ' images selected but ' + names.length + ' names provided.';
    bulkProductStatusMsg.style.color = 'red';
    return;
  }

  if (!sharedDesc) {
    bulkProductStatusMsg.textContent = 'Shared description is required.';
    bulkProductStatusMsg.style.color = 'red';
    return;
  }

  if (!['stainless', 'silver', 'goldplated'].includes(material)) {
    bulkProductStatusMsg.textContent = 'Material must be stainless, silver, or goldplated.';
    bulkProductStatusMsg.style.color = 'red';
    return;
  }

  if (material === 'stainless' && !category) {
    bulkProductStatusMsg.textContent = 'Stainless category is required when material is stainless.';
    bulkProductStatusMsg.style.color = 'red';
    return;
  }

  if (material === 'stainless') {
    const stainlessBasePrice = getStainlessBasePrice(category);
    if (!stainlessBasePrice || stainlessBasePrice <= 0) {
      bulkProductStatusMsg.textContent = 'Missing stainless base price for category "' + category + '". Set it in Prices, then try again.';
      bulkProductStatusMsg.style.color = 'red';
      return;
    }
  }

  let itemWeights = Array(names.length).fill(null);
  if (material === 'silver' || material === 'goldplated') {
    const parsedWeightsResult = parseBulkWeights(bulkProductWeights?.value || '', names.length);
    if (parsedWeightsResult.error) {
      bulkProductStatusMsg.textContent = parsedWeightsResult.error;
      bulkProductStatusMsg.style.color = 'red';
      return;
    }
    itemWeights = parsedWeightsResult.weights;
  }

  let pricingSettingsMap;
  try {
    pricingSettingsMap = await loadPricingSettingsMap();
  } catch (error) {
    bulkProductStatusMsg.textContent = 'Failed to load pricing settings: ' + (error.message || 'Unknown error');
    bulkProductStatusMsg.style.color = 'red';
    return;
  }

  const skippedErrors = [];
  const payloads = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const title = names[index];
    const weight = material === 'stainless' ? null : itemWeights[index];

    if (!title) {
      skippedErrors.push('Item ' + (index + 1) + ': missing product name.');
      continue;
    }

    const priceResult = calculateProductPrice(material, category, weight, pricingSettingsMap);
    if (priceResult.error || !priceResult.price || priceResult.price <= 0) {
      skippedErrors.push('Item ' + (index + 1) + ' (' + title + '): ' + (priceResult.error || 'invalid calculated price.'));
      continue;
    }

    let imageUrl = '';
    try {
      const uploadedUrl = await uploadProductImage(file);
      if (!uploadedUrl) {
        skippedErrors.push('Item ' + (index + 1) + ' (' + title + '): failed to upload image.');
        continue;
      }
      imageUrl = uploadedUrl;
    } catch (error) {
      skippedErrors.push('Item ' + (index + 1) + ' (' + title + '): image upload error (' + (error.message || 'unknown') + ').');
      continue;
    }

    const now = new Date().toISOString();
    payloads.push({
      title,
      desc: sharedDesc,
      price: priceResult.price,
      weight,
      img: imageUrl,
      gender,
      type,
      material,
      category: material === 'stainless' ? category : null,
      created_at: now,
      updated_at: now
    });
  }

  if (payloads.length === 0) {
    const details = skippedErrors.length ? ' ' + skippedErrors.join(' | ') : '';
    bulkProductStatusMsg.textContent = 'No valid products to insert.' + details;
    bulkProductStatusMsg.style.color = 'red';
    return;
  }

  try {
    const cleanedPayloads = payloads.map(p => Object.fromEntries(Object.entries(p).filter(([_, v]) => v !== undefined && v !== '')));
    const { error } = await supabaseClient
      .from('products')
      .insert(cleanedPayloads);

    if (error) {
      bulkProductStatusMsg.textContent = 'Failed to insert products: ' + (error.message || 'Unknown error');
      bulkProductStatusMsg.style.color = 'red';
      return;
    }
  } catch (error) {
    bulkProductStatusMsg.textContent = 'Failed to insert products: ' + (error.message || 'Unknown error');
    bulkProductStatusMsg.style.color = 'red';
    return;
  }

  const skippedCount = skippedErrors.length;
  const successSummary = 'Inserted ' + payloads.length + ' product(s).' +
    (skippedCount ? ' Skipped ' + skippedCount + ' item(s): ' + skippedErrors.join(' | ') : '');
  bulkProductStatusMsg.textContent = successSummary;
  bulkProductStatusMsg.style.color = 'lightgreen';

  bulkProductFormElement.reset();
  updateBulkProductFormState();
  await loadProducts();
}

async function loadCurrentPrices() {
  const { data, error } = await supabaseClient
    .from("site_settings")
    .select("key,value")
    .in("key", [
      "silver_price_per_gram",
      "goldplated_price_per_gram",
      "stainless_profit_percentage",
      "silver_profit_percentage",
      "goldplated_profit_percentage",
      "packaging_cost"
    ]);

  if (error) {
    pricesStatusMsg.textContent = "Failed to load current settings.";
    pricesStatusMsg.style.color = "red";
    return;
  }

  const settings = Array.isArray(data) ? data : [];
  settings.forEach(item => {
    if (item.key === "silver_price_per_gram") {
      silverPriceInput.value = item.value;
    }
    if (item.key === "goldplated_price_per_gram") {
      goldplatedPriceInput.value = item.value;
    }
    if (item.key === "stainless_profit_percentage") {
      stainlessProfitPercentageInput.value = item.value;
    }
    if (item.key === "silver_profit_percentage") {
      silverProfitPercentageInput.value = item.value;
    }
    if (item.key === "goldplated_profit_percentage") {
      goldplatedProfitPercentageInput.value = item.value;
    }
    if (item.key === "packaging_cost") {
      packagingCostInput.value = item.value;
    }
  });
}

async function loadCategories() {
  await loadStainlessPriceSettings();
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatEgp(value) {
  return `EGP ${Number(value || 0).toLocaleString('en-US')}`;
}

function normalizeOrderStatus(status) {
  return String(status || 'pending').trim().toLowerCase();
}

function formatStatusLabel(status) {
  const normalized = normalizeOrderStatus(status);
  if (normalized === 'in_progress') {
    return 'In Progress';
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/_/g, ' ');
}

function getStatusBadgeClass(status) {
  const normalized = normalizeOrderStatus(status);
  if (normalized === 'delivered') return 'status-badge-delivered';
  if (normalized === 'cancelled') return 'status-badge-cancelled';
  if (normalized === 'delivering') return 'status-badge-delivering';
  if (normalized === 'shipped') return 'status-badge-shipped';
  if (normalized === 'processing') return 'status-badge-processing';
  return 'status-badge-pending';
}

function getStatusOptionsMarkup(currentStatus) {
  const options = ["pending", "processing", "delivering", "shipped", "delivered", "cancelled"];
  const normalizedStatus = normalizeOrderStatus(currentStatus);

  return options
    .map(status => {
      const selected = status === normalizedStatus ? ' selected' : '';
      const label = status.charAt(0).toUpperCase() + status.slice(1);
      return `<option value="${status}"${selected}>${label}</option>`;
    })
    .join('');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderOrderItems(items) {
  let normalizedItems = items;

  if (typeof normalizedItems === 'string') {
    try {
      normalizedItems = JSON.parse(normalizedItems);
    } catch {
      normalizedItems = [];
    }
  }

  if (!Array.isArray(normalizedItems) || normalizedItems.length === 0) {
    return '<p class="muted-text">No items saved for this order.</p>';
  }

  return `
    <ul class="order-items-list">
      ${normalizedItems.map(item => `
        <li>
          <strong>${escapeHtml(item.title || 'Item')}</strong>
          <span> x${Number(item.quantity || 1)}</span>
          <span> - ${formatEgp((item.price || 0) * Number(item.quantity || 1))}</span>
          ${item.size ? `<span class="item-meta">Size: ${escapeHtml(item.size)}</span>` : ''}
        </li>
      `).join('')}
    </ul>
  `;
}

function groupOrdersByCustomer(orders) {
  const grouped = new Map();

  orders.forEach(order => {
    const name = (order.name || 'Customer').trim();
    const phone = (order.phone || '').trim();
    const key = `${name}__${phone}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        name,
        phone,
        orders: []
      });
    }

    grouped.get(key).orders.push(order);
  });

  return Array.from(grouped.values()).map((customer) => {
    const deliveredSpent = customer.orders
      .filter((order) => normalizeOrderStatus(order.status) === 'delivered')
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    const currentPoints = getLoyaltyPointsForPhone(customer.phone);
    const redeemableValue = Math.floor(currentPoints / 1000) * LOYALTY_DISCOUNT_PER_1000_POINTS;

    return {
      ...customer,
      loyaltyPoints: currentPoints,
      loyaltyRedeemableValue: redeemableValue,
      deliveredSpent
    };
  });
}

function filterUserOrders(orders, query) {
  const normalizedQuery = String(query || '').trim().toLowerCase();

  if (!normalizedQuery) {
    return orders;
  }

  return orders.filter(order => {
    const name = String(order.name || '').toLowerCase();
    const phone = String(order.phone || '').toLowerCase();
    return name.includes(normalizedQuery) || phone.includes(normalizedQuery);
  });
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 11);
}

function bindPhoneInputConstraint(inputElement) {
  if (!inputElement) {
    return;
  }

  const sanitizePhoneField = () => {
    const sanitized = normalizePhone(inputElement.value);
    if (inputElement.value !== sanitized) {
      inputElement.value = sanitized;
    }
  };

  inputElement.addEventListener('input', sanitizePhoneField);
  inputElement.addEventListener('blur', sanitizePhoneField);
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

async function loadLoyaltyProgramState() {
  const { data, error } = await supabaseClient
    .from('site_settings')
    .select('value')
    .eq('key', LOYALTY_SETTING_KEY)
    .maybeSingle();

  if (error) {
    console.warn('Failed to load loyalty program state:', error);
    loyaltyProgramState = parseLoyaltyProgramState(null);
    return;
  }

  loyaltyProgramState = parseLoyaltyProgramState(data?.value);
}

async function saveLoyaltyProgramState() {
  await upsertSiteSetting(LOYALTY_SETTING_KEY, JSON.stringify(loyaltyProgramState));
}

function getLoyaltyPointsForPhone(phone) {
  const key = normalizePhone(phone);
  if (!key) return 0;
  const points = Number(loyaltyProgramState?.accounts?.[key]?.points || 0);
  return Number.isFinite(points) && points > 0 ? Math.floor(points) : 0;
}

function setLoyaltyPointsForPhone(phone, points, name = '') {
  const key = normalizePhone(phone);
  if (!key) {
    return false;
  }

  const sanitizedPoints = Math.max(0, Math.floor(Number(points || 0)));
  loyaltyProgramState.accounts[key] = {
    ...(loyaltyProgramState.accounts[key] || {}),
    points: sanitizedPoints,
    name: name || loyaltyProgramState.accounts[key]?.name || '',
    updatedAt: new Date().toISOString()
  };

  return true;
}

function calculateAwardPointsFromOrder(order) {
  const total = Math.max(0, Number(order?.total || 0));
  return Math.floor(total / 1000) * LOYALTY_POINTS_PER_1000_SPENT;
}

async function awardLoyaltyPointsForDeliveredOrder(order) {
  const orderId = String(order?.id || '').trim();
  const phone = normalizePhone(order?.phone || '');
  if (!orderId || !phone) return;

  if (loyaltyProgramState.awardedOrderIds.includes(orderId)) {
    return;
  }

  const pointsToAward = calculateAwardPointsFromOrder(order);
  if (pointsToAward <= 0) {
    loyaltyProgramState.awardedOrderIds.push(orderId);
    loyaltyProgramState.awardedOrderIds = Array.from(new Set(loyaltyProgramState.awardedOrderIds));
    await saveLoyaltyProgramState();
    return;
  }

  const currentPoints = getLoyaltyPointsForPhone(phone);
  setLoyaltyPointsForPhone(phone, currentPoints + pointsToAward, order?.name || '');

  loyaltyProgramState.awardedOrderIds.push(orderId);
  loyaltyProgramState.awardedOrderIds = Array.from(new Set(loyaltyProgramState.awardedOrderIds));
  loyaltyProgramState.transactions = [
    {
      type: 'award',
      phone,
      orderId,
      points: pointsToAward,
      createdAt: new Date().toISOString()
    },
    ...(loyaltyProgramState.transactions || [])
  ].slice(0, 800);

  await saveLoyaltyProgramState();
}

const adminShippingCosts = {
  'cairo': 120,
  'giza': 120,
  'alexandria': 130,
  'beheira': 130,
  'dakahlia': 140,
  'gharbia': 140,
  'kafr el sheikh': 140,
  'sharqia': 140,
  'damietta': 140,
  'port said': 140,
  'ismailia': 140,
  'suez': 140,
  'monufia': 140,
  'qalyubia': 140,
  'fayoum': 150,
  'beni suef': 150,
  'minya': 150,
  'assiut': 150,
  'sohag': 150,
  'qena': 160,
  'luxor': 160,
  'red sea': 160,
  'matrouh': 160,
  'aswan': 160,
  'north sinai': 190,
  'south sinai': 190,
  'new valley': 190
};

const adminFreeShippingThreshold = 1999;

function normalizeGovernment(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function getAdminShippingCost(subtotal, government) {
  if (Number(subtotal || 0) > adminFreeShippingThreshold) {
    return 0;
  }

  return adminShippingCosts[normalizeGovernment(government)] || 0;
}

function parseOrderItemsInput(rawItems) {
  const value = String(rawItems || "").trim();
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return null;
  }
}

function calculateOrderTotalLive() {
  const subtotal = Number(orderSubtotalInput?.value || 0);
  const discount = Number(orderDiscountInput?.value || 0);
  const shipping = getAdminShippingCost(subtotal, orderGovernmentInput?.value || '');

  if (orderShippingInput) {
    orderShippingInput.value = shipping.toFixed(2);
  }

  const total = Math.max(0, subtotal - discount + shipping);

  if (orderTotalInput) {
    orderTotalInput.value = total.toFixed(2);
  }
}

function serializeManualItemsToInput() {
  if (!orderItemsInput) return;
  orderItemsInput.value = JSON.stringify(manualOrderItems, null, 2);
}

function renderManualOrderItemsPreview() {
  if (!orderItemsPreview) return;

  if (!Array.isArray(manualOrderItems) || manualOrderItems.length === 0) {
    orderItemsPreview.innerHTML = '<p class="muted-text">No items added yet.</p>';
    return;
  }

  orderItemsPreview.innerHTML = manualOrderItems.map((item, index) => {
    const qty = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const lineTotal = qty * price;
    return `
      <div class="order-items-preview-row">
        <span>${escapeHtml(item.title || 'Item')} x${qty} - EGP ${lineTotal.toFixed(2)}</span>
        <button type="button" class="order-delete-btn js-remove-manual-item" data-index="${index}">Remove</button>
      </div>
    `;
  }).join('');
}

function refreshAmountsFromManualItems() {
  const subtotal = manualOrderItems.reduce((sum, item) => {
    return sum + (Number(item.price || 0) * Number(item.quantity || 1));
  }, 0);

  if (orderSubtotalInput) {
    orderSubtotalInput.value = subtotal.toFixed(2);
  }

  calculateOrderTotalLive();
}

function loadOrderProductPicker() {
  if (!orderProductSelect) return;

  const searchTerm = String(orderProductSearch?.value || "").trim().toLowerCase();
  const filteredProducts = allProductsCatalog.filter(product => {
    if (!searchTerm) return true;
    return String(product.title || "").toLowerCase().includes(searchTerm);
  });

  const options = ['<option value="">Select a product</option>'];
  filteredProducts.forEach(product => {
    const label = `${product.title} - EGP ${Number(product.price || 0).toFixed(2)}`;
    options.push(`<option value="${escapeHtml(String(product.id))}">${escapeHtml(label)}</option>`);
  });

  orderProductSelect.innerHTML = options.join('');

  if (orderProductSuggestions) {
    orderProductSuggestions.innerHTML = filteredProducts
      .map(product => `<option value="${escapeHtml(product.title || '')}"></option>`)
      .join('');
  }
}

function findProductBySearchInput() {
  const query = String(orderProductSearch?.value || "").trim().toLowerCase();
  if (!query) return null;

  const exact = allProductsCatalog.find(product => String(product.title || "").trim().toLowerCase() === query);
  if (exact) return exact;

  return allProductsCatalog.find(product => String(product.title || "").toLowerCase().includes(query)) || null;
}

function addSelectedProductToManualOrder() {
  const selectedId = orderProductSelect?.value;
  const qty = Math.max(1, Number(orderProductQty?.value || 1));

  if (!selectedId) {
    if (orderFormStatus) {
      orderFormStatus.textContent = "Choose a product first.";
      orderFormStatus.style.color = "#ff9a8d";
    }
    return;
  }

  const product = allProductsCatalog.find(p => String(p.id) === String(selectedId));
  if (!product) {
    if (orderFormStatus) {
      orderFormStatus.textContent = "Selected product not found.";
      orderFormStatus.style.color = "#ff9a8d";
    }
    return;
  }

  const existing = manualOrderItems.find(item => String(item.id || '') === String(product.id));
  if (existing) {
    existing.quantity = Number(existing.quantity || 1) + qty;
  } else {
    manualOrderItems.push({
      id: product.id,
      title: product.title,
      quantity: qty,
      price: Number(product.price || 0),
      type: product.type || null,
      material: product.material || null,
      gender: product.gender || null,
      category: product.category || null,
      img: product.img || null
    });
  }

  serializeManualItemsToInput();
  renderManualOrderItemsPreview();
  refreshAmountsFromManualItems();

  if (orderFormStatus) {
    orderFormStatus.textContent = "Item added to order.";
    orderFormStatus.style.color = "lightgreen";
  }

  if (orderProductSelect) {
    orderProductSelect.value = "";
  }
}

function syncManualItemsFromInput() {
  const parsedItems = parseOrderItemsInput(orderItemsInput?.value || "");
  if (parsedItems === null) {
    if (orderFormStatus) {
      orderFormStatus.textContent = "Items JSON is invalid.";
      orderFormStatus.style.color = "#ff9a8d";
    }
    return;
  }

  manualOrderItems = parsedItems;
  renderManualOrderItemsPreview();

  const hasItems = Array.isArray(manualOrderItems) && manualOrderItems.length > 0;
  if (hasItems) {
    refreshAmountsFromManualItems();
  } else {
    calculateOrderTotalLive();
  }
}

async function addOrderRecord(event) {
  event.preventDefault();

  const name = orderCustomerNameInput?.value.trim() || "";
  const phone = normalizePhone(orderCustomerPhoneInput?.value || "");
  const alternativePhone = normalizePhone(orderCustomerPhone2Input?.value || "") || null;
  const government = orderGovernmentInput?.value.trim() || "";
  const address = orderAddressInput?.value.trim() || "";
  const paymentMethod = orderPaymentMethodInput?.value || "Cash on Delivery";
  const status = normalizeOrderStatus(orderStatusInput?.value || "pending");
  const subtotal = Number(orderSubtotalInput?.value || 0);
  const discount = Number(orderDiscountInput?.value || 0);
  const shipping = getAdminShippingCost(subtotal, government);
  const total = Number(orderTotalInput?.value || 0);
  const couponCode = orderCouponCodeInput?.value.trim() || null;
  const items = parseOrderItemsInput(orderItemsInput?.value || "");

  if (!name || !phone || !government || !address || !paymentMethod) {
    if (orderFormStatus) {
      orderFormStatus.textContent = "Please fill all required order fields.";
      orderFormStatus.style.color = "#ff9a8d";
    }
    return;
  }

  if (items === null) {
    if (orderFormStatus) {
      orderFormStatus.textContent = "Items JSON is invalid. Use an array like [{\"title\":\"Ring\",\"quantity\":1,\"price\":250}]";
      orderFormStatus.style.color = "#ff9a8d";
    }
    return;
  }

  if (subtotal < 0 || discount < 0 || shipping < 0 || total < 0) {
    if (orderFormStatus) {
      orderFormStatus.textContent = "Amounts cannot be negative.";
      orderFormStatus.style.color = "#ff9a8d";
    }
    return;
  }

  if (orderShippingInput) {
    orderShippingInput.value = shipping.toFixed(2);
  }

  if (orderTotalInput) {
    orderTotalInput.value = Math.max(0, subtotal - discount + shipping).toFixed(2);
  }

  const payload = {
    name,
    phone,
    government,
    address,
    alternative_phone: alternativePhone,
    payment_method: paymentMethod,
    coupon_code: couponCode,
    subtotal,
    discount_amount: discount,
    shipping,
    total,
    items,
    status,
    created_at: new Date().toISOString()
  };

  // If a user is logged in, attach their user id so RLS policies pass.
  try {
    const authDebug = await getAuthDebug?.();
    console.debug('Admin manual insert debug - auth', authDebug, 'payloadBefore=', payload);
    const userId = await getCurrentUserId?.();
    if (userId) payload.user_id = userId;
  } catch (e) {
    console.warn('Could not determine current user id for admin insert', e);
  }

  const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined && v !== ''));
  const { data: insertedOrder, error } = await supabaseClient
    .from("customer_orders")
    .insert(cleanPayload)
    .select('*')
    .single();

  if (error) {
    if (orderFormStatus) {
      orderFormStatus.textContent = `Failed to add order: ${error.message || 'Unknown error'}`;
      orderFormStatus.style.color = "#ff9a8d";
    }
    return;
  }

  if (normalizeOrderStatus(status) === 'delivered' && insertedOrder) {
    try {
      await awardLoyaltyPointsForDeliveredOrder(insertedOrder);
    } catch (loyaltyError) {
      console.error('Loyalty award failed for manually added delivered order:', loyaltyError);
      if (orderFormStatus) {
        orderFormStatus.textContent = 'Order saved, but loyalty award failed.';
        orderFormStatus.style.color = '#ffcb86';
      }
    }
  }

  await loadUserOrders();
  if (orderFormStatus) {
    orderFormStatus.textContent = "Order added successfully.";
    orderFormStatus.style.color = "lightgreen";
  }
  addOrderForm.reset();
  manualOrderItems = [];
  renderManualOrderItemsPreview();
  calculateOrderTotalLive();
}

function renderUserOrders() {
  if (!usersList) return;

  const filteredOrders = filterUserOrders(allUserOrders, userSearchInput?.value);

  if (allUserOrders.length === 0) {
    usersList.innerHTML = `<p>No user orders yet.</p>`;
    return;
  }

  if (filteredOrders.length === 0) {
    usersList.innerHTML = `<p class="muted-text">No customers match your search.</p>`;
    return;
  }

  const groupedOrders = groupOrdersByCustomer(filteredOrders);

  usersList.innerHTML = `
    <div class="users-list">
      ${groupedOrders.map(user => `
        <details class="user-card">
          <summary>
            <div>
              <h3>${escapeHtml(user.name)}</h3>
              <p>${escapeHtml(user.phone || 'No phone')}</p>
            </div>
            <span class="user-order-count">${user.orders.length} order${user.orders.length === 1 ? '' : 's'}</span>
          </summary>
          <div class="user-card-body">
            <div class="order-meta-grid loyalty-admin-grid">
              <div><span>Loyalty Points</span><strong>${Math.max(0, Number(user.loyaltyPoints || 0)).toLocaleString('en-US')}</strong></div>
              <div><span>Redeemable Discount</span><strong>${formatEgp(user.loyaltyRedeemableValue || 0)}</strong></div>
              <div><span>Delivered Spend</span><strong>${formatEgp(user.deliveredSpent || 0)}</strong></div>
              <div class="loyalty-editor-wrap">
                <span>Adjust Points</span>
                <div class="loyalty-editor-row">
                  <input type="number" class="order-status-select js-loyalty-input" data-user-phone="${escapeHtml(user.phone || '')}" value="${Math.max(0, Number(user.loyaltyPoints || 0))}" min="0" step="1" />
                  <button type="button" class="order-action-btn js-save-loyalty" data-user-phone="${escapeHtml(user.phone || '')}" data-user-name="${escapeHtml(user.name || '')}">Save Points</button>
                </div>
              </div>
            </div>
            ${user.orders.map(order => `
              <div class="order-card">
                <div class="order-header">
                  <div>
                    <strong>Order placed:</strong> ${formatDateTime(order.created_at)}
                  </div>
                  <div class="order-total">${formatEgp(order.total)}</div>
                </div>

                <div class="order-meta-grid">
                  <div><span>Government</span><strong>${escapeHtml(order.government || '-')}</strong></div>
                  <div><span>Address</span><strong>${escapeHtml(order.address || '-')}</strong></div>
                  <div><span>Alt Phone</span><strong>${escapeHtml(order.alternative_phone || '-')}</strong></div>
                  <div><span>Payment</span><strong>${escapeHtml(order.payment_method || '-')}</strong></div>
                  <div><span>Coupon</span><strong>${escapeHtml(order.coupon_code || '-')}</strong></div>
                  <div>
                    <span>Status</span>
                    <strong>
                      <span class="status-badge ${getStatusBadgeClass(order.status)}">${escapeHtml(formatStatusLabel(order.status))}</span>
                    </strong>
                  </div>
                </div>

                <div class="order-summary-grid">
                  <div><span>Subtotal</span><strong>${formatEgp(order.subtotal)}</strong></div>
                  <div><span>Discount</span><strong>${formatEgp(order.discount_amount)}</strong></div>
                  <div><span>Shipping</span><strong>${formatEgp(order.shipping)}</strong></div>
                  <div><span>Total</span><strong>${formatEgp(order.total)}</strong></div>
                </div>

                ${order.discount_breakdown ? `
                  <div class="order-discount-breakdown">
                    <strong>Discount Details:</strong>
                    ${(() => {
                      try {
                        const breakdown = typeof order.discount_breakdown === 'string' ? JSON.parse(order.discount_breakdown) : order.discount_breakdown;
                        let details = '';
                        if (breakdown.buy2Get1Discount > 0) {
                          details += `<div>• Buy 2 Get 1 Free: ${formatEgp(breakdown.buy2Get1Discount)}</div>`;
                        }
                        if (breakdown.promoDiscount > 0) {
                          details += `<div>• Promo Code: ${formatEgp(breakdown.promoDiscount)}</div>`;
                        }
                        if (breakdown.loyaltyDiscount > 0) {
                          details += `<div>• Loyalty Points: ${formatEgp(breakdown.loyaltyDiscount)}</div>`;
                        }
                        return details || '<div><em>No discounts applied</em></div>';
                      } catch (e) {
                        return '<div><em>No discount details available</em></div>';
                      }
                    })()}
                  </div>
                ` : ''}

                <div class="order-actions" data-order-id="${escapeHtml(order.id)}">
                  <label class="status-control">
                    <span>Update Status</span>
                    <select class="order-status-select js-status-select">
                      ${getStatusOptionsMarkup(order.status)}
                    </select>
                  </label>
                  <button type="button" class="order-action-btn js-save-status">Save Status</button>
                  <button type="button" class="order-action-btn order-delete-btn js-delete-order">Delete Order</button>
                </div>

                <div class="order-items-block">
                  <h4>Items</h4>
                  ${renderOrderItems(order.items)}
                </div>
              </div>
            `).join('')}
          </div>
        </details>
      `).join('')}
    </div>
  `;
}

async function loadUserOrders() {
  if (!usersList) return;

  await loadLoyaltyProgramState();

  const { data, error } = await supabaseClient
    .from("customer_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    usersList.innerHTML = `<p>Failed to load user data.</p>`;
    console.error("Failed to load user orders:", error);
    return;
  }

  allUserOrders = Array.isArray(data) ? data : [];
  renderUserOrders();
}

async function updateOrderStatus(orderId, status) {
  const normalizedOrderId = String(orderId);
  const normalizedStatus = normalizeOrderStatus(status);
  const targetOrder = allUserOrders.find(order => String(order.id) === normalizedOrderId) || null;
  const previousStatus = normalizeOrderStatus(targetOrder?.status);

  const { error } = await supabaseClient
    .from("customer_orders")
    .update({ status: normalizedStatus })
    .eq("id", normalizedOrderId);

  if (error) {
    throw error;
  }

  allUserOrders = allUserOrders.map(order => {
    if (String(order.id) !== normalizedOrderId) {
      return order;
    }

    return {
      ...order,
      status: normalizedStatus
    };
  });

  if (normalizedStatus === 'delivered' && previousStatus !== 'delivered' && targetOrder) {
    try {
      await awardLoyaltyPointsForDeliveredOrder({
        ...targetOrder,
        status: normalizedStatus
      });
    } catch (loyaltyError) {
      console.error('Loyalty award failed after delivery status update:', loyaltyError);
      if (pricesStatusMsg) {
        pricesStatusMsg.textContent = 'Order marked delivered, but loyalty award failed. Retry by saving delivered status again.';
        pricesStatusMsg.style.color = 'orange';
      }
    }
  }

  renderUserOrders();
}

async function updateCustomerLoyaltyPoints(phone, points, name = '') {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    throw new Error('Customer phone is required to update loyalty points.');
  }

  const sanitizedPoints = Math.max(0, Math.floor(Number(points || 0)));
  setLoyaltyPointsForPhone(normalizedPhone, sanitizedPoints, name);

  loyaltyProgramState.transactions = [
    {
      type: 'admin_adjust',
      phone: normalizedPhone,
      points: sanitizedPoints,
      createdAt: new Date().toISOString()
    },
    ...(loyaltyProgramState.transactions || [])
  ].slice(0, 800);

  await saveLoyaltyProgramState();
  renderUserOrders();
}

async function saveLoyaltyPointsFromManualForm() {
  const phone = normalizePhone(loyaltyPhoneInput?.value || '');
  const name = String(loyaltyNameInput?.value || '').trim();
  const pointsValue = Math.max(0, Math.floor(Number(loyaltyPointsInput?.value || 0)));
  const mode = String(loyaltyModeSelect?.value || 'add').toLowerCase();

  if (!phone) {
    if (loyaltyManualStatus) {
      loyaltyManualStatus.textContent = 'Enter a valid phone number first.';
      loyaltyManualStatus.style.color = '#ff9a8d';
    }
    return;
  }

  await loadLoyaltyProgramState();

  const currentPoints = getLoyaltyPointsForPhone(phone);
  let nextPoints = currentPoints;
  if (mode === 'set') {
    nextPoints = pointsValue;
  } else if (mode === 'subtract') {
    nextPoints = Math.max(0, currentPoints - pointsValue);
  } else {
    nextPoints = currentPoints + pointsValue;
  }

  setLoyaltyPointsForPhone(phone, nextPoints, name);
  loyaltyProgramState.transactions = [
    {
      type: mode === 'set' ? 'admin_set' : mode === 'subtract' ? 'admin_subtract' : 'admin_add',
      phone,
      points: pointsValue,
      resultingPoints: nextPoints,
      createdAt: new Date().toISOString()
    },
    ...(loyaltyProgramState.transactions || [])
  ].slice(0, 800);

  await saveLoyaltyProgramState();
  await loadUserOrders();

  if (loyaltyManualStatus) {
    const modeLabel = mode === 'set' ? 'set' : mode === 'subtract' ? 'subtracted' : 'added';
    loyaltyManualStatus.textContent = `Saved. Points ${modeLabel} successfully. Customer now has ${nextPoints.toLocaleString('en-US')} points.`;
    loyaltyManualStatus.style.color = 'lightgreen';
  }
}

async function deleteOrderRecord(orderId) {
  const normalizedOrderId = String(orderId);

  const { error } = await supabaseClient
    .from("customer_orders")
    .delete()
    .eq("id", normalizedOrderId);

  if (error) {
    throw error;
  }

  allUserOrders = allUserOrders.filter(order => String(order.id) !== normalizedOrderId);
  renderUserOrders();
}

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load products:", error);
    productsList.innerHTML = "<p>Failed to load products</p>";
    return;
  }

  allProductsCatalog = Array.isArray(data) ? data : [];
  loadOrderProductPicker();
  loadDiscountProductOptions();
  renderDiscountRules();

  productsList.innerHTML = data.map(product => `
    <div class="product-card">
      <h3>${product.title}</h3>
      <p><strong>Price:</strong> EGP ${product.price}</p>
      ${product.weight ? `<p><strong>Weight:</strong> ${product.weight}g</p>` : ''}
      <p><strong>Material:</strong> ${product.material}</p>
      <p><strong>Type:</strong> ${product.type}</p>
      <p><strong>Gender:</strong> ${product.gender}</p>
      ${product.category ? `<p><strong>Category:</strong> ${product.category}</p>` : ''}
      ${product.img ? `<img src="${product.img}" alt="${product.title}" style="max-width: 100px; max-height: 100px; margin-top: 10px;">` : ''}
      <button onclick="editProduct(${product.id})">Edit</button>
      <button onclick="deleteProduct(${product.id})" class="delete-btn">Delete</button>
    </div>
  `).join('');
}

function showProductForm(product = null) {
  setProductsWorkspaceTab('single');

  if (product) {
    formTitle.textContent = "Edit Product";
    productId.value = product.id;
    productTitle.value = product.title;
    productDesc.value = product.desc;
    productPrice.value = product.price || '';
    productWeight.value = product.weight || '';
    productGender.value = product.gender;
    productType.value = product.type;
    productMaterial.value = product.material;
    productCategory.value = product.category || '';

    // Clear file input and show current image
    productImgFile.value = '';
    const imagePreview = document.getElementById('imagePreview');
    if (product.img) {
      imagePreview.innerHTML = `<img src="${product.img}" alt="Current image" style="max-width: 200px; max-height: 200px;">`;
    } else {
      imagePreview.innerHTML = '';
    }
  } else {
    formTitle.textContent = "Add Product";
    productForm.querySelector('form').reset();
    productId.value = '';
    document.getElementById('imagePreview').innerHTML = '';
  }
  updateProductFormState();
  productForm.style.display = 'block';
}

function updateProductFormState() {
  const isStainless = productMaterial.value === 'stainless';
  productWeightWrap.style.display = isStainless ? 'none' : 'block';
  productPrice.closest('div').style.display = isStainless ? 'block' : 'none';
  productPrice.readOnly = isStainless;
  productPrice.required = isStainless;
  productWeight.required = !isStainless;
  productCategory.required = false;

  if (isStainless) {
    productPrice.value = getStainlessBasePrice(productCategory.value);
  } else {
    productPrice.value = '';
  }
}

function syncStainlessBasePrice() {
  if (productMaterial.value !== 'stainless') {
    return;
  }

  productPrice.value = getStainlessBasePrice(productCategory.value);
}

function hideProductForm() {
  productForm.style.display = 'none';
  setProductsWorkspaceTab('catalog');
}

async function saveProduct(event) {
  event.preventDefault();

  // Get current settings for price calculation
  const { data: settings, error: settingsError } = await supabaseClient
    .from("site_settings")
    .select("key,value")
    .in("key", [
      "silver_price_per_gram",
      "goldplated_price_per_gram",
      "stainless_profit_percentage",
      "silver_profit_percentage",
      "goldplated_profit_percentage",
      "packaging_cost"
    ]);

  if (settingsError) {
    alert("Failed to load pricing settings: " + settingsError.message);
    return;
  }

  const settingsMap = {};
  settings.forEach(item => {
    settingsMap[item.key] = Number(item.value);
  });

  const weight = productWeight.value ? parseFloat(productWeight.value) : null;
  const material = productMaterial.value;
  let calculatedPrice = 0;

  if (material === 'stainless') {
    const stainlessBasePrice = getStainlessBasePrice(productCategory.value);
    if (!productCategory.value) {
      alert("Please choose a stainless category.");
      return;
    }

    if (!stainlessBasePrice || stainlessBasePrice <= 0) {
      alert("Please set a valid stainless price for the selected category.");
      return;
    }

    const profitAmount = (settingsMap.stainless_profit_percentage / 100) * stainlessBasePrice;
    calculatedPrice = Math.round(stainlessBasePrice + profitAmount + settingsMap.packaging_cost);
  } else {
    if (!weight || weight <= 0) {
      alert("Please enter a valid weight for silver or goldplated products.");
      return;
    }

    // Calculate price: (price_per_gram * weight) + (profit_percentage/100 * material_cost) + packaging_cost
    const materialPricePerGram = material === 'silver' ? settingsMap.silver_price_per_gram :
                                material === 'goldplated' ? settingsMap.goldplated_price_per_gram : 0;
    const materialCost = weight * materialPricePerGram;
    const profitRate = material === 'silver' ? settingsMap.silver_profit_percentage : settingsMap.goldplated_profit_percentage;
    const profitAmount = (profitRate / 100) * materialCost;
    calculatedPrice = Math.round(materialCost + profitAmount + settingsMap.packaging_cost);
  }

  if (!calculatedPrice || calculatedPrice <= 0) {
    alert("Could not calculate a valid price. Please check the settings.");
    return;
  }

  // Handle image upload
  let imageUrl = '';
  if (productImgFile.files && productImgFile.files[0]) {
    const uploadedUrl = await uploadProductImage(productImgFile.files[0]);
    if (!uploadedUrl) {
      alert("Failed to upload image. Please try again.");
      return;
    }
    imageUrl = uploadedUrl;
  } else if (productId.value) {
    // For edits, keep existing image if no new file uploaded
    const { data: existingProduct } = await supabaseClient
      .from("products")
      .select("img")
      .eq("id", productId.value)
      .single();
    imageUrl = existingProduct?.img || '';
  } else {
    alert("Please select a product image.");
    return;
  }

  const productData = {
    title: productTitle.value,
    desc: productDesc.value,
    price: calculatedPrice,
    weight: material === 'stainless' ? null : weight,
    img: imageUrl,
    gender: productGender.value,
    type: productType.value,
    material: productMaterial.value,
    category: productCategory.value || null,
    updated_at: new Date().toISOString()
  };

  let result;
  if (productId.value) {
    // Update
    result = await supabaseClient
      .from("products")
      .update(productData)
      .eq("id", productId.value);
  } else {
    // Insert
    productData.created_at = new Date().toISOString();
    const cleanProductData = Object.fromEntries(Object.entries(productData).filter(([_, v]) => v !== undefined && v !== ''));
    result = await supabaseClient
      .from("products")
      .insert(cleanProductData);
  }

  if (result.error) {
    alert("Failed to save product: " + result.error.message);
  } else {
    hideProductForm();
    loadProducts();
  }
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  const { error } = await supabaseClient
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Failed to delete product: " + error.message);
  } else {
    loadProducts();
  }
}

async function deleteAllProducts() {
  const firstConfirm = confirm("Are you sure you want to remove all products?");
  if (!firstConfirm) return;

  const secondConfirm = confirm("This action cannot be undone. Remove every product now?");
  if (!secondConfirm) return;

  const { error } = await supabaseClient
    .from("products")
    .delete()
    .not("id", "is", null);

  if (error) {
    alert("Failed to remove all products: " + error.message);
    return;
  }

  hideProductForm();
  await loadProducts();
  alert("All products were removed successfully.");
}

async function editProduct(id) {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert("Failed to load product: " + error.message);
  } else {
    showProductForm(data);
  }
}

async function recalculateStainlessProductPrices() {
  const { data: products, error: loadError } = await supabaseClient
    .from("products")
    .select("id, type, category, material")
    .eq("material", "stainless");

  if (loadError) {
    throw loadError;
  }

  const { data: settings, error: settingsError } = await supabaseClient
    .from("site_settings")
    .select("key,value")
    .in("key", [
      "stainless_price_sets",
      "stainless_price_rings",
      "stainless_price_necklaces",
      "stainless_price_bracelets",
      "stainless_profit_percentage",
      "packaging_cost"
    ]);

  if (settingsError) {
    throw settingsError;
  }

  const settingsMap = {};
  (settings || []).forEach(item => {
    settingsMap[item.key] = Number(item.value);
  });

  const stainlessProfitRate = Number(settingsMap.stainless_profit_percentage || 0);
  const packagingCost = Number(settingsMap.packaging_cost || 0);

  for (const product of products || []) {
    const category = getStainlessCategoryFromProduct(product);
    const settingKey = getStainlessSettingKey(category);
    if (!settingKey) continue;

    const updatedPrice = Number(settingsMap[settingKey] || 0);
    if (updatedPrice <= 0) continue;

    const finalPrice = Math.round(updatedPrice + (updatedPrice * stainlessProfitRate / 100) + packagingCost);

    await supabaseClient
      .from("products")
      .update({
        price: finalPrice,
        weight: null,
        category: category,
        updated_at: new Date().toISOString()
      })
      .eq("id", product.id);
  }
}

async function saveStainlessPriceSettings() {
  const stainlessPrices = [
    { key: "stainless_price_sets", value: setsCategoryInput.value },
    { key: "stainless_price_rings", value: ringsCategoryInput.value },
    { key: "stainless_price_necklaces", value: necklacesCategoryInput.value },
    { key: "stainless_price_bracelets", value: braceletsCategoryInput.value }
  ];

  for (const price of stainlessPrices) {
    if (!price.value.trim()) {
      continue;
    }

    const { error } = await upsertSiteSetting(price.key, price.value);
    if (error) {
      throw error;
    }
  }

  await recalculateStainlessProductPrices();
}

async function savePromoCodes() {
  const codes = promoCodesInput.value
    .split(/\r?\n|,/) 
    .map(code => code.trim().toUpperCase())
    .filter(Boolean);

  const uniqueCodes = Array.from(new Set(codes));
  const { error } = await upsertSiteSetting("promo_codes", JSON.stringify(uniqueCodes));

  if (error) {
    throw error;
  }
}

// Event listeners
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Login failed. Check your email or password.");
    return;
  }

  loginBox.style.display = "none";
  adminPanel.style.display = "block";
  loadCurrentPrices();
  loadCategories();
  loadPromoCodes();
  loadDiscountRules();
  loadProducts();
  loadUserOrders();
});

if (userSearchInput) {
  userSearchInput.addEventListener("input", () => {
    renderUserOrders();
  });
}

if (addOrderForm) {
  addOrderForm.addEventListener("submit", addOrderRecord);
}

if (addOrderItemBtn) {
  addOrderItemBtn.addEventListener("click", addSelectedProductToManualOrder);
}

if (orderProductSelect) {
  orderProductSelect.addEventListener("change", () => {
    if (!orderProductSelect.value) return;
    addSelectedProductToManualOrder();
  });
}

if (orderProductSearch) {
  orderProductSearch.addEventListener("input", () => {
    loadOrderProductPicker();
    const matchedProduct = findProductBySearchInput();
    if (matchedProduct && orderProductSelect) {
      orderProductSelect.value = String(matchedProduct.id);
    }
  });

  orderProductSearch.addEventListener("change", () => {
    const matchedProduct = findProductBySearchInput();
    if (!matchedProduct) return;
    if (orderProductSelect) {
      orderProductSelect.value = String(matchedProduct.id);
    }
    addSelectedProductToManualOrder();
  });
}

if (orderItemsInput) {
  orderItemsInput.addEventListener("input", syncManualItemsFromInput);
}

bindPhoneInputConstraint(orderCustomerPhoneInput);
bindPhoneInputConstraint(orderCustomerPhone2Input);
bindPhoneInputConstraint(loyaltyPhoneInput);

if (orderItemsPreview) {
  orderItemsPreview.addEventListener("click", (event) => {
    const removeItemBtn = event.target.closest(".js-remove-manual-item");
    if (!removeItemBtn) return;

    const index = Number(removeItemBtn.dataset.index);
    if (Number.isInteger(index) && index >= 0 && index < manualOrderItems.length) {
      manualOrderItems.splice(index, 1);
      serializeManualItemsToInput();
      renderManualOrderItemsPreview();
      refreshAmountsFromManualItems();
    }
  });
}

[orderSubtotalInput, orderDiscountInput, orderShippingInput].forEach((inputEl) => {
  if (inputEl) {
    inputEl.addEventListener("input", calculateOrderTotalLive);
  }
});

if (orderGovernmentInput) {
  orderGovernmentInput.addEventListener('input', calculateOrderTotalLive);
  orderGovernmentInput.addEventListener('change', calculateOrderTotalLive);
}

if (orderShippingInput) {
  orderShippingInput.readOnly = true;
  orderShippingInput.title = 'Calculated automatically from the selected government';
}

if (usersList) {
  usersList.addEventListener("click", async (event) => {
    const saveLoyaltyButton = event.target.closest('.js-save-loyalty');
    if (saveLoyaltyButton) {
      const phone = String(saveLoyaltyButton.getAttribute('data-user-phone') || '');
      const name = String(saveLoyaltyButton.getAttribute('data-user-name') || '');
      const input = Array.from(usersList.querySelectorAll('.js-loyalty-input')).find((field) => {
        return String(field.getAttribute('data-user-phone') || '') === phone;
      });
      const points = Number(input?.value || 0);

      saveLoyaltyButton.disabled = true;
      try {
        await updateCustomerLoyaltyPoints(phone, points, name);
        if (pricesStatusMsg) {
          pricesStatusMsg.textContent = 'Loyalty points updated successfully.';
          pricesStatusMsg.style.color = 'lightgreen';
        }
      } catch (error) {
        alert(error.message || 'Failed to update loyalty points.');
        console.error('Loyalty points update failed:', error);
      } finally {
        saveLoyaltyButton.disabled = false;
      }

      return;
    }

    const saveButton = event.target.closest(".js-save-status");
    if (saveButton) {
      const actionRow = saveButton.closest(".order-actions");
      const statusSelect = actionRow?.querySelector(".js-status-select");
      const orderId = actionRow?.dataset?.orderId;

      if (!orderId || !statusSelect) {
        return;
      }

      saveButton.disabled = true;
      try {
        await updateOrderStatus(orderId, statusSelect.value);
      } catch (error) {
        alert(error.message || "Failed to update order status.");
        console.error("Order status update failed:", error);
      } finally {
        saveButton.disabled = false;
      }

      return;
    }

    const deleteButton = event.target.closest(".js-delete-order");
    if (deleteButton) {
      const actionRow = deleteButton.closest(".order-actions");
      const orderId = actionRow?.dataset?.orderId;

      if (!orderId) {
        return;
      }

      const confirmDelete = confirm("Are you sure you want to delete this order?");
      if (!confirmDelete) {
        return;
      }

      deleteButton.disabled = true;
      try {
        await deleteOrderRecord(orderId);
      } catch (error) {
        alert(error.message || "Failed to delete order.");
        console.error("Order deletion failed:", error);
      } finally {
        deleteButton.disabled = false;
      }
    }
  });
}

if (saveLoyaltyManualBtn) {
  saveLoyaltyManualBtn.addEventListener('click', async () => {
    saveLoyaltyManualBtn.disabled = true;
    try {
      await saveLoyaltyPointsFromManualForm();
    } catch (error) {
      if (loyaltyManualStatus) {
        loyaltyManualStatus.textContent = error.message || 'Failed to save loyalty points.';
        loyaltyManualStatus.style.color = '#ff9a8d';
      }
      console.error('Manual loyalty save failed:', error);
    } finally {
      saveLoyaltyManualBtn.disabled = false;
    }
  });
}

savePricesBtn.addEventListener("click", async () => {
  const silverPrice = Number(silverPriceInput.value);
  const goldplatedPrice = Number(goldplatedPriceInput.value);
  const stainlessProfitPercentage = Number(stainlessProfitPercentageInput.value);
  const silverProfitPercentage = Number(silverProfitPercentageInput.value);
  const goldplatedProfitPercentage = Number(goldplatedProfitPercentageInput.value);
  const packagingCost = Number(packagingCostInput.value);

  if (!silverPrice || silverPrice <= 0 || !goldplatedPrice || goldplatedPrice <= 0) {
    pricesStatusMsg.textContent = "Please enter valid prices for both silver and goldplated.";
    pricesStatusMsg.style.color = "red";
    return;
  }

  if (stainlessProfitPercentage < 0 || silverProfitPercentage < 0 || goldplatedProfitPercentage < 0 || packagingCost < 0) {
    pricesStatusMsg.textContent = "Profit percentages and packaging cost cannot be negative.";
    pricesStatusMsg.style.color = "red";
    return;
  }

  const { error: silverError } = await upsertSiteSetting("silver_price_per_gram", silverPrice);
  if (silverError) {
    pricesStatusMsg.textContent = "Failed to save silver price.";
    pricesStatusMsg.style.color = "red";
    return;
  }

  const { error: goldError } = await upsertSiteSetting("goldplated_price_per_gram", goldplatedPrice);
  if (goldError) {
    pricesStatusMsg.textContent = "Failed to save goldplated price.";
    pricesStatusMsg.style.color = "red";
    return;
  }

  const { error: stainlessProfitError } = await upsertSiteSetting("stainless_profit_percentage", stainlessProfitPercentage);
  if (stainlessProfitError) {
    pricesStatusMsg.textContent = "Failed to save stainless profit percentage.";
    pricesStatusMsg.style.color = "red";
    return;
  }

  const { error: silverProfitError } = await upsertSiteSetting("silver_profit_percentage", silverProfitPercentage);
  if (silverProfitError) {
    pricesStatusMsg.textContent = "Failed to save silver profit percentage.";
    pricesStatusMsg.style.color = "red";
    return;
  }

  const { error: goldplatedProfitError } = await upsertSiteSetting("goldplated_profit_percentage", goldplatedProfitPercentage);
  if (goldplatedProfitError) {
    pricesStatusMsg.textContent = "Failed to save goldplated profit percentage.";
    pricesStatusMsg.style.color = "red";
    return;
  }

  const { error: packagingError } = await upsertSiteSetting("packaging_cost", packagingCost);
  if (packagingError) {
    pricesStatusMsg.textContent = "Failed to save packaging cost.";
    pricesStatusMsg.style.color = "red";
    return;
  }

  try {
    await saveStainlessPriceSettings();
  } catch (error) {
    pricesStatusMsg.textContent = "Common pricing saved, but stainless prices could not be updated.";
    pricesStatusMsg.style.color = "orange";
    console.error(error);
    return;
  }

  try {
    await savePromoCodes();
  } catch (error) {
    pricesStatusMsg.textContent = "Pricing saved, but promo codes could not be updated.";
    pricesStatusMsg.style.color = "orange";
    console.error(error);
    return;
  }

  try {
    await saveDiscountRules();
  } catch (error) {
    pricesStatusMsg.textContent = "Pricing saved, but discount rules could not be updated.";
    pricesStatusMsg.style.color = "orange";
    console.error(error);
    return;
  }

  pricesStatusMsg.textContent = "Settings updated successfully.";
  pricesStatusMsg.style.color = "lightgreen";
});

addProductBtn.addEventListener("click", () => showProductForm());
if (removeAllProductsBtn) {
  removeAllProductsBtn.addEventListener("click", deleteAllProducts);
}
cancelProductBtn.addEventListener("click", hideProductForm);
saveProductBtn.addEventListener("click", saveProduct);

document.querySelectorAll('.products-workspace-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.dataset.productsWorkspaceTab;
    setProductsWorkspaceTab(targetTab);

    if (targetTab !== 'single') {
      productForm.style.display = 'none';
    }
  });
});

productMaterial.addEventListener("change", updateProductFormState);
productCategory.addEventListener("change", syncStainlessBasePrice);

if (bulkProductMaterial) {
  bulkProductMaterial.addEventListener('change', updateBulkProductFormState);
}

if (bulkProductImages) {
  bulkProductImages.addEventListener('change', updateBulkLiveStatus);
}

if (bulkProductNames) {
  bulkProductNames.addEventListener('input', updateBulkLiveStatus);
}

if (bulkProductDesc) {
  bulkProductDesc.addEventListener('input', updateBulkLiveStatus);
}

if (bulkProductCategory) {
  bulkProductCategory.addEventListener('change', updateBulkLiveStatus);
}

if (removeProductCategoryBtn) {
  removeProductCategoryBtn.addEventListener('click', async () => {
    await deleteCategoryFromSite(productCategory.value);
  });
}

if (removeBulkCategoryBtn) {
  removeBulkCategoryBtn.addEventListener('click', async () => {
    await deleteCategoryFromSite(bulkProductCategory.value);
  });
}

if (restoreCategoryBtn) {
  restoreCategoryBtn.addEventListener('click', async () => {
    await restoreDeletedCategoryFromProducts(restoreCategorySelect?.value || '');
  });
}

if (bulkProductWeights) {
  bulkProductWeights.addEventListener('input', updateBulkLiveStatus);
}

if (bulkProductFormElement) {
  bulkProductFormElement.addEventListener('submit', saveBulkProducts);
}

if (discountScopeSelect) {
  discountScopeSelect.addEventListener('change', syncDiscountScopeInputs);
}

if (discountMaterialSelect) {
  discountMaterialSelect.addEventListener('change', updateDiscountCategoryOptions);
}

if (addDiscountRuleBtn) {
  addDiscountRuleBtn.addEventListener('click', async () => {
    await addDiscountRuleFromForm();
  });
}

if (clearDiscountRulesBtn) {
  clearDiscountRulesBtn.addEventListener('click', async () => {
    await clearDiscountRulesDraft();
  });
}

if (discountRulesList) {
  discountRulesList.addEventListener('click', async (event) => {
    const removeBtn = event.target.closest('[data-discount-rule-id]');
    if (!removeBtn) return;

    const ruleId = removeBtn.getAttribute('data-discount-rule-id');
    if (!ruleId) return;
    await removeDiscountRuleById(ruleId);
  });
}

[discountRuleSearchInput, discountRuleScopeFilter, discountRuleStatusFilter].forEach((control) => {
  if (!control) return;
  control.addEventListener('input', renderDiscountRules);
  control.addEventListener('change', renderDiscountRules);
});

// Make functions global
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

// Image preview functionality
productImgFile.addEventListener('change', function(e) {
  const file = e.target.files[0];
  const imagePreview = document.getElementById('imagePreview');

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px;">`;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.innerHTML = '';
  }
});

updateProductFormState();
updateBulkProductFormState();
updateBulkLiveStatus();
updateDiscountCategoryOptions();
syncDiscountScopeInputs();
renderDiscountRules();
setProductsWorkspaceTab('catalog');