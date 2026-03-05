const characters = [
  { id: "luna", name: "Luna", tagline: "Playful, curious, and chatty." },
  { id: "nova", name: "Nova", tagline: "Confident, witty, and bold." },
  { id: "mia", name: "Mia", tagline: "Kind, supportive, and thoughtful." },
];

export default function CharactersPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-semibold">Choose a character</h1>
      <p className="mt-2 text-gray-600">Pick someone to chat with.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map((c) => (
          <a
            key={c.id}
            href={`/chat/${c.id}`}
            className="rounded-xl border p-5 hover:shadow-sm transition"
          >
            <div className="text-xl font-medium">{c.name}</div>
            <div className="mt-2 text-gray-600">{c.tagline}</div>
            <div className="mt-4 text-sm underline">Open chat →</div>
          </a>
        ))}
      </div>
    </main>
  );
}