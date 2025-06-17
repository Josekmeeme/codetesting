import { supabase } from "../utils/supabaseClient";

// Create a new promotion
export async function createPromotion(data) {
  const { title, image_url, target_url, duration_days, created_by } = data;

  const expires_at = new Date();
  expires_at.setDate(expires_at.getDate() + duration_days);

  const { data: promo, error } = await supabase
    .from("promotions")
    .insert([
      {
        title,
        image_url,
        target_url,
        created_by,
        duration_days,
        expires_at,
        status: "active",
      },
    ])
    .select();

  if (error) throw error;
  return promo;
}

// Fetch all active promotions
export async function getActivePromotions() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("status", "active")
    .gt("expires_at", now);

  if (error) throw error;
  return data;
}

// Auto-expire old promotions
export async function expireOldPromotions() {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("promotions")
    .update({ status: "expired" })
    .lt("expires_at", now)
    .eq("status", "active");

  if (error) throw error;
}

// Auto-replace expired promotions with defaults
export async function replaceExpiredWithDefaults(defaultPromos = []) {
  await expireOldPromotions();

  const { data: expired } = await supabase
    .from("promotions")
    .select("*")
    .eq("status", "expired");

  if (expired && expired.length > 0) {
    for (const fallback of defaultPromos) {
      await createPromotion(fallback);
    }
  }
}

// Admin fetch
export async function getAllPromotions() {
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Delete promotion
export async function deletePromotion(id) {
  const { error } = await supabase
    .from("promotions")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return { success: true };
} 
