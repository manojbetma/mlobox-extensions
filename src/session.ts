// Mirrors app-mlobox/src/Utils/session.ts (getSession) — keep in sync.
// The app writes these cookies with js-cookie via setSharedCookie()
// (app-mlobox/src/Utils/hosts.ts): domain ".mlobox.ai", path "/", value = JSON.stringify(data).

export type SessionData = {
  access_token?: any;
  user_id?: any;
  domain_id?: any;
  email?: any;
  name?: any;
  [key: string]: any;
};

export type ActiveProfileSession = SessionData & {
  acting_as_member_id?: string | number;
  team_member_id?: string | number;
  permissions?: Record<string, { can_view?: boolean; can_edit?: boolean }>;
};

export const OWN_SESSION_COOKIE = "userData";
export const ACTIVE_PROFILE_COOKIE = "activeProfile";

// Cookies on ".mlobox.ai" are visible here; reading as app.mlobox.ai matches what the app sees.
const COOKIE_URL = "https://app.mlobox.ai/";

// Same decoding as js-cookie v3's default converter.read().
function jsCookieRead(value: string): string {
  if (value[0] === '"') value = value.slice(1, -1);
  return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
}

async function readCookieJson<T>(name: string): Promise<T | null> {
  try {
    const cookie = await chrome.cookies.get({ url: COOKIE_URL, name });
    return JSON.parse(cookie ? jsCookieRead(cookie.value) : "null") as T;
  } catch {
    return null;
  }
}

export const getOwnSession = (): Promise<SessionData | null> =>
  readCookieJson<SessionData>(OWN_SESSION_COOKIE);

export const getActiveProfile = async (): Promise<ActiveProfileSession | null> => {
  const active = await readCookieJson<ActiveProfileSession>(ACTIVE_PROFILE_COOKIE);
  return active?.access_token ? active : null;
};

export const getSession = async (): Promise<SessionData | null> =>
  (await getActiveProfile()) ?? (await getOwnSession());
