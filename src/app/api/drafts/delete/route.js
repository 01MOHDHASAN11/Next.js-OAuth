import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions.js";
import User from "@/app/models/User";
import { connectToDatabase } from "@/lib/db";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    if (!session || !session.user || !session.user.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { draft } = await req.json();
    console.log("Draft to delete:", draft);
    if (!draft || typeof draft !== "string" || !draft.trim()) {
      return new Response(JSON.stringify({ error: "Invalid draft content" }), { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $pull: { drafts: { draft } } },
      { new: true }
    );
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    console.log("Updated user drafts:", user.drafts);

    return new Response(
      JSON.stringify({ message: "Draft deleted successfully", drafts: user.drafts }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting draft:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}