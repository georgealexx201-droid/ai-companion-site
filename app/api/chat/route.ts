import { NextResponse } from "next/server";
import { getCharacterById } from "@/data/characters";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

type StoredMessage = {
  role: "user" | "assistant";
  content: string;
};

const FREE_DAILY_LIMIT = 20;

export async function POST(req: Request) {
  try {
    const session = await auth();

    const email = session?.user?.email;
    const name = session?.user?.name ?? "User";

    if (!email) {
      return NextResponse.json(
        { error: "You must be logged in to chat." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENROUTER_API_KEY" },
        { status: 500 }
      );
    }

    const characterId = body?.characterId;
    const incomingMessages = body?.messages;

    if (!characterId || typeof characterId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid characterId" },
        { status: 400 }
      );
    }

    if (!Array.isArray(incomingMessages)) {
      return NextResponse.json(
        { error: "Invalid messages array" },
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

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
        },
      });
    }

    if (character.premium && !user.isPremium) {
      return NextResponse.json(
        {
          error: "This character is only available for premium users.",
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    if (!user.isPremium) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todayUserMessageCount = await prisma.message.count({
        where: {
          role: "user",
          chat: {
            userId: user.id,
          },
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (todayUserMessageCount >= FREE_DAILY_LIMIT) {
        return NextResponse.json(
          {
            error: `Free plan limit reached (${FREE_DAILY_LIMIT} messages per day).`,
            upgradeRequired: true,
          },
          { status: 403 }
        );
      }
    }

    let chat = await prisma.chat.findFirst({
      where: {
        userId: user.id,
        characterId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userId: user.id,
          characterId,
        },
      });
    }

    const lastUserMessage = [...incomingMessages]
      .reverse()
      .find((msg: IncomingMessage) => msg.role === "user");

    if (!lastUserMessage || !lastUserMessage.content?.trim()) {
      return NextResponse.json(
        { error: "No valid user message found" },
        { status: 400 }
      );
    }

    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "user",
        content: lastUserMessage.content,
      },
    });

    const previousMessages: StoredMessage[] = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "asc" },
      select: {
        role: true,
        content: true,
      },
    });

    const messagesForAI = [
      {
        role: "system" as const,
        content: character.personalityPrompt,
      },
      ...previousMessages.map((msg: StoredMessage) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: messagesForAI,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data?.error?.message || "OpenRouter request failed",
        },
        { status: response.status }
      );
    }

    const reply = data?.choices?.[0]?.message?.content || "No response";

    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "assistant",
        content: reply,
      },
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}