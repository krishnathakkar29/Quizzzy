import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { checkAnswerSchema } from "@/schemas/questions";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();

    const { questionId, userInput } = checkAnswerSchema.parse(body);
    const question = await prisma.questions.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      return NextResponse.json(
        {
          message: "Question not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.questions.update({
      where: { id: questionId },
      data: { userAnswer: userInput },
    });

    const isCorrect =
      question.answer.toLowerCase().trim() === userInput.toLowerCase().trim();

    await prisma.questions.update({
      where: { id: questionId },
      data: { isCorrect },
    });

    return NextResponse.json({
      isCorrect,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: error.issues,
        },
        {
          status: 400,
        }
      );
    }
  }
}
