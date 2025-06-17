// pages/api/track.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, storyId, userId, referralCode, promoId } = req.body;
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
  const timestamp = new Date().toISOString();

  try {
    if (type === 'story_view' && storyId && userId) {
      await supabase.from('story_views').insert([
        { story_id: storyId, user_id: userId, viewed_at: timestamp }
      ]);
    }

    if (type === 'referral_click' && referralCode) {
      await supabase.from('referral_clicks').insert([
        { referral_code: referralCode, ip, clicked_at: timestamp }
      ]);

      // Optional: Reward if this is a unique referral
      const { data: existing } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('referral_code', referralCode)
        .eq('ip', ip)
        .single();

      if (!existing) {
        await supabase.from('referral_rewards').insert([
          { referral_code: referralCode, ip, rewarded_at: timestamp, reward_amount: 5 }
        ]);
        // Optionally update user earnings
        await supabase.rpc('increment_referral_earnings', { code_input: referralCode });
      }
    }

    if (type === 'promotion_interaction' && promoId && userId) {
      await supabase.from('promotion_stats').insert([
        { promotion_id: promoId, user_id: userId, interacted_at: timestamp }
      ]);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[TRACK ERROR]', error);
    return res.status(500).json({ error: 'Tracking failed' });
  }
} 
