"use client";

import { useEffect, useState } from "react";

export default function MessageCounter() {
  const [used, setUsed] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | string | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((res) => res.json())
      .then((data) => {
        setUsed(data.used);
        setLimit(data.limit);
      })
      .catch((error) => {
        console.error("Counter fetch error:", error);
        setUsed(0);
        setLimit(20);
      });
  }, []);

  if (limit === "unlimited") {
    return (
      <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300">
        👑 Premium Member — Unlimited Messages
      </div>
    );
  }

  if (used === null) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
      Free messages today: <span className="font-semibold">{used}</span> / {limit}
    </div>
  );
}