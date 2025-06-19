import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    supabase
      .from("stories")
      .select("*")
      .then(({ data }) => setStories(data));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>SmartKid Stories</h1>
      {stories.length === 0 && <p>Loading stories...</p>}
      {stories.map((story) => (
        <div key={story.id} style={{ marginTop: "2rem" }}>
          <h2>{story.title}</h2>
          <p>{story.teaser}</p>
          <button>Unlock Full Story – Ksh 50</button>
        </div>
      ))}
    </div>
  );
} 
