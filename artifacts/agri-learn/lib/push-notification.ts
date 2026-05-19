import { supabase } from "@/lib/supabase";

export async function sendPushToUser(
  recipientId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("expo_push_token")
      .eq("id", recipientId)
      .single();

    const token: string | undefined = (profile as any)?.expo_push_token;
    if (!token) return;

    if (!token.startsWith("ExponentPushToken[") && !token.startsWith("ExpoPushToken[")) return;

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        sound: "default",
        title,
        body,
        data: data ?? {},
        channelId: "offers",
      }),
    });
  } catch {
    // Push notifications are best-effort — never block the main action
  }
}
