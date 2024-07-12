import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const Providers = async ({ children }: Props) => {
  const session = await auth();

  return (
    <>
      <SessionProvider session={session}>{children}</SessionProvider>
    </>
  );
};

export default Providers;
