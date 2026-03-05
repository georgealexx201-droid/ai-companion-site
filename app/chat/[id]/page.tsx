type Props = { params: Promise<{ id: string }> };

export default async function ChatPage({ params }: Props) {
  const { id } = await params;

  return (
    <main className="min-h-screen p-6">
      <a className="underline" href="/characters">← Back</a>
      <h1 className="mt-4 text-3xl font-semibold">Chat: {id}</h1>

      <div className="mt-6 rounded-xl border p-4">
        <p className="text-gray-600">Chat page works.</p>
      </div>
    </main>
  );
}