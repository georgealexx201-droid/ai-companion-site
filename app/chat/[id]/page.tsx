import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ChatClient from "./ChatClient";
import MessageCounter from "@/app/components/MessageCounter";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/");
  }

  const { id } = await params;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.12),transparent_25%),linear-gradient(180deg,#07030a_0%,#120813_100%)] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <MessageCounter />
        </div>

        <ChatClient id={id} />
      </div>
    </main>
  );
}