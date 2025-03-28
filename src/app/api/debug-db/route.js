import { connectToDatabase } from "@/lib/db";

export async function GET(req) {
  try {
    await connectToDatabase();
    return new Response(JSON.stringify({ message: "Database connected" }), { status: 200 });
  } catch (error) {
    console.error("Error connecting to DB:", error);
    return new Response(JSON.stringify({ error: "Failed to connect" }), { status: 500 });
  }
}