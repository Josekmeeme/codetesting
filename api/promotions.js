import db from '@/lib/db' // Adjust path if your DB utility differs
import { verifyAdmin } from '@/lib/auth' // Optional: Admin auth middleware

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const promotions = await db.promotion.findMany({
        orderBy: { createdAt: 'desc' },
      })
      res.status(200).json(promotions)
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch promotions' })
    }
  }

  else if (req.method === 'POST') {
    const { title, type, content, startDate, endDate, targetTier, autoReplaceOnExpire } = req.body

    if (!title || !type || !content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
      const promo = await db.promotion.create({
        data: {
          title,
          type, // 'referral' | 'ngo' | 'subscriber_boost' etc.
          content,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          targetTier,
          autoReplaceOnExpire: autoReplaceOnExpire || false,
        },
      })

      res.status(201).json(promo)
    } catch (err) {
      console.error('Promo POST error:', err)
      res.status(500).json({ error: 'Error creating promotion' })
    }
  }

  else if (req.method === 'DELETE') {
    const { id } = req.body
    try {
      await db.promotion.delete({ where: { id } })
      res.status(200).json({ success: true })
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete promotion' })
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
} 
