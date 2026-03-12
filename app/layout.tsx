import "./globals.css";
import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "AI Companion",
  description: "Futuristic AI companion website",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <html lang="en">
      <body className="bg-gradient-to-b from-white via-[#fff8fc] to-[#ffeef7] text-[#2b1330]">
        <header className="sticky top-0 z-50 border-b border-pink-100/80 bg-white/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-2xl font-bold tracking-wide text-transparent"
            >
              AI Companion
            </Link>

            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-[#7c4a68] transition hover:text-pink-600"
              >
                Home
              </Link>

              <Link
                href="/characters"
                className="text-[#7c4a68] transition hover:text-pink-600"
              >
                Characters
              </Link>

              <Link
                href="/chat"
                className="text-[#7c4a68] transition hover:text-pink-600"
              >
                Chat
              </Link>

              <Link
                href="/premium"
                className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 font-semibold text-white shadow-md transition hover:scale-105"
              >
                Premium
              </Link>

              {!session?.user ? (
                <form
                  action={async () => {
                    "use server";
                    await signIn("google");
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-full border border-pink-200 bg-white px-4 py-2 font-semibold text-pink-600 shadow-sm transition hover:bg-pink-50"
                  >
                    Continue with Google
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#7c4a68]">{session.user.name}</span>

                  {isPremium && (
                    <span className="rounded-full border border-pink-200 bg-gradient-to-r from-amber-100 via-yellow-50 to-pink-100 px-3 py-1 text-xs font-semibold text-[#7a4b00] shadow-sm">
                      ✨ Premium
                    </span>
                  )}

                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-full border border-pink-200 bg-white px-4 py-2 font-semibold text-pink-600 shadow-sm transition hover:bg-pink-50"
                    >
                      Log out
                    </button>
                  </form>
                </div>
              )}
            </nav>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}