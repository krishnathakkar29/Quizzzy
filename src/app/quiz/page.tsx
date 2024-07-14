import { auth } from "@/auth";
import QuizCreation from "@/components/forms/QuizCreation";
import { redirect } from "next/navigation";
import React from "react";

export const metadata = {
  title: "Quiz | QuizMe",
  description: "Quiz yourself on anything!",
};

type Props = {};

const QuizPage = async (props: Props) => {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  return <QuizCreation />;
};

export default QuizPage;
