import db from '@/lib/db' // Assumes Prisma or similar DB ORM
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { referrerId, referredUserId, planType } = req.body

    if (!referrerId || !referredUserId || !planType) {
      return res.status(400).json({ error: 'Missing referral data.' })
    }

    try {
      const referredUser = await db.user.findUnique({
        where: { id: referredUserId },
      })

      if (!referredUser || !referredUser.subscriptionActive) {
        return res.status(403).json({ error: 'Referral invalid. User has not subscribed.' })
      }

      // Prevent duplicate referral
      const existingReferral = await db.referral.findFirst({
        where: {
          referrerId,
          referredUserId,
        },
      })

      if (existingReferral) {
        return res.status(409).json({ message: 'Referral already recorded.' })
      }

      const rewardAmount = getRewardAmount(planType)

      const referral = await db.referral.create({
        data: {
          id: uuidv4(),
          referrerId,
          referredUserId,
          planType,
          rewardAmount,
          rewardClaimed: false,
          createdAt: new Date(),
        },
      })

      return res.status(201).json({ message: 'Referral recorded', referral })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Failed to create referral.' })
    }
  }

  if (req.method === 'GET') {
    const { referrerId } = req.query

    try {
      const referrals = await db.referral.findMany({
        where: { referrerId },
        orderBy: { createdAt: 'desc' },
      })

      const earnedTotal = referrals.reduce((sum, r) => sum + (r.rewardClaimed ? r.rewardAmount : 0), 0)

      return res.status(200).json({
        referrals,
        totalEarned: earnedTotal,
        totalReferrals: referrals.length,
      })
    } catch (err) {
      return res.status(500).json({ error: 'Could not fetch referral history.' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

function getRewardAmount(planType) {
  switch (planType) {
    case 'story':
      return 4 // KES 10 per story × 40% = 4
    case 'grade':
      return 28 // KES 70 × 40% = 28
    case 'lifetime':
      return 140 // KES 350 × 40% = 140
    default:
      return 0
  }
} 
