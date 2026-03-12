import Link from "next/link";
import { characters } from "@/data/characters";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function buildVibe(tags: string[]) {
  return tags.slice(0, 2).join(" • ");
}

export default async function CharactersPage() {
  const session = await auth();
  const email = session?.user?.email;

  let isPremium = false;

  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { isPremium: true },
    });

    isPremium = !!user?.isPremium;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#fff8fc] to-[#ffeef7] px-6 py-12 text-[#2b1330] md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center md:mb-14">
          <div className="mx-auto mb-4 inline-flex items-center rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700">
            Choose your favorite companion
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Select Your{" "}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              AI Companion
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#7a5b70] md:text-base">
            Explore all available companions and start chatting instantly with
            the personality that fits your mood best.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {characters.map((character) => {
            const locked = character.premium && !isPremium;
            const vibe = buildVibe(character.tags);

            return (
              <div
                key={character.id}
                className="group relative overflow-hidden rounded-[28px] border border-pink-100 bg-white shadow-[0_16px_40px_rgba(236,72,153,0.10)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(236,72,153,0.25)]"
              >
                <div className="relative h-[540px] w-full bg-gradient-to-br from-[#fff4fa] to-[#ffe7f3]">
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${
                      locked ? "opacity-80" : ""
                    }`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#1f0d20]/85 via-[#1f0d20]/20 to-transparent" />

                  <div className="absolute left-5 right-5 top-5 flex items-start justify-between">
                    <div className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {character.tags[0] || character.title}
                    </div>

                    {character.premium && (
                      <div className="rounded-full border border-amber-200/30 bg-amber-200/20 px-3 py-1 text-xs font-semibold text-amber-50 backdrop-blur">
                        Premium
                      </div>
                    )}
                  </div>

                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1f0d20]/40">
                      <span className="rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                        🔒 Premium Only
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                      {character.name}
                    </h2>

                    <div className="mt-2 text-sm font-medium text-pink-100">
                      {vibe || character.title}
                    </div>

                    <div className="mt-4 text-sm leading-6 text-white/85">
                      {character.title}
                    </div>

                    <p className="mt-3 text-sm leading-6 text-white/75">
                      {character.description}
                    </p>

                    {locked ? (
                      <Link
                        href="/premium"
                        className="mt-5 inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                      >
                        Unlock Premium
                      </Link>
                    ) : (
                      <Link
                        href={`/chat/${character.id}`}
                        className="mt-5 inline-flex items-center justify-center rounded-full bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-600"
                      >
                        Chat with {character.name}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}