import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function Navbar() {
  const session = await auth();

  let isPremium = false;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isPremium: true },
    });

    isPremium = !!user?.isPremium;
  }

  return (
    <div className="sticky top-0 z-50 border-b border-pink-100/80 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
        <Link
          href="/characters"
          className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-xl font-bold tracking-wide text-transparent"
        >
          AI Companion
        </Link>

        <div className="ml-8 hidden gap-6 text-sm font-medium text-[#7c4a68] md:flex">
          <Link
            href="/characters"
            className="transition hover:text-pink-600"
          >
            Characters
          </Link>

          <Link
            href="/premium"
            className="transition hover:text-pink-600"
          >
            Upgrade
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {session?.user?.name && (
            <span className="hidden text-[#7c4a68] sm:inline">
              {session.user.name}
            </span>
          )}

          {isPremium && (
            <span className="rounded-full border border-pink-200 bg-gradient-to-r from-amber-100 via-yellow-50 to-pink-100 px-3 py-1 text-xs font-semibold text-[#7a4b00] shadow-sm">
              ✨ Premium
            </span>
          )}
        </div>
      </div>
    </div>
  );
}