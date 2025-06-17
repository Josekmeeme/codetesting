import { useRouter } from 'next/router'; import { useEffect, useState } from 'react'; import { supabase } from '@/utils/supabaseClient'; import StoryCard from '@/components/StoryCard'; import Head from 'next/head'; import { Input } from '@/components/ui/input'; import { Select, SelectItem } from '@/components/ui/select';

interface Story { id: string; title: string; language: string; teaser: string; grade: number; topic: string; cover_image?: string; is_locked: boolean; }

export default function GradeStoriesPage() { const router = useRouter(); const { grade } = router.query; const [stories, setStories] = useState<Story[]>([]); const [loading, setLoading] = useState(true); const [languageFilter, setLanguageFilter] = useState(''); const [topicFilter, setTopicFilter] = useState(''); const [searchTerm, setSearchTerm] = useState('');

useEffect(() => { if (grade) { fetchStoriesByGrade(grade as string); } }, [grade, languageFilter, topicFilter, searchTerm]);

const fetchStoriesByGrade = async (gradeValue: string) => { setLoading(true); let query = supabase.from('stories').select('*').eq('grade', Number(gradeValue));

if (languageFilter) query = query.eq('language', languageFilter);
if (topicFilter) query = query.ilike('topic', `%${topicFilter}%`);
if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);

query = query.order('created_at', { ascending: false });

const { data, error } = await query;
if (error) {
  console.error('Error fetching stories:', error.message);
} else {
  setStories(data as Story[]);
}
setLoading(false);

};

return ( <> <Head> <title>Grade {grade} Stories | SmartKidStories</title> </Head> <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-white via-yellow-50 to-orange-100"> <h1 className="text-3xl md:text-4xl font-bold text-center text-orange-700 mb-6"> Grade {grade} Stories </h1>

<div className="mb-6 flex flex-col md:flex-row items-center justify-center gap-4">
      <Input
        placeholder="Search by title"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:w-1/3"
      />
      <Select onValueChange={setLanguageFilter} defaultValue="">
        <SelectItem value="">All Languages</SelectItem>
        <SelectItem value="English">English</SelectItem>
        <SelectItem value="Kiswahili">Kiswahili</SelectItem>
      </Select>
      <Select onValueChange={setTopicFilter} defaultValue="">
        <SelectItem value="">All Topics</SelectItem>
        <SelectItem value="Environment">Environment</SelectItem>
        <SelectItem value="Governance">Governance</SelectItem>
        <SelectItem value="Science">Science</SelectItem>
      </Select>
    </div>

    {loading ? (
      <div className="text-center text-orange-600">Loading stories...</div>
    ) : stories.length === 0 ? (
      <div className="text-center text-gray-600">No stories available for this grade.</div>
    ) : (
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    )}
  </div>
</>

); }

