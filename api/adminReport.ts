// File: /pages/api/adminreport.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getWeeklyMetrics, getSystemAlerts } from '@/lib/reporting'
import { sendEmailReport } from '@/lib/mailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const metrics = await getWeeklyMetrics()
    const alerts = await getSystemAlerts()

    const report = {
      generatedAt: new Date(),
      ...metrics,
      alerts,
    }

    // Optional: trigger email to super admin
    if (req.query.send === 'true') {
      await sendEmailReport(report)
    }

    return res.status(200).json({ report })

  } catch (error) {
    console.error('Admin report error:', error)
    return res.status(500).json({ message: 'Failed to generate report' })
  }
} 
