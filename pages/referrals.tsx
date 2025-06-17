import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/hooks/useUser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Referral {
  id: string;
  referred_email: string;
  joined_at: string;
  reward: number;
}

export default function Referrals() {
  const { user } = useUser();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const referralLink = `${window.location.origin}/signup?ref=${user?.id}`;

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("joined_at", { ascending: false });

      if (!error && data) {
        setReferrals(data);
        const total = data.reduce((sum, ref) => sum + (ref.reward || 0), 0);
        setTotalEarnings(total);
      }

      setLoading(false);
    };

    fetchReferrals();
  }, [user]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied!");
    } catch {
      toast.error("Failed to copy.");
    }
  };

  if (!user) return <div>Please login to view your referrals.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Referral Dashboard</h1>

      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Your Referral Link</h2>
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
          <span className="text-sm break-all">{referralLink}</span>
          <Button onClick={copyLink}>Copy</Button>
        </div>
      </Card>

      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Total Earnings</h2>
        <p className="text-xl font-bold text-green-600">Ksh {totalEarnings}</p>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Referred Users</h2>
        {loading ? (
          <p>Loading...</p>
        ) : referrals.length === 0 ? (
          <p>No referrals yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {referrals.map((ref) => (
              <li key={ref.id} className="py-2 flex justify-between">
                <span>{ref.referred_email}</span>
                <span className="text-sm text-gray-500">
                  Joined: {new Date(ref.joined_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
} 
