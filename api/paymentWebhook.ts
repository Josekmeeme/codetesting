// File: /pages/api/payments.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { validateReferral, creditReferral } from '@/lib/referrals'
import { updateUserAccess } from '@/lib/users'
import { recordTransaction } from '@/lib/transactions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const {
      userId,
      amount,
      accessType, // 'story', 'grade', 'library', 'gold'
      gradeLevel, // optional
      paymentMethod, // 'paypal' | 'mpesa' | 'stripe'
      referralCode // optional
    } = req.body

    // Validate basic inputs
    if (!userId || !amount || !accessType || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required payment data' })
    }

    // Optional: Validate referral code and prepare reward logic
    let referralReward = null
    if (referralCode) {
      const isValid = await validateReferral(referralCode, userId)
      if (isValid) {
        referralReward = await creditReferral(referralCode, amount)
      }
    }

    // Grant access to user based on type
    const updatedUser = await updateUserAccess({
      userId,
      accessType,
      gradeLevel,
    })

    // Record the transaction
    await recordTransaction({
      userId,
      amount,
      method: paymentMethod,
      purpose: `Access: ${accessType}${gradeLevel ? ` (Grade ${gradeLevel})` : ''}`,
      referralCode,
      reward: referralReward?.amount || 0,
    })

    return res.status(200).json({
      message: 'Payment processed and access granted',
      user: updatedUser,
      referral: referralReward || null,
    })

  } catch (error) {
    console.error('Payment Error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 
