import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import { prisma } from "./lib/db";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  })],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token }) => {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token?.email,
        },
      });

      if (dbUser) {
        token.id = dbUser.id;
      }

      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email!;
        session.user.image = token.picture;
      }

      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
});
