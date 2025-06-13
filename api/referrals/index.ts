// File: /pages/index.tsx

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { getBriefs, getTeasers } from '@/lib/api'
import { Brief, Story } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [stories, setStories] = useState<Story[]>([])

  useEffect(() => {
    async function loadContent() {
      const [loadedBriefs, loadedStories] = await Promise.all([
        getBriefs(),
        getTeasers()
      ])
      setBriefs(loadedBriefs)
      setStories(loadedStories)
    }

    loadContent()
  }, [])

  return (
    <>
      <Head>
        <title>SmartKidStories | MWALIMU-AI Learning Hub</title>
        <meta name="description" content="Interactive AI-powered stories and lessons for kids in Grades 1–7" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to SmartKidStories</h1>
          <p className="text-lg text-gray-600">Empowering kids through fun, ethical, AI-curated stories. Now with voiceovers, referrals, and Global Kid’s Corner 🇫🇷 🇨🇳.</p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/stories"><Button>Explore Stories</Button></Link>
            <Link href="/subscribe"><Button variant="secondary">Subscribe Now</Button></Link>
          </div>
        </section>

        {/* Story Teasers */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">📚 This Week’s Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card key={story.id}>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-1">{story.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">{story.teaser}</p>
                  <Link href={`/stories/${story.id}`}><Button size="sm">Read More</Button></Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Civic Briefs */}
        <section className="mb-12 bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">🌍 Virtuous Briefs by MWALIMU-AI</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            {briefs.map((brief, i) => (
              <li key={i}>{brief.message}</li>
            ))}
          </ul>
        </section>

        {/* Promotions */}
        <section className="text-center mb-12">
          <h2 className="text-xl font-bold mb-2 text-yellow-600">🌟 Become a Promoter</h2>
          <p className="text-sm text-gray-600 mb-3">Earn 40% via referrals. Help kids learn, while you earn.</p>
          <Link href="/promote"><Button variant="outline">Start Promoting</Button></Link>
        </section>

        {/* Gold Tier CTA */}
        <section className="bg-yellow-50 py-6 px-4 rounded-lg text-center">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">🌐 Global Kid’s Corner</h2>
          <p className="text-sm text-gray-700 mb-3">Unlock French 🇫🇷 & Chinese 🇨🇳 lessons for only Ksh 1000 (lifetime access).</p>
          <Link href="/global"><Button>Upgrade to Gold</Button></Link>
        </section>
      </main>
    </>
  )
} 


// File: /pages/index.tsx

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { getBriefs, getTeasers } from '@/lib/api'
import { Brief, Story } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [stories, setStories] = useState<Story[]>([])

  useEffect(() => {
    async function loadContent() {
      const [loadedBriefs, loadedStories] = await Promise.all([
        getBriefs(),
        getTeasers()
      ])
      setBriefs(loadedBriefs)
      setStories(loadedStories)
    }

    loadContent()
  }, [])

  return (
    <>
      <Head>
        <title>SmartKidStories | MWALIMU-AI Learning Hub</title>
        <meta name="description" content="Interactive AI-powered stories and lessons for kids in Grades 1–7" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to SmartKidStories</h1>
          <p className="text-lg text-gray-600">Empowering kids through fun, ethical, AI-curated stories. Now with voiceovers, referrals, and Global Kid’s Corner 🇫🇷 🇨🇳.</p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/stories"><Button>Explore Stories</Button></Link>
            <Link href="/subscribe"><Button variant="secondary">Subscribe Now</Button></Link>
          </div>
        </section>

        {/* Story Teasers */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">📚 This Week’s Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card key={story.id}>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-1">{story.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">{story.teaser}</p>
                  <Link href={`/stories/${story.id}`}><Button size="sm">Read More</Button></Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Civic Briefs */}
        <section className="mb-12 bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">🌍 Virtuous Briefs by MWALIMU-AI</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            {briefs.map((brief, i) => (
              <li key={i}>{brief.message}</li>
            ))}
          </ul>
        </section>

        {/* Promotions */}
        <section className="text-center mb-12">
          <h2 className="text-xl font-bold mb-2 text-yellow-600">🌟 Become a Promoter</h2>
          <p className="text-sm text-gray-600 mb-3">Earn 40% via referrals. Help kids learn, while you earn.</p>
          <Link href="/promote"><Button variant="outline">Start Promoting</Button></Link>
        </section>

        {/* Gold Tier CTA */}
        <section className="bg-yellow-50 py-6 px-4 rounded-lg text-center">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">🌐 Global Kid’s Corner</h2>
          <p className="text-sm text-gray-700 mb-3">Unlock French 🇫🇷 & Chinese 🇨🇳 lessons for only Ksh 1000 (lifetime access).</p>
          <Link href="/global"><Button>Upgrade to Gold</Button></Link>
        </section>
      </main>
    </>
  )
}
