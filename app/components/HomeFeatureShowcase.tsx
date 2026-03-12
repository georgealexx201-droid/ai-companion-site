"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { characters } from "@/data/characters";

type ShowcaseSlide = {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  vibe: string;
  accent: string;
  premium: boolean;
};

function buildVibe(tags: string[]) {
  return tags.slice(0, 2).join(" • ");
}

function buildAccent(character: {
  premium?: boolean;
  title: string;
  tags: string[];
}) {
  if (character.premium) return "Premium experience";
  if (character.tags[0]) return character.tags[0];
  return character.title;
}

export default function HomeFeatureShowcase() {
  const allCharacters = useMemo(
    () =>
      characters.map((character) => ({
        id: character.id,
        name: character.name,
        title: character.title,
        description: character.description,
        image: character.avatar,
        vibe: buildVibe(character.tags),
        accent: buildAccent(character),
        premium: !!character.premium,
      })),
    []
  );

  const slides: ShowcaseSlide[] = useMemo(
    () => allCharacters.slice(0, 3),
    [allCharacters]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentSlide = slides[currentIndex];

  const goToSlide = (index: number) => {
    if (index === currentIndex || isAnimating) return;

    setIsAnimating(true);

    setTimeout(() => {
      setCurrentIndex(index);
      setTimeout(() => {
        setIsAnimating(false);
      }, 80);
    }, 260);
  };

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      if (isAnimating) return;

      setIsAnimating(true);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        setTimeout(() => {
          setIsAnimating(false);
        }, 80);
      }, 260);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAnimating, slides.length]);

  if (!currentSlide) return null;

  return (
    <section className="pb-20 md:pb-24">
      <div
        className={`relative overflow-hidden rounded-[36px] border border-pink-100/80 bg-white shadow-[0_24px_80px_rgba(236,72,153,0.14)] transition-all duration-700 ${
          isAnimating ? "scale-[0.995] opacity-95" : "scale-100 opacity-100"
        }`}
      >
        <div className="relative h-[560px] w-full bg-gradient-to-br from-[#fff4fa] via-[#ffe8f4] to-[#ffe1ef] md:h-[680px]">
          <div className="absolute inset-0 z-0">
            <Image
              key={currentSlide.image}
              src={currentSlide.image}
              alt={currentSlide.name}
              fill
              priority
              className="object-contain object-right-bottom"
            />
          </div>

          <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(43,19,48,0.84)_0%,rgba(63,26,52,0.72)_28%,rgba(90,35,67,0.36)_48%,rgba(255,255,255,0.02)_72%)]" />
          <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(236,72,153,0.10)_0%,rgba(0,0,0,0.08)_100%)]" />

          <div className="relative z-20 flex h-full items-end p-6 md:p-10 lg:p-14">
            <div
              className={`max-w-2xl transition-all duration-700 ${
                isAnimating ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              <div className="inline-flex items-center rounded-full border border-pink-300/40 bg-pink-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-100 backdrop-blur md:text-sm">
                Meet {currentSlide.name}
              </div>

              <h2 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.02] text-white md:text-6xl lg:text-7xl">
                Find Your Perfect AI Companion
              </h2>

              <p className="mt-5 max-w-xl text-base leading-8 text-white/85 md:text-lg">
                {currentSlide.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                  {currentSlide.vibe}
                </div>

                <div className="rounded-full border border-pink-200/30 bg-pink-400/15 px-4 py-2 text-sm font-medium text-pink-100 backdrop-blur">
                  {currentSlide.accent}
                </div>

                {currentSlide.premium && (
                  <div className="rounded-full border border-amber-200/30 bg-amber-200/15 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur">
                    Premium
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={`/chat/${currentSlide.id}`}
                  className="rounded-full bg-pink-500 px-7 py-3.5 font-semibold text-white shadow-lg transition hover:bg-pink-600"
                >
                  Chat with {currentSlide.name}
                </Link>

                <Link
                  href="/characters"
                  className="rounded-full border border-white/25 bg-white/10 px-7 py-3.5 font-medium text-white backdrop-blur transition hover:bg-white/15"
                >
                  View Companions
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 md:bottom-8 md:right-8">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to ${slide.name}`}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-10 bg-pink-500"
                    : "w-2.5 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 md:mt-14">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-[#2b1330] md:text-3xl">
            Featured Companions
          </h3>
          <p className="mt-2 text-sm text-[#7a5b70] md:text-base">
            Choose from your available AI personalities and start chatting instantly.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {allCharacters.map((character) => (
            <div
                key={character.id}
                className="group relative overflow-hidden rounded-[28px] border border-pink-100 bg-white shadow-[0_16px_40px_rgba(236,72,153,0.10)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(236,72,153,0.25)]"
              >
              <div className="relative h-[520px] w-full bg-gradient-to-br from-[#fff4fa] to-[#ffe7f3]">
                <Image
                  src={character.image}
                  alt={character.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#1f0d20]/85 via-[#1f0d20]/20 to-transparent" />

                <div className="absolute left-5 right-5 top-5 flex items-start justify-between">
                  <div className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {character.accent}
                  </div>

                  {character.premium && (
                    <div className="rounded-full border border-amber-200/30 bg-amber-200/20 px-3 py-1 text-xs font-semibold text-amber-50 backdrop-blur">
                      Premium
                    </div>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="text-3xl font-bold tracking-tight text-white">
                    {character.name}
                  </div>

                  <div className="mt-2 text-sm font-medium text-pink-100">
                    {character.vibe || character.title}
                  </div>

                  <div className="mt-4 text-sm leading-6 text-white/85">
                    {character.title}
                  </div>

                  <Link
                    href={`/chat/${character.id}`}
                    className="mt-5 inline-flex rounded-full bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-600"
                  >
                    Chat with {character.name}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}