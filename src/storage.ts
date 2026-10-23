export type Mode = "assist" | "auto";

export interface Settings {
  enabled: boolean;
  mode: Mode;
  mock: boolean;
}

export const DEFAULT_SETTINGS: Settings = { enabled: false, mode: "assist", mock: true };

export async function getSettings(): Promise<Settings> {
  const { settings } = await chrome.storage.local.get("settings");
  return { ...DEFAULT_SETTINGS, ...(settings ?? {}) };
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const settings = { ...(await getSettings()), ...patch };
  await chrome.storage.local.set({ settings });
  return settings;
}

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time

// Count is stored with its date, so it resets automatically on a new day.
export async function getTodayCount(): Promise<number> {
  const { replyCount } = await chrome.storage.local.get("replyCount");
  return replyCount?.date === today() ? replyCount.count : 0;
}

export async function incrementTodayCount(): Promise<number> {
  const count = (await getTodayCount()) + 1;
  await chrome.storage.local.set({ replyCount: { date: today(), count } });
  return count;
}
