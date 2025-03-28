import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "./db";
import User from "@/app/models/User";

async function syncUserWithDB(user) {
  await connectToDatabase();
  const existingUser = await User.findOne({ email: user.email });
  if (existingUser) {
    if (existingUser.image !== user.image) {
      existingUser.image = user.image;
      await existingUser.save();
    }
  } else {
    const newUser = new User({
      name: user.name,
      email: user.email,
      image: user.image,
      customField: "",
    });
    await newUser.save();
  }
}

async function getUserData(email) {
  await connectToDatabase();
  return await User.findOne({ email });
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive.file",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      try {
        await syncUserWithDB(user);
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        console.log("JWT callback - New token:", { accessToken: token.accessToken, expiresAt: token.expiresAt });
      }
      console.log("JWT callback - Token state:", { accessToken: token.accessToken, expiresAt: token.expiresAt });
      return token;
    },
    async session({ session, token }) {
      try {
        const dbUser = await getUserData(session.user.email);
        return {
          ...session,
          accessToken: token.accessToken,
          userData: dbUser ? {
            name: dbUser.name,
            email: dbUser.email,
            createdAt: dbUser.createdAt,
          } : null,
        };
      } catch (error) {
        console.error("Error in session callback:", error);
        return { ...session, accessToken: token.accessToken };
      }
    },
  },
};