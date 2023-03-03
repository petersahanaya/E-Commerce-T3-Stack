import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import NextAuth from "next-auth/next";
import { prisma } from "@/server/utils/context";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        session({ session, token }) {
            if (!session.user.id) {
                session.user.id = token.sub
                return session
            }

            return session
        },
        async signIn({ user, account }) {
            const duplicate = await prisma.user.findUnique({ where: { id: account?.providerAccountId } })

            if (!duplicate) {
                await prisma.user.create({ data: { id: account?.providerAccountId, email: user.email!, profile: user.image!, username: user.name! } })

                return true
            }

            return true
        },
    },
    pages: {
        signIn: "/signIn"
    },
    secret : process.env.NEXTAUTH_SECRET! 
}

export default NextAuth(authOptions)