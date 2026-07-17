import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Usuario o correo", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[AUTH] Missing credentials");
          return null;
        }

        const identifier = credentials.email.trim().toLowerCase();
        console.log(`[AUTH] Login attempt: ${identifier}`);

        let user;
        try {
          user = await prisma.user.findFirst({
            where: {
              OR: [{ email: identifier }, { username: identifier }],
            },
          });
        } catch (dbError) {
          console.error("[AUTH] Database error during user lookup:", dbError);
          return null;
        }

        if (!user) {
          console.error(`[AUTH] User not found: ${identifier}`);
          return null;
        }

        if (!user.password) {
          console.error(`[AUTH] User has no password: ${identifier}`);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.error(`[AUTH] Invalid password for: ${identifier}`);
          return null;
        }

        console.log(`[AUTH] Successful login: ${identifier} (${user.role})`);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
