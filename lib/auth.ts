import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { adminClient } from "./sanity"

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

        try {
          // Fetch user from Sanity using the correct email
          const user = await adminClient.fetch(
            `*[_type == "user" && email == $email][0] {
              _id,
              email,
              password,
              role,
              status,
              "authorName": author->name,
              "authorId": author->_id
            }`,
            { email: (credentials.email as string).toLowerCase().trim() }
          )

          if (!user) {
            console.log("Auth: User not found:", credentials.email)
            return null
          }

          if (user.status !== "active") {
            console.log("Auth: User not active:", credentials.email)
            return null
          }

          // Verify password
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isValid) {
            console.log("Auth: Password mismatch for:", credentials.email)
            return null
          }

          // Update last login (fire and forget)
          adminClient
            .patch(user._id)
            .set({ lastLogin: new Date().toISOString() })
            .commit()
            .catch(err => console.error("Failed to update last login:", err))

          return {
            id: user._id,
            email: user.email,
            role: user.role,
            authorName: user.authorName,
            authorId: user.authorId,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any
        token.role = u.role
        token.authorName = u.authorName
        token.authorId = u.authorId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const s = session.user as any
        s.role = token.role as string
        s.authorName = token.authorName as string
        s.authorId = token.authorId as string
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
