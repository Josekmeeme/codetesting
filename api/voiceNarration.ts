import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import db from '@/lib/db'
import { generateVoiceFromText } from '@/lib/voiceEngine' // Your AI voice SDK wrapper
import { nanoid } from 'nanoid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { storyId, gradeLevel } = req.body

  if (!storyId || !gradeLevel) {
    return res.status(400).json({ error: 'Missing storyId or gradeLevel' })
  }

  try {
    const story = await db.story.findUnique({ where: { id: storyId } })

    if (!story) {
      return res.status(404).json({ error: 'Story not found' })
    }

    // Check if narration already exists
    const existing = await db.voiceNarration.findFirst({ where: { storyId } })

    if (existing) {
      return res.status(200).json({ voiceUrl: existing.voiceUrl })
    }

    // Use MWALIMU-AI's tone guidelines
    const toneMap = {
      '1': 'joyful and slow',
      '2': 'friendly and curious',
      '3': 'clear and encouraging',
      '4': 'animated and calm',
      '5': 'motivating and fluent',
      '6': 'serious and educational',
      '7': 'engaging and intelligent',
    }

    const tone = toneMap[gradeLevel] || 'friendly'

    // Generate voice using text-to-speech
    const voiceUrl = await generateVoiceFromText(story.content, tone)

    // Save to DB
    await db.voiceNarration.create({
      data: {
        id: nanoid(),
        storyId,
        voiceUrl,
        narrator: `MWALIMU-AI (${tone})`,
        createdAt: new Date(),
      },
    })

    return res.status(200).json({ voiceUrl })
  } catch (error) {
    console.error('Voice narration error:', error)
    return res.status(500).json({ error: 'Failed to generate voice narration' })
  }
} 
