"use client";
import React from "react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";

type Props = {
  text: string;
};

const SignInButton = ({ text }: Props) => {
  return (
    <Button
      onClick={() => {
        signIn("google").catch((err) => {
          console.log("Error in signing in \n ", err);
        });
      }}
    >
      {text}
    </Button>
  );
};

export default SignInButton;
