import { auth } from "@/auth";
import QuizCreation from "@/components/forms/QuizCreation";
import { redirect } from "next/navigation";
import React from "react";

export const metadata = {
  title: "Quiz | QuizMe",
  description: "Quiz yourself on anything!",
};

type Props = {
  searchParams: {
    topic?: string;
  };
};

const QuizPage = async ({ searchParams: { topic } }: Props) => {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  return <QuizCreation topicParam={topic ?? ""} />;
};

export default QuizPage;
