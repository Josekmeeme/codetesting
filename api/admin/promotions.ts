// File: /pages/api/admin/promotions.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import db from '@/lib/db'

export default async function promotionsAPI(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized access' })
  }

  switch (req.method) {
    case 'POST': {
      const { title, message, tier, expiresAt } = req.body

      if (!title || !message || !tier || !expiresAt) {
        return res.status(400).json({ error: 'Missing fields' })
      }

      try {
        const promo = await db.promotion.create({
          data: {
            title,
            message,
            tier, // e.g., 'Gold', 'All', 'Grade1'
            expiresAt: new Date(expiresAt),
            createdBy: session.user.email!,
          },
        })

        return res.status(201).json({ success: true, promo })
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create promotion' })
      }
    }

    case 'GET': {
      try {
        const now = new Date()

        const promos = await db.promotion.findMany({
          where: {
            expiresAt: {
              gt: now,
            },
          },
          orderBy: {
            expiresAt: 'asc',
          },
        })

        return res.status(200).json({ success: true, promotions: promos })
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch promotions' })
      }
    }

    case 'DELETE': {
      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid promotion ID' })
      }

      try {
        await db.promotion.delete({
          where: { id },
        })

        return res.status(200).json({ success: true, message: 'Promotion deleted' })
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete promotion' })
      }
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}
