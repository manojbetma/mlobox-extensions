# MLOBOX AI for Marketplace (Chrome extension)

Chrome MV3 extension, TypeScript + Vite. **Step 1:** skeleton + login only (no Facebook code yet).

## Build

Requires Node 18+.

```bash
npm install
npm run build      # outputs to dist/
npm run dev        # rebuilds dist/ on file changes
```

## Load in Chrome

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** and select the `dist/` folder
4. Pin the extension and click its icon to open the popup

After rebuilding, click the reload icon on the extension card in `chrome://extensions`.

## Login

The extension doesn't have its own login. It reads cookies on `*.mlobox.ai`:

1. `activeProfile` — used if it contains `access_token`
2. otherwise `userData`

If neither cookie is there, the popup shows "Log in to app.mlobox.ai first" with a link.

## Settings (`chrome.storage.local`)

| key          | value                                               |
|--------------|-----------------------------------------------------|
| `settings`   | `{ enabled, mode: "assist" \| "auto", mock }`       |
| `replyCount` | `{ date: "YYYY-MM-DD", count }`, resets each day    |

`mock` is **on by default**. While it's on, `callReply()` returns
`{ reply: "Test reply", delay_ms: 3000 }` and doesn't call the API.
Turn it off with the "Mock API" toggle in the popup.

## Calling the API

`src/background.ts` → `callReply(payload)` sends a POST to `https://api.mlobox.ai/fbm-reply`
with the headers `x-mlobox-token` and `x-mlobox-hash`. Other extension pages can call it with:

```ts
chrome.runtime.sendMessage({ type: "callReply", payload: { ... } });
// → { ok: true, data: { reply, delay_ms } } | { ok: false, error }
```
