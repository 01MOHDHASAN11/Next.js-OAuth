import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions.js";
import User from "@/app/models/User";
import { connectToDatabase } from "@/lib/db";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { content, title } = await req.json();
    if (!content || !title) {
      return new Response(JSON.stringify({ error: "Content and title are required" }), { status: 400 });
    }

    await connectToDatabase();
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });
    const drive = google.drive({ version: "v3", auth });

    const fileMetadata = {
      name: title,
      mimeType: "application/vnd.google-apps.document",
    };
    const media = {
      mimeType: "text/plain",
      body: content,
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, name",
    });

    const user = await User.findOneAndUpdate(
      { email: session.user.email, "drafts.draft": content },
      { $set: { "drafts.$.fileId": file.data.id } },
      { new: true }
    );

    return new Response(
      JSON.stringify({ message: "File saved successfully", fileId: file.data.id }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving to Google Drive:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to save to Google Drive" }),
      { status: 500 }
    );
  }
}