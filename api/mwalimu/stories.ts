// File: /pages/api/admin/stories.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import db from '@/lib/db'

export default async function storiesAPI(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized access' })
  }

  switch (req.method) {
    case 'POST': {
      const {
        title,
        grade,
        language,
        teaser,
        body,
        vocabulary,
        questions,
        parentalGuide,
        audioUrl,
      } = req.body

      if (!title || !grade || !language || !teaser || !body) {
        return res.status(400).json({ error: 'Missing required story fields' })
      }

      try {
        const story = await db.story.create({
          data: {
            title,
            grade,
            language,
            teaser,
            body,
            vocabulary,
            questions,
            parentalGuide,
            audioUrl,
            createdBy: session.user.email!,
          },
        })

        return res.status(201).json({ success: true, story })
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create story' })
      }
    }

    case 'GET': {
      const { grade, language, limit } = req.query

      try {
        const stories = await db.story.findMany({
          where: {
            ...(grade ? { grade: Number(grade) } : {}),
            ...(language ? { language: String(language) } : {}),
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit ? Number(limit) : undefined,
        })

        return res.status(200).json({ success: true, stories })
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch stories' })
      }
    }

    case 'DELETE': {
      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid story ID' })
      }

      try {
        await db.story.delete({ where: { id } })
        return res.status(200).json({ success: true, message: 'Story deleted' })
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete story' })
      }
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
} 
