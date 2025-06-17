import { supabase } from "../lib/supabaseClient";

// Get all published stories
export const getAllStories = async () => {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// Get stories by grade (and optionally language)
export const getStoriesByGrade = async (grade, language = null) => {
  let query = supabase.from("stories").select("*").eq("grade", grade).eq("is_published", true);
  if (language) query = query.eq("language", language);

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// Get one story by ID
export const getStoryById = async (id) => {
  const { data, error } = await supabase.from("stories").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
};

// Add a new story (used by MWALIMU-AI weekly generator)
export const addNewStory = async (story) => {
  const { data, error } = await supabase.from("stories").insert([story]);
  if (error) throw new Error(error.message);
  return data[0];
};

// Update a story (e.g. for admin review or improvement)
export const updateStory = async (id, updates) => {
  const { data, error } = await supabase.from("stories").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
  return data;
};

// Delete a story (by admin)
export const deleteStory = async (id) => {
  const { error } = await supabase.from("stories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
};

// Get featured stories
export const getFeaturedStories = async () => {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("is_featured", true)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// Weekly fetch for MWALIMU-AI (admin preview or broadcast)
export const getThisWeeksStories = async () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .gte("created_at", oneWeekAgo.toISOString())
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}; 
