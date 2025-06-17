import { supabase } from "@/lib/supabaseClient";
import { validateReferral } from "./referrals";
import { sendConfirmationEmail } from "./mailer";

export async function createSubscription({ userId, planId, amount, referrer }) {
  try {
    // Check if plan exists (optional security)
    const validPlans = {
      story: 10,
      grade: 70,
      lifetime: 350,
      gold: 1000,
    };

    if (!validPlans[planId] || validPlans[planId] !== amount) {
      throw new Error("Invalid plan or pricing mismatch");
    }

    // Create new subscription entry
    const { data, error } = await supabase
      .from("subscriptions")
      .insert([
        {
          user_id: userId,
          plan_id: planId,
          amount: amount,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Handle referral logic
    if (referrer) {
      await validateReferral({ referredUserId: userId, referrerCode: referrer, planId, amount });
    }

    // Send confirmation email to user (optional)
    await sendConfirmationEmail(userId, planId);

    return { success: true, subscription: data };
  } catch (error) {
    console.error("Subscription creation failed:", error.message);
    return { success: false, error: error.message };
  }
}

export async function updateSubscriptionStatus(subscriptionId, status) {
  const { error } = await supabase
    .from("subscriptions")
    .update({ status })
    .eq("id", subscriptionId);

  return error ? { success: false, error } : { success: true };
} 
