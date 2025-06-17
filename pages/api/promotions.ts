import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import { verifyAdmin } from '@/utils/authUtils';
import { autoSchedulePromotions, rotateExpiredPromos } from '@/utils/promotionUtils';
import { mwalimuAIAssistPromotion } from '@/utils/mwalimuAI';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    // Fetch all active promotions
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (method === 'POST') {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) return res.status(403).json({ error: 'Not authorized' });

    const {
      title,
      image,
      targetGroup,
      startDate,
      endDate,
      priority,
      description,
      link,
    } = req.body;

    const { error } = await supabase.from('promotions').insert([
      {
        title,
        image,
        target_group: targetGroup,
        start_date: startDate,
        end_date: endDate,
        priority,
        description,
        link,
        status: 'active',
      },
    ]);

    if (error) return res.status(500).json({ error: error.message });

    // Let MWALIMU AI optimize further placements
    await mwalimuAIAssistPromotion({ title, targetGroup });

    return res.status(201).json({ message: 'Promotion added successfully' });
  }

  if (method === 'PATCH') {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) return res.status(403).json({ error: 'Not authorized' });

    const { id, updates } = req.body;

    const { error } = await supabase
      .from('promotions')
      .update(updates)
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Promotion updated successfully' });
  }

  if (method === 'DELETE') {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) return res.status(403).json({ error: 'Not authorized' });

    const { id } = req.body;

    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Promotion deleted successfully' });
  }

  return res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']).status(405).end(`Method ${method} Not Allowed`);
} 
