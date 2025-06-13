import { getSession } from 'next-auth/react'
import db from '@/lib/db'

export default async function handler(req, res) {
  const session = await getSession({ req })

  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized access' })
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const { method } = req

  if (method === 'GET') {
    return getSubscriptions(req, res, user.id)
  }

  if (method === 'POST') {
    return createSubscription(req, res, user.id)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: `Method ${method} not allowed` })
}

// 🔍 Fetch active subscriptions
async function getSubscriptions(req, res, userId) {
  try {
    const subscriptions = await db.subscription.findMany({
      where: { userId, status: 'active' },
    })

    return res.status(200).json({ subscriptions })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to retrieve subscriptions' })
  }
}

// 🧾 Create or upgrade a subscription
async function createSubscription(req, res, userId) {
  const { grade, type } = req.body // e.g., grade: "3", type: "monthly" | "lifetime" | "per_story"

  if (!grade || !type) {
    return res.status(400).json({ error: 'Missing grade or type' })
  }

  try {
    const existing = await db.subscription.findFirst({
      where: { userId, grade, type, status: 'active' },
    })

    if (existing) {
      return res.status(200).json({ message: 'Subscription already active', subscription: existing })
    }

    const subscription = await db.subscription.create({
      data: {
        userId,
        grade,
        type,
        status: 'active',
        startedAt: new Date(),
        expiresAt: type === 'monthly' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    })

    // Notify MWALIMU-AI of new subscription
    await db.mwalimuTask.create({
      data: {
        userId,
        task: 'ActivateSubscription',
        metadata: {
          grade,
          type,
        },
      },
    })

    return res.status(201).json({ message: 'Subscription created', subscription })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return res.status(500).json({ error: 'Failed to create subscription' })
  }
} 
