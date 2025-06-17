"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createSubscription, checkReferral } from "@/lib/subscription";
import { initiateMpesaPayment, initiatePaypalPayment } from "@/lib/payments";

const plans = [
  {
    id: "story",
    name: "Single Story Access",
    price: 10,
    description: "Unlock 1 story permanently",
  },
  {
    id: "grade",
    name: "Grade-Level Access",
    price: 70,
    description: "All stories in a grade, monthly access",
  },
  {
    id: "lifetime",
    name: "Full Library (Lifetime)",
    price: 350,
    description: "Unlimited access to all stories forever",
  },
  {
    id: "gold",
    name: "Gold Tier: Global Kid's Corner",
    price: 1000,
    description: "Access Chinese & French learning modules (Lifetime)",
  },
];

const Subscribe = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [referrer, setReferrer] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const ref = localStorage.getItem("referralCode");
    if (ref) {
      setReferrer(ref);
    }
  }, []);

  const handleSubscribe = async (planId: string, price: number, method: "mpesa" | "paypal") => {
    setLoading(planId + "-" + method);

    try {
      if (referrer) {
        await checkReferral(referrer);
      }

      const subscription = await createSubscription({ planId, amount: price });

      if (method === "mpesa") {
        const res = await initiateMpesaPayment({ amount: price, subscriptionId: subscription.id });
        if (res.success) alert("M-Pesa payment initiated. Confirm on your phone.");
      } else if (method === "paypal") {
        const res = await initiatePaypalPayment({ amount: price, subscriptionId: subscription.id });
        if (res.url) window.location.href = res.url;
      }
    } catch (err) {
      console.error("Subscription error:", err);
      alert("Subscription failed. Try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold mb-4">Choose Your Plan</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="rounded-2xl shadow-lg">
            <CardHeader>
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-4">Ksh {plan.price}</p>

              <Button
                className="w-full mb-2"
                onClick={() => handleSubscribe(plan.id, plan.price, "mpesa")}
                disabled={loading === `${plan.id}-mpesa`}
              >
                {loading === `${plan.id}-mpesa` ? "Processing..." : "Pay with M-Pesa"}
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleSubscribe(plan.id, plan.price, "paypal")}
                disabled={loading === `${plan.id}-paypal`}
              >
                {loading === `${plan.id}-paypal` ? "Redirecting..." : "Pay with PayPal"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Subscribe; 
