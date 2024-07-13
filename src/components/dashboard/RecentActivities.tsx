import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

type Props = {};

const RecentActivities = async (props: Props) => {
  const session = await auth();
  if (!session?.user) {
    return redirect("/");
  }
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          <Link href="/history">Recent Activity</Link>
        </CardTitle>
        <CardDescription>You have played a total of 7 quizzes.</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[580px] overflow-scroll">
        Histories
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
