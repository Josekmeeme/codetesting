"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getStoriesByGrade } from "@/lib/stories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Skeleton } from "@/components/ui/skeleton";

interface Story {
  id: string;
  title: string;
  teaser: string;
  audio_url?: string;
  grade: number;
  language: string;
}

const Stories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState<number>(1);
  const [language, setLanguage] = useState<string>("English");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const selectedGrade = Number(searchParams.get("grade")) || 1;
    const lang = searchParams.get("lang") || "English";
    setGrade(selectedGrade);
    setLanguage(lang);

    fetchStories(selectedGrade, lang);
  }, [searchParams]);

  const fetchStories = async (grade: number, language: string) => {
    setLoading(true);
    try {
      const data = await getStoriesByGrade(grade, language);
      setStories(data || []);
    } catch (err) {
      console.error("Error loading stories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (newGrade: number) => {
    router.push(`?grade=${newGrade}&lang=${language}`);
  };

  const handleLanguageToggle = (lang: string) => {
    router.push(`?grade=${grade}&lang=${lang}`);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Grade {grade} Stories</h1>
        <LanguageToggle current={language} onChange={handleLanguageToggle} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((g) => (
          <Button
            key={g}
            variant={g === grade ? "default" : "outline"}
            onClick={() => handleGradeChange(g)}
          >
            Grade {g}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, idx) => (
            <Skeleton key={idx} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">No stories found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stories.map((story) => (
            <Card key={story.id} className="rounded-2xl shadow-md hover:shadow-lg transition">
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
                <p className="text-gray-700 mb-3 text-sm">{story.teaser}</p>
                {story.audio_url && <AudioPlayer url={story.audio_url} />}
                <Button
                  variant="link"
                  onClick={() => router.push(`/stories/${story.id}`)}
                >
                  Read Full Story
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Stories; 
