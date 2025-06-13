import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import db from '@/lib/db'

export default async function subscriptionHandler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' })
  }

  const userEmail = session.user.email
  const user = await db.user.findUnique({ where: { email: userEmail } })
  if (!user) {
    return res.status(404).json({ error: 'User not found.' })
  }

  switch (req.method) {
    case 'GET':
      return getUserSubscriptions(res, user.id)
    case 'POST':
      return createOrUpgradeSubscription(req, res, user.id)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

// 🟢 Get all active subscriptions for the user
async function getUserSubscriptions(res: NextApiResponse, userId: string) {
  try {
    const subscriptions = await db.subscription.findMany({
      where: { userId, status: 'active' },
    })

    return res.status(200).json({ subscriptions })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch subscriptions.' })
  }
}

// 🟢 Create or upgrade a user's subscription
async function createOrUpgradeSubscription(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { grade, type } = req.body // e.g., { grade: "4", type: "monthly" | "lifetime" }

  if (!grade || !type) {
    return res.status(400).json({ error: 'Grade and type are required.' })
  }

  const existing = await db.subscription.findFirst({
    where: { userId, grade, type, status: 'active' },
  })

  if (existing) {
    return res.status(200).json({ message: 'Subscription already active.', subscription: existing })
  }

  try {
    const newSubscription = await db.subscription.create({
      data: {
        userId,
        grade,
        type, // monthly | lifetime | per_story
        status: 'active',
        startedAt: new Date(),
        expiresAt: type === 'monthly' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    })

    // Optional: Flag MWALIMU-AI to activate content pipeline
    await db.mwalimuTask.create({
      data: {
        userId,
        task: 'ActivateSubscription',
        metadata: { grade, type },
      },
    })

    return res.status(201).json({ message: 'Subscription activated.', subscription: newSubscription })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create subscription.' })
  }
} 
