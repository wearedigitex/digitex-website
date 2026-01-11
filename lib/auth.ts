import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { client } from "./sanity"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Fetch user from Sanity
        const user = await client.fetch(
          `*[_type == "user" && email == $email][0] {
            _id,
            email,
            password,
            role,
            status,
            "authorName": author->name,
            "authorId": author->_id
          }`,
          { email: credentials.email }
        )

        if (!user || user.status !== "active") {
          return null
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        // Update last login
        await client
          .patch(user._id)
          .set({ lastLogin: new Date().toISOString() })
          .commit()

        return {
          id: user._id,
          email: user.email,
          role: user.role,
          authorName: user.authorName,
          authorId: user.authorId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.authorName = user.authorName
        token.authorId = user.authorId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.authorName = token.authorName as string
        session.user.authorId = token.authorId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})
