import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions.js";
import User from "@/app/models/User";
import { connectToDatabase } from "@/lib/db";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    if (!session || !session.user || !session.user.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { draft } = await req.json();
    console.log("Received draft:", draft);
    if (!draft || typeof draft !== "string" || !draft.trim()) {
      return new Response(JSON.stringify({ error: "Draft cannot be empty" }), {
        status: 400,
      });
    }

    await connectToDatabase();
    console.log("Database connected");

    const draftObject = {
      draft: draft,
      createdAt: new Date(), 
    };

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $push: { drafts: draftObject } },
      { new: true, runValidators: true }
    );

    console.log("User after update:", user);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Draft saved successfully", drafts: user.drafts }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving draft:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}