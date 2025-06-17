// pages/index.tsx import { useEffect, useState } from 'react'; import { supabase } from '@/lib/supabaseClient';

export default function HomePage() { const [featuredStories, setFeaturedStories] = useState([]); const [parentGuides, setParentGuides] = useState([]); const [testimonials, setTestimonials] = useState([]);

useEffect(() => { fetchFeaturedStories(); fetchParentGuides(); fetchTestimonials(); }, []);

const fetchFeaturedStories = async () => { const { data } = await supabase .from('featured_stories') .select('*') .order('created_at', { ascending: false }) .limit(3); setFeaturedStories(data || []); };

const fetchParentGuides = async () => { const { data } = await supabase .from('parent_guides') .select('*') .order('created_at', { ascending: false }) .limit(3); setParentGuides(data || []); };

const fetchTestimonials = async () => { const { data } = await supabase .from('testimonials') .select('*') .order('created_at', { ascending: false }) .limit(3); setTestimonials(data || []); };

return ( <div className="p-6"> <h1 className="text-3xl font-bold mb-4">Welcome to SmartKidStories</h1>

<section className="mb-10">
    <h2 className="text-xl font-semibold mb-2">🌟 Featured Stories</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {featuredStories.map(story => (
        <div key={story.id} className="p-4 border rounded shadow-md">
          <h3 className="font-bold text-lg">{story.title}</h3>
          <p>{story.summary}</p>
        </div>
      ))}
    </div>
  </section>

  <section className="mb-10">
    <h2 className="text-xl font-semibold mb-2">👪 Parent Guides</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {parentGuides.map(guide => (
        <div key={guide.id} className="p-4 border rounded shadow-md">
          <h3 className="font-semibold">Topic: {guide.topic}</h3>
          <p>{guide.guide_text}</p>
        </div>
      ))}
    </div>
  </section>

  <section>
    <h2 className="text-xl font-semibold mb-2">💬 Testimonials</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {testimonials.map(testimonial => (
        <div key={testimonial.id} className="p-4 border rounded shadow-md">
          <p className="italic">"{testimonial.message}"</p>
          <p className="font-medium mt-2">- {testimonial.name}, {testimonial.role}</p>
        </div>
      ))}
    </div>
  </section>
</div>

); }
