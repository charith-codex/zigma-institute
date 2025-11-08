import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig, Session, User } from "next-auth";
import { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string; // widen role
  }
  interface Session {
    user: DefaultSession["user"] & { role?: string };
  }
}

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        // find user in db
        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string },
        });

        // check user exists and password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );

          // if password correct return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        // if user does not exists or password does not match return null
        return null;
      },
    }),
  ],
  callbacks: {
    async session({
      session,
      user,
      trigger,
      token,
    }: {
      session: Session;
      user?: User | null;
      trigger?: "update" | "signIn" | "signUp" | undefined;
      token: JWT & { role?: string; name?: string };
    }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.id;
        session.user.role = token.role;
        session.user.name = token.name ?? session.user.name;
      }

      // if there is an update, set the user name
      if (trigger === "update" && user?.name && session.user) {
        session.user.name = user.name;
      }

      return session;
    },
    async jwt({
      token,
      user,
      trigger,
    }: {
      token: JWT & { role?: string; name?: string };
      user?: (User & { role?: string | null }) | null;
      trigger?: "update" | "signIn" | "signUp" | undefined;
      session?: Session;
    }) {
      // assign user fields to token
      if (user) {
        token.role = user.role;

        // if user has no name, set part in their email
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];

          // update db to reflect token name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
      }
      return token;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
