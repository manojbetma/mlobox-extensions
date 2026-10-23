// Content script for Facebook Marketplace / Messages.
// Classic script (not a module) — must not import anything.
// Step 2a: debug capture only.

const DROP_TAGS = "script, style, link, noscript, template";
const MAX_SRC = 500; // data: URIs can be huge

function keepAttr(el: Element, name: string): boolean {
  if (el.tagName === "IMG") return name === "src";
  return name === "aria-label" || name === "role" || name === "href" || name.startsWith("data-");
}

function captureDom(): string {
  const root = document.documentElement.cloneNode(true) as HTMLElement;
  root.querySelectorAll(DROP_TAGS).forEach((el) => el.remove());

  for (const el of [root, ...root.querySelectorAll("*")]) {
    for (const { name } of [...el.attributes]) {
      if (!keepAttr(el, name)) el.removeAttribute(name);
    }
    const src = el.getAttribute("src");
    if (el.tagName === "IMG" && src && src.length > MAX_SRC) {
      el.setAttribute("src", src.slice(0, MAX_SRC) + "…");
    }
  }

  const header = `<!-- MLOBOX capture\n url: ${location.href}\n at: ${new Date().toISOString()} -->\n`;
  return "<!doctype html>\n" + header + root.outerHTML;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "capture") sendResponse({ ok: true, html: captureDom(), url: location.href });
});
