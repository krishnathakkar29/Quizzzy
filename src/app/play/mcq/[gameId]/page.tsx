import { auth } from "@/auth";
import MCQ from "@/components/MCQ";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    gameId: string;
  };
};

const McqPage = async ({ params: { gameId } }: Props) => {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
    //do a SQL join and include the questions
    include: {
      questions: {
        select: {
          id: true,
          question: true,
          options: true,
        },
      },
    },
  });

  if (!game) {
    return redirect("/quiz");
  }

  console.log(game);
  return <MCQ game={game} />;
};

export default McqPage;
