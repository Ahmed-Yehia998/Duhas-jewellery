async function getSilverPricePerGram() {
  const { data, error } = await supabaseClient
    .from("site_settings")
    .select("value")
    .eq("key", "silver_price_per_gram")
    .single();

  if (error) {
    console.error("Error fetching silver price:", error);
    return null;
  }

  return Number(data.value);
}

function calculateFinalSilverPrice(weight, makingCost = 0, profit = 0, silverPricePerGram = 0) {
  return Math.round((weight * silverPricePerGram) + makingCost + profit);
}