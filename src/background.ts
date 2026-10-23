import { getSession } from "./session";
import { getSettings, incrementTodayCount } from "./storage";

const API_URL = "https://api.mlobox.ai/fbm-reply";

export interface ReplyResponse {
  reply: string;
  delay_ms: number;
}

export async function callReply(payload: unknown): Promise<ReplyResponse> {
  const settings = await getSettings();

  if (settings.mock) {
    await incrementTodayCount();
    return { reply: "Test reply", delay_ms: 3000 };
  }

  const session = await getSession();
  if (!session?.access_token) throw new Error("Not logged in to app.mlobox.ai");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-mlobox-token": String(session.access_token),
      "x-mlobox-hash": String(session.user_id),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`fbm-reply failed: ${res.status}`);

  const data = (await res.json()) as ReplyResponse;
  await incrementTodayCount();
  return data;
}

// Message bridge so the popup (and later the content script) can call callReply.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "callReply") {
    callReply(msg.payload)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, error: String(err?.message ?? err) }));
    return true; // async response
  }
});
