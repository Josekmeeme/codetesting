import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';

// Replace these with your actual environment values from .env.production
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_API = process.env.PAYPAL_API || 'https://api-m.paypal.com'; // use 'https://api-m.sandbox.paypal.com' for sandbox

// Get PayPal OAuth token
export const getPayPalAccessToken = async (): Promise<string | null> => {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  try {
    const res = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 'grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return res.data.access_token;
  } catch (err) {
    console.error('PayPal Token Error:', err);
    return null;
  }
};

// Verify completed payment
export const verifyPayPalPayment = async (orderId: string): Promise<boolean> => {
  const token = await getPayPalAccessToken();
  if (!token) return false;

  try {
    const res = await axios.get(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.status === 'COMPLETED';
  } catch (err) {
    console.error('PayPal Payment Verification Error:', err);
    return false;
  }
};

// Record subscription after payment
export const recordSubscription = async (
  userId: string,
  amount: number,
  plan: string,
  referrer?: string
) => {
  const { data, error } = await supabase.from('subscriptions').insert([
    {
      user_id: userId,
      amount,
      plan,
      payment_method: 'paypal',
      status: 'active',
    },
  ]);

  if (error) {
    console.error('Error saving subscription:', error.message);
    return { success: false };
  }

  // Process referral earnings if any
  if (referrer) {
    await supabase.from('referrals').insert([
      {
        referrer_id: referrer,
        referred_user_id: userId,
        amount: amount * 0.4, // 40% referral reward
        paid: false,
      },
    ]);
  }

  return { success: true };
}; 
