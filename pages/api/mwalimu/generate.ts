// pages/api/generate.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const TOPICS = [
  "citizenship", "ethics", "governance", "science", "heritage",
  "AI", "sports", "life skills", "finance", "compassion",
  "environment", "religion", "music", "farming", "cities"
];

const KISWAHILI_TOPICS = ["mazingira", "uongozi", "huruma", "dini", "raia"];

async function generateStory(grade: number, topic: string, isKiswahili = false) {
  const langPrompt = isKiswahili ? "andika hadithi kwa Kiswahili sanifu" : "write a story in English";
  const prompt = `${langPrompt} for Grade ${grade} students about ${topic}. Include:
- A short, catchy teaser (1.5–2 paragraphs)
- Full story with humor and suspense
- 3–4 comprehension questions
- Vocabulary definitions
- Parent guidance summary
Use a simple tone appropriate for Grade ${grade}.`;

  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 1800
  });

  return response.choices[0]?.message.content;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { grade } = req.body;
  if (!grade) return res.status(400).json({ error: 'Grade is required' });

  try {
    const selectedTopics = [...TOPICS].sort(() => 0.5 - Math.random()).slice(0, 7);
    const selectedKiswahili = [...KISWAHILI_TOPICS].sort(() => 0.5 - Math.random()).slice(0, 3);

    const allTopics = [...selectedTopics.map(t => ({ t, kis: false })), ...selectedKiswahili.map(t => ({ t, kis: true }))];

    const results = await Promise.all(
      allTopics.map(async ({ t, kis }) => {
        const content = await generateStory(grade, t, kis);
        const { data, error } = await supabase.from('stories').insert([
          {
            grade,
            topic: t,
            language: kis ? 'Kiswahili' : 'English',
            content,
            generated_by: 'MWALIMU-AI',
            approved: false,
            created_at: new Date().toISOString()
          }
        ]);
        return { topic: t, success: !error, error };
      })
    );

    return res.status(200).json({ message: 'Stories generated', results });
  } catch (err) {
    console.error('[STORY_GENERATION_ERROR]', err);
    return res.status(500).json({ error: 'Story generation failed' });
  }
} 
