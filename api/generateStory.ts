import { db } from '@/lib/db' // e.g., Prisma instance
import { Story } from '@prisma/client'

interface StoryInput {
  title: string
  grade: number
  language: 'EN' | 'SW'
  summary: string
  content: string
  week: number
  topic: string
  vocabulary: string[]
  comprehensionQuestions: string[]
  parentalGuide: string
  aiGenerated?: boolean
}

export async function createStory(data: StoryInput): Promise<Story> {
  return await db.story.create({ data })
}

export async function getAllStories(): Promise<Story[]> {
  return await db.story.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function getStoriesByGrade(grade: number): Promise<Story[]> {
  return await db.story.findMany({
    where: { grade },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getStoryById(id: string): Promise<Story | null> {
  return await db.story.findUnique({ where: { id } })
}

export async function getStoriesByLanguage(lang: 'EN' | 'SW'): Promise<Story[]> {
  return await db.story.findMany({
    where: { language: lang },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getWeeklyStories(week: number, grade?: number): Promise<Story[]> {
  return await db.story.findMany({
    where: { week, ...(grade ? { grade } : {}) },
    orderBy: { createdAt: 'desc' }
  })
}

export async function searchStoriesByTopic(topic: string): Promise<Story[]> {
  return await db.story.findMany({
    where: {
      topic: {
        contains: topic,
        mode: 'insensitive'
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getLatestAISummaries(limit: number = 10): Promise<Story[]> {
  return await db.story.findMany({
    where: { aiGenerated: true },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
} 
