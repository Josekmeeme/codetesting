import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StoryCard } from "@/components/StoryCard";
import { getFeaturedStories, getTestimonials } from "@/lib/data";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [stories, setStories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const featured = await getFeaturedStories();
      const feedback = await getTestimonials();
      setStories(featured);
      setTestimonials(feedback);
    };
    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>SmartKidStories – Learn, Laugh, Grow</title>
        <meta
          name="description"
          content="Weekly curated AI stories for kids, powered by MWALIMU AI. Unlock creativity, values, and learning!"
        />
      </Head>

      <main className="bg-[#f9f9f9] min-h-screen">
        <section className="text-center px-6 py-12 bg-gradient-to-r from-yellow-200 via-pink-100 to-blue-200">
          <h1 className="text-4xl font-bold mb-3 text-gray-800">
            Welcome to SmartKidStories!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI-powered weekly stories to entertain, educate, and inspire. Curated by <strong>MWALIMU AI</strong>.
          </p>
          <div className="mt-6">
            <Link href="/subscribe">
              <Button className="text-white bg-blue-600 hover:bg-blue-700">Subscribe Now</Button>
            </Link>
            <Link href="/referrals">
              <Button className="ml-4 bg-green-600 hover:bg-green-700 text-white">Earn by Referring</Button>
            </Link>
          </div>
        </section>

        <section className="px-6 py-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">🌟 Featured Stories</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>

        <section className="bg-white py-10 px-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">📖 Parental Guide</h2>
          <p className="text-gray-600 max-w-3xl">
            Each story includes vocabulary cues, ethical takeaways, and comprehension questions to guide your child's growth. Enjoy guided narration and storytime discussions.
          </p>
        </section>

        <section className="bg-gray-50 py-10 px-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">🎧 Sample Narration</h2>
          <AudioPlayer src="/audio/sample-grade1.mp3" title="Grade 1 Sample Story" />
        </section>

        <section className="bg-white py-10 px-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">❤️ What Parents Are Saying</h2>
          <div className="space-y-4">
            {testimonials.map((t, i) => (
              <blockquote key={i} className="border-l-4 border-blue-500 pl-4 italic text-gray-700">
                “{t.message}” <span className="block text-sm mt-1 text-gray-500">– {t.name}</span>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-pink-100 to-yellow-200 text-center py-12 px-6">
          <h2 className="text-3xl font-bold text-gray-800">🌍 Ready to Explore More?</h2>
          <p className="text-gray-700 mt-2">Unlock full library access and join the global learning adventure with your child.</p>
          <div className="mt-6">
            <Link href="/subscribe">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Get Started Today</Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
} 
