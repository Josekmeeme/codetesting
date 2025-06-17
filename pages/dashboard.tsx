Meeme Kariithi
	
8:30 PM (9 minutes ago)
	
to me
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const supabase = createClient();

export default function GlobalKidsCorner() {
  const session = useSession();
  const router = useRouter();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [goldAccess, setGoldAccess] = useState(false);

  useEffect(() => {
    const fetchAccess = async () => {
      const { data: profile } = await supabase
        .from("users")
        .select("subscription_tier")
        .eq("id", session?.user?.id)
        .single();

      if (profile?.subscription_tier === "gold") {
        setGoldAccess(true);
        fetchLessons();
      } else {
        setGoldAccess(false);
        setLoading(false);
      }
    };

    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from("global_kids_corner")
        .select("*")
        .order("level");

      if (data) setLessons(data);
      setLoading(false);
    };

    if (session) fetchAccess();
    else setLoading(false);
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!goldAccess) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold">Gold Access Required</h2>
        <p className="mb-4">Upgrade to Gold (Ksh 1000 Lifetime) to unlock French and Chinese for kids.</p>
        <Button onClick={() => router.push("/subscribe")}>Upgrade Now</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">🌍 Global Kid’s Corner – French & Chinese Lessons</h1>
      <p className="mb-4">Empower your child with basic greetings, phrases, and fun vocabulary in French and Chinese!</p>

      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((lesson) => (
          <Card key={lesson.id}>
            <CardContent>
              <h3 className="text-lg font-bold">{lesson.language} - Level {lesson.level}</h3>
              <p className="text-sm mt-2">{lesson.topic}</p>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {lesson.phrases?.map((phrase: any, i: number) => (
                  <li key={i}>
                    <strong>{phrase.label}:</strong> {phrase.translation}
                  </li>
                ))}
              </ul>
              {lesson.audio_url && (
                <audio controls className="mt-3 w-full">
                  <source src={lesson.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
	
