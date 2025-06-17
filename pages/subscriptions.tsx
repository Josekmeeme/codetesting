import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { createSubscription } from "@/lib/api/subscription";
import { payWithMpesa } from "@/lib/payments/mpesa";
import { payWithPayPal } from "@/lib/payments/paypal";

const plans = [
  { id: "story", label: "Per Story", price: 10, description: "Permanent access to one story" },
  { id: "grade", label: "Grade Level", price: 70, description: "Monthly access to stories for one grade" },
  { id: "lifetime", label: "Full Library", price: 350, description: "Lifetime access to all stories" },
  { id: "gold", label: "Gold Tier", price: 1000, description: "Lifetime + Global Kid’s Corner (French/Chinese)" },
];

export default function Subscription() {
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [payMethod, setPayMethod] = useState("mpesa");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubscribe = async () => {
    if (!user) {
      setMessage("Please log in to continue.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // 1. Create subscription
      const res = await createSubscription({
        userId: user.id,
        planId: selectedPlan.id,
        amount: selectedPlan.price,
        referrer: localStorage.getItem("referrer") || null,
      });

      if (!res.success) throw new Error(res.error);

      const subscription = res.subscription;

      // 2. Proceed with payment
      if (payMethod === "mpesa") {
        await payWithMpesa(user.phone, selectedPlan.price, subscription.id);
        setMessage("M-Pesa prompt sent. Confirm payment to unlock.");
      } else {
        await payWithPayPal(selectedPlan.price, subscription.id);
        setMessage("Redirecting to PayPal...");
      }
    } catch (error: any) {
      console.error(error.message);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4 text-center">Choose a Subscription Plan</h1>

      <div className="grid gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border p-4 rounded-xl shadow-sm cursor-pointer ${
              selectedPlan.id === plan.id ? "border-blue-500" : "border-gray-200"
            }`}
            onClick={() => setSelectedPlan(plan)}
          >
            <h2 className="text-lg font-semibold">{plan.label}</h2>
            <p className="text-sm text-gray-600">{plan.description}</p>
            <p className="text-blue-600 font-bold mt-2">Ksh {plan.price}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <label className="block text-sm mb-2">Select Payment Method:</label>
        <div className="flex gap-4">
          <button
            className={`border px-4 py-2 rounded ${
              payMethod === "mpesa" ? "bg-green-100 border-green-500" : "border-gray-300"
            }`}
            onClick={() => setPayMethod("mpesa")}
          >
            M-Pesa
          </button>
          <button
            className={`border px-4 py-2 rounded ${
              payMethod === "paypal" ? "bg-yellow-100 border-yellow-500" : "border-gray-300"
            }`}
            onClick={() => setPayMethod("paypal")}
          >
            PayPal
          </button>
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={handleSubscribe} disabled={loading} className="w-full">
          {loading ? "Processing..." : `Subscribe - Ksh ${selectedPlan.price}`}
        </Button>
        {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
      </div>
    </div>
  );
} 
