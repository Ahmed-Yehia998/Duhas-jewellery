const livePrices = {
  silver: null,
  goldplated: null,
  silverProfitPercentage: null,
  goldplatedProfitPercentage: null,
  packagingCost: null
};

let priceSubscriptionActive = false;

function formatEgp(value) {
  if (value == null || Number.isNaN(value)) return 'EGP0';
  return `EGP ${Number(value).toLocaleString('en-US')}`;
}

function getRateForMaterial(material) {
  if (!material) return null;
  if (material === 'silver') return livePrices.silver;
  if (material === 'goldplated') return livePrices.goldplated;
  return null;
}

function computeLivePriceForElement(el) {
  // For new pricing system, prices are calculated in admin and stored
  // This function is kept for backward compatibility
  const material = el.dataset.livePrice;
  const rate = getRateForMaterial(material);
  if (rate == null || rate === 0) return null;

  const weight = Number(el.dataset.weight || 1);
  const materialCost = weight * rate;
  const profitRate = material === 'silver' ? livePrices.silverProfitPercentage : livePrices.goldplatedProfitPercentage;
  const profitAmount = (Number(profitRate || 0) / 100) * materialCost;
  return Math.round(materialCost + profitAmount + (livePrices.packagingCost || 0));
}

function applyLivePrices() {
  document.querySelectorAll('[data-live-price]').forEach(el => {
    const price = computeLivePriceForElement(el);
    if (price != null) {
      el.textContent = formatEgp(price);
    }
  });
}

async function loadLivePrices() {
  if (typeof supabaseClient === 'undefined') {
    console.error('Supabase client is not available.');
    return;
  }

  const keys = [
    'silver_price_per_gram',
    'goldplated_price_per_gram',
    'silver_profit_percentage',
    'goldplated_profit_percentage',
    'packaging_cost'
  ];
  const { data, error } = await supabaseClient
    .from('site_settings')
    .select('key,value')
    .in('key', keys);

  if (error) {
    console.error('Failed to load live prices:', error);
    return;
  }

  if (Array.isArray(data)) {
    data.forEach(item => {
      if (item.key === 'silver_price_per_gram') {
        livePrices.silver = Number(item.value);
      }
      if (item.key === 'goldplated_price_per_gram') {
        livePrices.goldplated = Number(item.value);
      }
      if (item.key === 'silver_profit_percentage') {
        livePrices.silverProfitPercentage = Number(item.value);
      }
      if (item.key === 'goldplated_profit_percentage') {
        livePrices.goldplatedProfitPercentage = Number(item.value);
      }
      if (item.key === 'packaging_cost') {
        livePrices.packagingCost = Number(item.value);
      }
    });
  }

  applyLivePrices();
  
  // Only subscribe on first load
  if (!priceSubscriptionActive) {
    subscribeToPriceUpdates();
  }
}

function subscribeToPriceUpdates() {
  if (typeof supabaseClient === 'undefined') return;
  
  // Only subscribe once to prevent "cannot add postgres_changes after subscribe()" error
  if (priceSubscriptionActive) return;
  
  priceSubscriptionActive = true;

  supabaseClient
    .channel('site_settings')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'site_settings',
      filter: 'key=in.(silver_price_per_gram,goldplated_price_per_gram,silver_profit_percentage,goldplated_profit_percentage,packaging_cost)'
    }, (payload) => {
      console.log('Price update:', payload);
      loadLivePrices();
    })
    .subscribe();
}

function getLivePrice(product = {}) {
  // Since prices are now calculated and stored in the database,
  // return the stored price if available
  if (product.price) {
    return product.price;
  }

  // Fallback to calculation for legacy support
  const material = product.material;
  const rate = getRateForMaterial(material);
  if (rate == null) return 0;

  const weight = Number(product.weight || 1);
  const materialCost = weight * rate;
  const profitRate = material === 'silver' ? livePrices.silverProfitPercentage : livePrices.goldplatedProfitPercentage;
  const profitAmount = (Number(profitRate || 0) / 100) * materialCost;
  return Math.round(materialCost + profitAmount + (livePrices.packagingCost || 0));
}

window.getLivePrice = getLivePrice;
window.applyLivePrices = applyLivePrices;
window.refreshLivePrices = loadLivePrices;

document.addEventListener('DOMContentLoaded', loadLivePrices);
