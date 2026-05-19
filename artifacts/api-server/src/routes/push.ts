import { Router } from "express";

const router = Router();

router.post("/push", async (req, res) => {
  const { token, title, body, data } = req.body ?? {};

  if (!token || !title || !body) {
    res.status(400).json({ error: "token, title, and body are required" });
    return;
  }

  if (!token.startsWith("ExponentPushToken[") && !token.startsWith("ExpoPushToken[")) {
    res.status(400).json({ error: "Invalid push token format" });
    return;
  }

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
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

    const result = await response.json();
    res.json({ sent: true, result });
  } catch (err: any) {
    console.error("[push] Failed to send notification:", err);
    res.status(500).json({ sent: false, error: err?.message ?? "Failed to send push notification" });
  }
});

export default router;
