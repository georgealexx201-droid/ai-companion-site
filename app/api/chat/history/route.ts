import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCharacterById } from "@/data/characters";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { error: "You must be logged in to view chat history." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get("characterId");

    if (!characterId) {
      return NextResponse.json(
        { error: "Missing characterId" },
        { status: 400 }
      );
    }

    const character = getCharacterById(characterId);

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ messages: [] });
    }

    const chat = await prisma.chat.findFirst({
      where: {
        userId: user.id,
        characterId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!chat) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId: chat.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        role: true,
        content: true,
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("History route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}