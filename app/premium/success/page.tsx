import Link from "next/link";

export default function PremiumSuccessPage() {
  return (
    <main className="min-h-screen bg-[#050816] px-6 py-16 text-white">
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center text-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur">
          <div className="mb-4 text-sm uppercase tracking-[0.25em] text-cyan-300">
            Payment Successful
          </div>

          <h1 className="text-4xl font-bold">
            Welcome to <span className="text-cyan-400">Premium</span>
          </h1>

          <p className="mt-4 text-white/70">
            Your subscription was successful. Your premium access should be activated shortly.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/characters"
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 px-6 py-3 font-semibold text-black shadow-lg transition hover:scale-[1.02]"
            >
              Explore Characters
            </Link>

            <Link
              href="/chat"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Go to Chat
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}