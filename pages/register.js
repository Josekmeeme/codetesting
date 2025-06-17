import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";
import { toast } from "sonner";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const referralCode = router.query.ref as string | undefined;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      toast.error(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = signUpData?.user?.id;

    if (userId) {
      // Save user in users table
      await supabase.from("users").insert([
        {
          id: userId,
          email,
          role: "parent", // Default role
          referral_code: referralCode || null,
        },
      ]);

      // Track referral if code exists
      if (referralCode) {
        await supabase.from("referrals").insert([
          {
            referrer_id: referralCode,
            referred_email: email,
            joined_at: new Date().toISOString(),
            reward: 0,
          },
        ]);
      }

      toast.success("Account created! Check your email to verify.");
      router.push("/login");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold">Create Account</h2>

        {referralCode && (
          <p className="text-sm text-green-600">
            🎉 You're signing up with a referral code!
          </p>
        )}

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-4 py-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
} 
