import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function Signup() {
  const router = useRouter();
  const referralCode = router.query.ref as string | undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      // Insert into users table
      await supabase.from("users").insert([
        {
          id: userId,
          email,
          role: "parent",
          referral_code: referralCode || null,
        },
      ]);

      // Track referral
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

      toast.success("Signup successful! Please check your email to verify.");
      router.push("/login");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4 py-12">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        {referralCode && (
          <p className="text-sm mb-4 text-green-600">
            🎁 You're signing up with a referral!
          </p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
} 
