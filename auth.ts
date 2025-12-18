import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { DefaultSession, NextAuthConfig, Session } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string; // widen role
  }
  interface Session {
    user: DefaultSession["user"] & { role?: string };
  }
}

type SessionCallbackParams = {
  session: Session;
  user?: AdapterUser | null;
  trigger?: "update" | "signIn";
  token: JWT & { role?: string; name?: string };
};

type JwtCallbackParams = {
  token: JWT & { role?: string; name?: string };
  user?: (AdapterUser & { role?: string | null }) | null;
};

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
    async session({ session, user, trigger, token }: SessionCallbackParams) {
      session.user.id = token.sub ?? session.user.id;
      session.user.role = token.role ?? session.user.role;

      if (trigger === "update" && user?.name) {
        session.user.name = user.name;
      } else if (token.name) {
        session.user.name = token.name;
      }

      return session;
    },
    async jwt({ token, user }: JwtCallbackParams) {
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
