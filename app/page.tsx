export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-semibold">AI Companion Site</h1>
      <p className="mt-2 text-gray-600">Choose a character and start chatting.</p>

      <a
        href="/characters"
        className="inline-block mt-6 rounded-xl bg-black text-white px-4 py-2"
      >
        Browse characters →
      </a>
    </main>
  );
}