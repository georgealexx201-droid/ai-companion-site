"use client";

import { useState } from "react";

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      alert(data.error || "Something went wrong.");
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-5xl font-bold">
          Upgrade to <span className="text-cyan-400">Premium</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          Unlock unlimited conversations, premium companions, and future exclusive features.
        </p>

        <div className="mx-auto mt-12 max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="mb-4 text-sm uppercase tracking-[0.25em] text-cyan-300">
            Premium Plan
          </div>

          <h2 className="text-3xl font-bold">€15 / month</h2>

          <p className="mt-3 text-white/65">
            Designed for users who want the full AI companion experience.
          </p>

          <div className="mt-8 space-y-4 text-left text-white/80">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              Unlimited chat
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              Premium characters
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              Early access to new features
            </div>
          </div>

          <button
            onClick={startCheckout}
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 px-5 py-3 font-semibold text-black shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Redirecting..." : "Subscribe with Stripe"}
          </button>

          <p className="mt-4 text-sm text-white/50">
            Secure checkout powered by Stripe.
          </p>
        </div>
      </div>
    </main>
  );
}