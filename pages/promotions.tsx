import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";

interface Promotion {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  expires_at: string;
}

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("status", "active")
        .gt("expires_at", now)
        .order("created_at", { ascending: false });

      if (!error && data) setPromotions(data);
      setLoading(false);
    };

    fetchPromotions();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (promotions.length === 0) return null;

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold mb-4 text-center">Featured Promotions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {promotions.map((promo) => (
          <Card
            key={promo.id}
            className="hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => window.open(promo.target_url, "_blank")}
          >
            <img
              src={promo.image_url}
              alt={promo.title}
              className="w-full h-40 object-cover rounded-t-xl"
            />
            <div className="p-3 font-medium text-center">{promo.title}</div>
          </Card>
        ))}
      </div>
    </div>
  );
} 
