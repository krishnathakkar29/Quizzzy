"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { quizCreationSchema } from "@/schemas/form/quiz";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

type InputSchema = z.infer<typeof quizCreationSchema>;

type Props = {};

const QuizCreation = (props: Props) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof quizCreationSchema>>({
    resolver: zodResolver(quizCreationSchema),
    defaultValues: {
      amount: 3,
      topic: "",
    },
  });

  form.watch();
  const { mutate: getQuestions, isPending } = useMutation({
    mutationFn: async ({ amount, topic }: InputSchema) => {
      const response = await axios.post("/api/game", {
        topic,
        amount,
      });

      return response.data;
    },
  });

  const onSubmit = (input: InputSchema) => {
    console.log("input hai", input);
    getQuestions(
      {
        amount: input.amount,
        topic: input.topic,
      },
      {
        //response.data jo return kiya tha woh aayega yaha
        onSuccess: ({ gameId }: { gameId: string }) => {
          router.push(`/play/mcq/${gameId}`);
        },
      }
    );
  };
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Quiz Creation</CardTitle>
          <CardDescription>Choose a topic</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a topic" {...field} />
                    </FormControl>
                    <FormDescription>
                      Please provide any topic you would like to be quizzed on
                      here.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="How many questions?"
                        type="number"
                        {...field}
                        onChange={(e) => {
                          form.setValue("amount", parseInt(e.target.value));
                        }}
                        min={1}
                        max={10}
                      />
                    </FormControl>
                    <FormDescription>
                      You can choose how many questions you would like to be
                      quizzed on here.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={isPending} type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizCreation;
