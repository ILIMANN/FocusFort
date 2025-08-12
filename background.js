console.log("Porn Limiter Extension started!");

let blockedDomains = [];
let blockingEnabled = true;

// Load initial data
function loadSettings() {
  return browser.storage.local
    .get(["blockedDomains", "blockingEnabled"])
    .then((result) => {
      blockedDomains = result.blockedDomains || [];
      blockingEnabled =
        typeof result.blockingEnabled === "undefined"
          ? true
          : result.blockingEnabled;
      console.log("Loaded settings:", { blockedDomains, blockingEnabled });
    });
}

// Initial load
loadSettings();

// Listen for changes (e.g. from popup toggle or options)
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    if (changes.blockedDomains) {
      blockedDomains = changes.blockedDomains.newValue || [];
      console.log("Updated blocked domains:", blockedDomains);
    }
    if (changes.blockingEnabled) {
      blockingEnabled = changes.blockingEnabled.newValue;
      console.log("Blocking enabled:", blockingEnabled);
    }
  }
});

browser.runtime.onMessage.addListener((message) => {
  if (message.type === "updateBlockedDomains") {
    blockedDomains = message.blockedDomains || [];
    console.log("Blocked domains updated:", blockedDomains);
  } else if (message.type === "toggleBlocking") {
    blockingEnabled = message.enabled;
    console.log("Blocking enabled set to:", blockingEnabled);
  }
});

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!blockingEnabled) {
      return; // Blocking is off, allow all requests
    }

    try {
      const urlObj = new URL(details.url);
      const domain = urlObj.hostname.toLowerCase();

      const isBlocked = blockedDomains.some(
        (blockedDomain) =>
          domain === blockedDomain || domain.endsWith("." + blockedDomain)
      );

      if (isBlocked) {
        console.log("Redirecting blocked site:", details.url);
        const redirectUrl = browser.runtime.getURL("blocked.html");
        return { redirectUrl };
      }
    } catch (e) {
      console.error("Invalid URL:", details.url);
    }
  },
  { urls: ["<all_urls>"], types: ["main_frame"] },
  ["blocking"]
);
