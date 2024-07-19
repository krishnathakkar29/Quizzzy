"use client";
import { Game, Questions } from "@prisma/client";
import { BarChart, ChevronRight, Loader2, Timer } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "./ui/button";
import MCQCounter from "./MCQCounter";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { checkAnswerSchema, endGameSchema } from "@/schemas/questions";
import axios from "axios";
import { useToast } from "./ui/use-toast";
import Link from "next/link";
import { cn, formatTimeDelta } from "@/lib/utils";
import { differenceInSeconds } from "date-fns";

type Props = {
  game: Game & { questions: Pick<Questions, "id" | "options" | "question">[] };
};

const MCQ = ({ game }: Props) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number>(0);
  const [hasEnded, setHasEnded] = React.useState<boolean>(false);
  const [now, setNow] = React.useState(new Date());
  const [stats, setStats] = React.useState({
    correct_answers: 0,
    wrong_answers: 0,
  });

  const { toast } = useToast();

  const { mutate: checkAnswer, isPending: isChecking } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion.id,
        userInput: options[selectedChoice],
      };
      const response = await axios.post(`/api/checkAnswer`, payload);
      return response.data;
    },
  });

  const { mutate: endGame } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof endGameSchema> = {
        gameId: game.id,
      };
      const response = await axios.post(`/api/endGame`, payload);
      return response.data;
    },
  });

  const handleNext = useCallback(() => {
    //passing first argument undefined because fn does not accpet any parameters.
    if (isChecking) return;
    checkAnswer(undefined, {
      onSuccess: ({ isCorrect }) => {
        if (isCorrect) {
          setStats((prev) => ({
            ...prev,
            correct_answers: prev.correct_answers + 1,
          }));

          toast({
            title: "Correct",
            description: "You got it right!",
            variant: "success",
          });
        } else {
          setStats((prev) => ({
            ...prev,
            wrong_answers: prev.wrong_answers + 1,
          }));
          toast({
            title: "Incorrect",
            description: "You got it wrong!",
            variant: "destructive",
          });
        }
      },
    });

    if (questionIndex === game.questions.length - 1) {
      endGame();
      setHasEnded(true);
      return;
    }
    setQuestionIndex((questionIndex) => questionIndex + 1);
  }, [checkAnswer, toast, isChecking, game.questions.length, questionIndex, toast, endGame]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (key === "1") {
        setSelectedChoice(0);
      } else if (key === "2") {
        setSelectedChoice(1);
      } else if (key === "3") {
        setSelectedChoice(2);
      } else if (key === "4") {
        setSelectedChoice(3);
      } else if (key === "Enter") {
        handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!hasEnded) {
        setNow(new Date());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hasEnded]);

  const currentQuestion = useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);

  const options = useMemo(() => {
    if (!currentQuestion) return [];
    if (!currentQuestion.options) return [];
    return JSON.parse(currentQuestion.options as string);
  }, [currentQuestion]);

  if (hasEnded) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center">
        <div className="px-4 py-2 mt-2 font-semibold text-white bg-green-500 rounded-md whitespace-nowrap">
          You Completed in{" "}
          {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
        </div>
        <Link
          href={`/statistics/${game.id}`}
          className={cn(buttonVariants({ size: "lg" }), "mt-2")}
        >
          View Statistics
          <BarChart className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <div className="mt-5 md:w-[80vw] max-w-4xl w-[90vw] top-1/2 left-1/2">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            {/* topic */}
            <p>
              <span className="text-slate-400">Topic</span> &nbsp;
              <span className="px-2 py-1 text-white rounded-lg bg-slate-800">
                {game.topic}
              </span>
            </p>
            <div className="flex self-start mt-3 text-slate-400">
              <Timer className="mr-2" />
              {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
            </div>
          </div>
          <MCQCounter
            correct_answers={stats.correct_answers}
            wrong_answers={stats.wrong_answers}
          />
        </div>

        <Card className="w-full mt-4">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="mr-5 text-center divide-y divide-zinc-600/50">
              <div>{questionIndex + 1}</div>
              <div className="text-base text-slate-400">
                {game.questions.length}
              </div>
            </CardTitle>
            <CardDescription className="flex-grow text-lg">
              {currentQuestion.question}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="flex flex-col items-center justify-center w-full mt-4">
          {options.map((option: string, index: number) => {
            return (
              <Button
                variant={selectedChoice === index ? "default" : "outline"}
                key={option}
                className="justify-start w-full py-8 mb-4"
                onClick={() => setSelectedChoice(index)}
              >
                <div className="flex items-center justify-start">
                  <div className="p-2 px-3 mr-5 border rounded-md">
                    {index + 1}
                  </div>
                  <div className="text-start">{option}</div>
                </div>
              </Button>
            );
          })}
          <Button
            disabled={isChecking}
            onClick={() => {
              handleNext();
            }}
            variant="default"
            className="mt-2"
            size="lg"
          >
            {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MCQ;
