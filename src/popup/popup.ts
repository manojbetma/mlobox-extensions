import { getSession } from "../session";
import { getSettings, getTodayCount, saveSettings, type Mode } from "../storage";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

async function init() {
  const session = await getSession();
  if (!session?.access_token) {
    $("logged-out").hidden = false;
    return;
  }

  $("logged-in").hidden = false;
  $("user-name").textContent = session.name ?? "Logged in";
  $("user-email").textContent = session.email ?? "";

  const settings = await getSettings();
  const enabled = $<HTMLInputElement>("enabled");
  const mock = $<HTMLInputElement>("mock");
  const modeInputs = document.querySelectorAll<HTMLInputElement>('input[name="mode"]');

  enabled.checked = settings.enabled;
  mock.checked = settings.mock;
  modeInputs.forEach((el) => (el.checked = el.value === settings.mode));
  $("count").textContent = String(await getTodayCount());

  enabled.addEventListener("change", () => saveSettings({ enabled: enabled.checked }));
  const debug = $("debug");
  debug.hidden = !mock.checked;
  mock.addEventListener("change", () => {
    debug.hidden = !mock.checked;
    saveSettings({ mock: mock.checked });
  });
  $("capture").addEventListener("click", capturePage);
  modeInputs.forEach((el) =>
    el.addEventListener("change", () => el.checked && saveSettings({ mode: el.value as Mode })),
  );

  // Keep the count live while the popup is open.
  chrome.storage.onChanged.addListener(async (changes) => {
    if (changes.replyCount) $("count").textContent = String(await getTodayCount());
  });
}

const FB_PAGE = /^https:\/\/www\.facebook\.com\/(marketplace|messages)\//;

// Ask the content script in the active Facebook tab for a cleaned DOM and download it.
async function capturePage() {
  const status = $("capture-status");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !FB_PAGE.test(tab.url ?? "")) {
    status.textContent = "Open a facebook.com/marketplace or /messages tab first.";
    return;
  }

  let res: { ok: boolean; html: string } | undefined;
  try {
    res = await chrome.tabs.sendMessage(tab.id, { type: "capture" });
  } catch {
    // Content script not injected: tab was opened before the extension loaded,
    // or Facebook navigated here without a full page load.
  }
  if (!res?.ok) {
    status.textContent = "Couldn't reach the page. Reload the Facebook tab and try again.";
    return;
  }

  const url = URL.createObjectURL(new Blob([res.html], { type: "text/html" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `fb-capture-${Date.now()}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  status.textContent = `Saved ${a.download} (${Math.round(res.html.length / 1024)} KB)`;
}

init();
