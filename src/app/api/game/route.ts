import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { quizCreationSchema } from "@/schemas/form/quiz";
import { z } from "zod";
import { prisma } from "@/lib/db";
import axios from "axios";

export async function POST(req: Request, res: Response) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "You must be logged in ",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();
    const { amount, topic } = quizCreationSchema.parse(body);

    const game = await prisma.game.create({
      data: {
        gameType: "mcq",
        timeStarted: new Date(),
        userId: session.user.id,
        topic,
      },
    });

    const { data } = await axios.post(`${process.env.API_URL}/api/questions`, {
      amount,
      topic,
    });

    type Question = {
      question: string;
      answer: string;
      option1: string;
      option2: string;
      option3: string;
    };
    const manyData = data.questions.map((question: Question) => {
      const options = [
        question.option1,
        question.option2,
        question.option3,
        question.answer,
      ].sort(() => Math.random() - 0.5);
      return {
        question: question.question,
        options: JSON.stringify(options),
        answer: question.answer,
        gameId: game.id,
        questionType: "mcq",
      };
    });
    await prisma.questions.createMany({
      data: manyData,
    });

    return NextResponse.json({ gameId: game.id }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        {
          status: 400,
        }
      );
    } else {
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        {
          status: 500,
        }
      );
    }
  }
}
