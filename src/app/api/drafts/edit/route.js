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

    const { oldDraft, newDraft } = await req.json();
    console.log("Edit request:", { oldDraft, newDraft });
    if (!oldDraft || !newDraft || typeof oldDraft !== "string" || typeof newDraft !== "string" || !newDraft.trim()) {
      return new Response(JSON.stringify({ error: "Invalid draft content" }), { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOneAndUpdate(
      { email: session.user.email, "drafts.draft": oldDraft },
      { $set: { "drafts.$.draft": newDraft } },
      { new: true, runValidators: true }
    );
    if (!user) {
      return new Response(JSON.stringify({ error: "User or draft not found" }), { status: 404 });
    }

    console.log("Updated user drafts:", user.drafts);

    return new Response(
      JSON.stringify({ message: "Draft updated successfully", drafts: user.drafts }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error editing draft:", error);
    return new Response(
      JSON.stringify({ error: "Failed to edit draft" }),
      { status: 500 }
    );
  }
}