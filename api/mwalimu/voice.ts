// File: /pages/api/admin/voice.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import db from '@/lib/db'
import { generateVoiceFromText } from '@/lib/voice'

export default async function voiceAPI(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized access' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { storyId } = req.body

  if (!storyId) {
    return res.status(400).json({ error: 'Missing story ID' })
  }

  try {
    const story = await db.story.findUnique({ where: { id: storyId } })
    if (!story) return res.status(404).json({ error: 'Story not found' })

    const voiceUrl = await generateVoiceFromText({
      text: story.body,
      grade: story.grade,
      language: story.language,
    })

    await db.story.update({
      where: { id: storyId },
      data: { audioUrl: voiceUrl },
    })

    return res.status(200).json({ success: true, audioUrl: voiceUrl })
  } catch (error) {
    console.error('Voice generation failed:', error)
    return res.status(500).json({ error: 'Voice generation failed' })
  }
} 
