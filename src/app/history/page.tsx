import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { LucideLayoutDashboard } from "lucide-react";
import HistoryComponent from "@/components/HistoryComponent";

type Props = {};

const HistoryPage = async (props: Props) => {
  const session = await auth();
  if (!session?.user) {
    return redirect("/");
  }
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="w-[400px]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">History</CardTitle>
              <Link className={buttonVariants()} href="/dashboard">
                <LucideLayoutDashboard className="mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </CardHeader>
          <CardContent className="max-h-[60vh] overflow-scroll">
            <HistoryComponent limit={100} userId={session.user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoryPage;
