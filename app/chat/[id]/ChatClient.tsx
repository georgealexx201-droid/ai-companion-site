"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getCharacterById } from "@/data/characters";
import UpgradeModal from "@/app/components/UpgradeModal";

type Msg = {
  role: "user" | "assistant";
  content: string;
};

const sceneOptions = [
  "Pink Lounge",
  "Rooftop Date",
  "Luxury Suite",
  "Neon City",
  "Soft Bedroom",
  "Private Spa",
];

function getStorageKey(characterId: string) {
  return `chat-history-${characterId}`;
}

export default function ChatClient({ id }: { id: string }) {
  const character = useMemo(() => getCharacterById(id), [id]);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedScene, setSelectedScene] = useState("Pink Lounge");

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!character) return;

    async function loadHistory() {
      try {
        const res = await fetch(`/api/chat/history?characterId=${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load history");
        }

        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
          return;
        }

        setMessages([
          {
            role: "assistant",
            content: `Hey, I'm ${character.name} 💖 I'm here with you.`,
          },
        ]);
      } catch (error) {
        console.error("Failed to load chat history:", error);

        const savedMessages = localStorage.getItem(getStorageKey(id));

        if (savedMessages) {
          try {
            const parsed = JSON.parse(savedMessages) as Msg[];

            if (Array.isArray(parsed) && parsed.length > 0) {
              setMessages(parsed);
              return;
            }
          } catch (parseError) {
            console.error("Failed to parse saved chat:", parseError);
          }
        }

        setMessages([
          {
            role: "assistant",
            content: `Hey, I'm ${character.name} 💖 I'm here with you.`,
          },
        ]);
      }
    }

    loadHistory();
  }, [character, id]);

  useEffect(() => {
    if (!character || messages.length === 0) return;
    localStorage.setItem(getStorageKey(id), JSON.stringify(messages));
  }, [messages, character, id]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading || !character) return;

    const userMessage: Msg = {
      role: "user",
      content: text,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characterId: character.id,
          messages: nextMessages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.upgradeRequired) {
          setMessages(messages);
          setInput(text);
          setShowUpgrade(true);
          return;
        }

        throw new Error(data?.error || "API error");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "No response",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Something went wrong while talking to the AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!character) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-white">
        Character not found.
      </div>
    );
  }

  return (
    <>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="relative overflow-hidden rounded-[32px] border border-pink-300/20 bg-[#120812] shadow-[0_0_50px_rgba(236,72,153,0.14)]">
            <div className="absolute inset-0">
              <div className="flex h-full w-full items-center justify-center">
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="h-[82%] w-[72%] rounded-[28px] object-cover opacity-80 shadow-2xl"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-b from-[#1a0716]/35 via-[#150813]/20 to-[#120812]/88" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,105,180,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.10),transparent_28%)]" />
            </div>

            <div className="relative flex h-[calc(100vh-170px)] min-h-[600px] max-h-[720px] flex-col">
              <div className="flex items-center gap-3 px-5 py-4">
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="h-12 w-12 rounded-full border border-white/20 object-cover shadow-lg"
                />

                <div>
                  <div className="text-xl font-bold text-white">
                    {character.name} {character.premium ? "👑" : ""}
                  </div>
                  <div className="text-sm text-pink-200/90">{character.title}</div>
                </div>

                <div className="ml-auto inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/15 px-3 py-1 text-xs font-medium text-green-300 backdrop-blur-md">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
                  online
                </div>
              </div>

              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 pt-4"
              >
                <div className="mx-auto flex min-h-full w-full max-w-[620px] flex-col justify-end">
                  <div className="space-y-3 pb-4">
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          m.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={
                            m.role === "user"
                              ? "max-w-[48%] rounded-2xl rounded-br-md bg-gradient-to-r from-pink-500 to-fuchsia-500 px-4 py-3 text-sm text-white shadow-lg"
                              : "max-w-[64%] rounded-2xl rounded-bl-md border border-white/10 bg-black/55 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-sm"
                          }
                        >
                          {m.content}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="flex justify-start">
                        <div className="max-w-[64%] rounded-2xl rounded-bl-md border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-sm">
                          <div className="mb-2 text-xs text-pink-200">
                            {character.name} is typing...
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-pink-300 [animation-delay:-0.3s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-pink-300 [animation-delay:-0.15s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-pink-300" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 pt-3">
                <div className="mx-auto flex w-full max-w-[620px] items-center gap-3 rounded-full border border-white/10 bg-[#1a0d18]/90 p-2 shadow-lg backdrop-blur-md">
                  <input
                    type="text"
                    className="flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-white/55"
                    placeholder={`Type a message to ${character.name}...`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        send();
                      }
                    }}
                  />

                  <button
                    onClick={send}
                    disabled={loading}
                    className="rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="rounded-[32px] border border-pink-300/15 bg-[#140d16] p-5 text-white shadow-[0_0_40px_rgba(236,72,153,0.08)]">
            <div className="mb-5 flex gap-2">
              <button className="rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white">
                Scenes
              </button>
              <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                Premium
              </button>
            </div>

            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-pink-200">Scenes</div>

              <div className="grid grid-cols-2 gap-3">
                {sceneOptions.map((scene) => {
                  const active = selectedScene === scene;

                  return (
                    <button
                      key={scene}
                      onClick={() => setSelectedScene(scene)}
                      className={`rounded-2xl border p-3 text-left transition ${
                        active
                          ? "border-pink-300/50 bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 shadow-[0_0_20px_rgba(236,72,153,0.12)]"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="mb-3 h-16 rounded-xl bg-gradient-to-br from-pink-200/20 via-fuchsia-300/10 to-purple-300/20" />
                      <div className="text-sm font-semibold text-white">{scene}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-pink-300/15 bg-gradient-to-br from-pink-500/10 to-fuchsia-500/10 p-4">
              <div className="mb-2 text-sm font-semibold text-white">Premium</div>

              <div className="mb-4 text-sm text-white/70">
                Add your premium images, exclusive scene content, and special chat extras here.
              </div>

              <a
                href="/premium"
                className="inline-flex rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Manage Premium
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}