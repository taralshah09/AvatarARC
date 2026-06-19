import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/callback/google_fit`,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.body.read",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
  });

  redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
