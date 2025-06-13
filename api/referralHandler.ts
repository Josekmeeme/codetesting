import { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

// Simulate fraud watch/alerting logic
async function checkFraudRisk(referrerId: string) {
  const referrals = await db.referral.findMany({
    where: { referrerId },
  })

  if (referrals.length > 30) {
    // Example alert
    await db.alert.create({
      data: {
        type: 'REFERRAL_SPIKE',
        message: `High referral volume from user ${referrerId}`,
      },
    })
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { referrerId, referredEmail } = req.body

    if (!referrerId || !referredEmail) {
      return res.status(400).json({ error: 'Missing referrer or referred email' })
    }

    try {
      const existing = await db.user.findUnique({ where: { email: referredEmail } })

      if (existing) {
        return res.status(409).json({ error: 'Email already registered' })
      }

      const referral = await db.referral.create({
        data: {
          id: uuidv4(),
          referrerId,
          referredEmail,
          rewardClaimed: false,
        },
      })

      // Trigger fraud protection logic
      await checkFraudRisk(referrerId)

      return res.status(201).json({ message: 'Referral recorded', referral })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Referral processing failed' })
    }
  }

  if (req.method === 'GET') {
    const { referrerId } = req.query

    try {
      const referrals = await db.referral.findMany({
        where: { referrerId: referrerId as string },
        orderBy: { createdAt: 'desc' },
      })

      const totalEarned = await db.referral.aggregate({
        where: { referrerId: referrerId as string, rewardClaimed: true },
        _count: { _all: true },
      })

      return res.status(200).json({
        referrals,
        totalClaimed: totalEarned._count._all,
      })
    } catch (err) {
      return res.status(500).json({ error: 'Could not fetch referrals' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
} 
	
