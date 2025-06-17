import { supabase } from "../lib/supabaseClient";

// Register new user with additional role-based or promo logic
export const registerUser = async (email, password, fullName, referrer = null) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        referrer: referrer || "",
        role: "user",
        created_at: new Date().toISOString(),
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Login user
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Login failed: " + error.message);
  }

  return data;
};

// Get current user session
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error("No user found: " + error.message);
  }

  return user;
};

// Update user profile (name, subscription tier, referral status)
export const updateUserProfile = async (updates) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    throw new Error("Profile update failed: " + error.message);
  }

  return true;
};

// Fetch user profile from Supabase 'profiles' table
export const getUserProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error("Fetching profile failed: " + error.message);
  }

  return data;
};

// Track subscription status (for auto-unlock logic)
export const isUserSubscribed = async () => {
  const profile = await getUserProfile();
  return profile.subscription_status === "active";
};

// Delete user
export const deleteUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("User logout failed: " + error.message);
  }

  return true;
}; 
