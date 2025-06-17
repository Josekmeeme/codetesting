import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  MPESA_CALLBACK_URL,
  MPESA_BASE_URL
} = process.env;

const getTimestamp = () => {
  const date = new Date();
  return date
    .toISOString()
    .replace(/[-T:Z.]/g, '')
    .substring(0, 14);
};

export const getMpesaAccessToken = async () => {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  try {
    const res = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    return res.data.access_token;
  } catch (err) {
    console.error('MPESA Token Error:', err);
    return null;
  }
};

export const initiateStkPush = async (
  phone: string,
  amount: number,
  userId: string,
  plan: string,
  referrer?: string
) => {
  const token = await getMpesaAccessToken();
  if (!token) return { success: false, message: 'Token fetch failed' };

  const timestamp = getTimestamp();
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

  try {
    const res = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: MPESA_CALLBACK_URL,
        AccountReference: 'SmartKidStories',
        TransactionDesc: `${plan} Plan Payment`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      CheckoutRequestID: res.data.CheckoutRequestID,
      message: 'STK Push sent to phone',
    };
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    return { success: false, message: 'STK Push failed' };
  }
};

// Handle callback on server: /api/mpesa/callback
export const recordMpesaPayment = async (
  userId: string,
  amount: number,
  plan: string,
  referrer?: string
) => {
  const { error } = await supabase.from('subscriptions').insert([
    {
      user_id: userId,
      amount,
      plan,
      payment_method: 'mpesa',
      status: 'active',
    },
  ]);

  if (error) {
    console.error('MPESA Record Error:', error.message);
    return { success: false };
  }

  if (referrer) {
    await supabase.from('referrals').insert([
      {
        referrer_id: referrer,
        referred_user_id: userId,
        amount: amount * 0.4,
        paid: false,
      },
    ]);
  }

  return { success: true };
}; 
