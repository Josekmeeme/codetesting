import db from '@/lib/db'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
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
      return getStories(req, res, user)
    case 'POST':
      return createStory(req, res, user)
    default:
      return res.status(405).json({ error: 'Method not allowed.' })
  }
}

async function getStories(req, res, user) {
  const { grade, lang = 'en', preview = false } = req.query

  try {
    const subscription = await db.subscription.findFirst({
      where: {
        userId: user.id,
        grade: grade || undefined,
        status: 'active',
      },
    })

    if (!subscription && !preview) {
      return res.status(403).json({ error: 'Subscription required to access stories.' })
    }

    const stories = await db.story.findMany({
      where: {
        grade: grade || undefined,
        language: lang,
        published: true,
      },
      orderBy: { createdAt: 'desc' },
      take: preview ? 3 : undefined,
    })

    return res.status(200).json({ stories })
  } catch (error) {
    console.error('Error loading stories:', error)
    return res.status(500).json({ error: 'Failed to fetch stories.' })
  }
}

async function createStory(req, res, user) {
  const { title, grade, language, teaser, content, tags, audioUrl, topics } = req.body

  if (!user.isAdmin) {
    return res.status(403).json({ error: 'Only admins can create stories.' })
  }

  try {
    const newStory = await db.story.create({
      data: {
        title,
        grade,
        language,
        teaser,
        content,
        tags,
        topics,
        audioUrl,
        authorId: user.id,
        published: true,
        createdAt: new Date(),
      },
    })

    return res.status(201).json({ message: 'Story created', story: newStory })
  } catch (error) {
    console.error('Error creating story:', error)
    return res.status(500).json({ error: 'Failed to create story.' })
  }
} 
