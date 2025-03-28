import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions.js";
import User from "@/app/models/User";
import { connectToDatabase } from "@/lib/db";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const drafts = (user.drafts || []).filter(
      (draft) => draft?.draft && typeof draft.draft === "string" && draft.draft.trim() !== ""
    );

    console.log("User drafts:", user.drafts);
    console.log("Filtered drafts:", drafts);

    return new Response(JSON.stringify({ drafts }), { status: 200 });
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch drafts" }), { status: 500 });
  }
}