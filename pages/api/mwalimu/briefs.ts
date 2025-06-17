// pages/api/briefs.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const briefThemes = [
  "environmental protection",
  "moral uprightness",
  "anti-corruption",
  "education for all",
  "child protection",
  "peace and compassion",
  "national unity",
  "AI and digital responsibility"
];

async function generateBrief(theme: string): Promise<string> {
  const prompt = `Write a short, powerful civic or ethical message for children and families on the theme: "${theme}".
It should be:
- Under 280 characters
- Easily memorable
- Encouraging virtuous behavior
- Written in simple English`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.6,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200
  });

  return completion.choices[0].message.content?.trim() || '';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    const selectedThemes = [...briefThemes].sort(() => 0.5 - Math.random()).slice(0, 5);

    const briefs = await Promise.all(selectedThemes.map(async (theme) => {
      const message = await generateBrief(theme);
      const { error } = await supabase.from('briefs').insert({
        theme,
        message,
        language: 'English',
        approved: false,
        created_at: new Date().toISOString()
      });

      return { theme, message, success: !error, error };
    }));

    return res.status(200).json({ message: 'Briefs generated', briefs });
  } catch (error) {
    console.error('[BRIEF_GENERATION_ERROR]', error);
    res.status(500).json({ error: 'Failed to generate briefs' });
  }
} 
