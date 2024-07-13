import { auth } from "@/auth";
import HistoryCard from "@/components/dashboard/HistoryCard";
import HotTopicsCard from "@/components/dashboard/HotTopicsCard";
import QuizMeCard from "@/components/dashboard/QuizMeCard";
import RecentActivities from "@/components/dashboard/RecentActivities";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

type Props = {};

export const metadata: Metadata = {
  title: "Dashboard | QuizMe",
};

const Dashboard = async (props: Props) => {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }
  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center">
        <h2 className="mr-2 text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 ">
        <QuizMeCard />
        <HistoryCard />
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
        <HotTopicsCard />
        <RecentActivities />
      </div>
    </main>
  );
};

export default Dashboard;
