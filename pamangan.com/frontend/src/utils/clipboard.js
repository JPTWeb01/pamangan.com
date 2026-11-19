// Copy text to the clipboard. Uses the async Clipboard API when available, with a
// timeout (some browsers leave the promise pending) and an execCommand fallback.
const CLIPBOARD_TIMEOUT_MS = 1200;

export function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    const timeout = new Promise((resolve) => setTimeout(() => resolve("timeout"), CLIPBOARD_TIMEOUT_MS));
    return Promise.race([navigator.clipboard.writeText(text).then(() => true), timeout])
      .then((res) => (res === true ? true : fallbackCopy(text)))
      .catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
