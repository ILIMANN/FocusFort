document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleBlocking");
  const openBtn = document.getElementById("openOptions");
  const blockBtn = document.getElementById("blockCurrentSite");

  // Load blocking state
  browser.storage.local
    .get(["blockingEnabled", "blockedDomains"])
    .then((result) => {
      toggle.checked =
        typeof result.blockingEnabled === "undefined"
          ? true
          : result.blockingEnabled;
      // Initialize blockedDomains if not present
      if (!Array.isArray(result.blockedDomains)) {
        browser.storage.local.set({ blockedDomains: [] });
      }
    });

  // Save toggle changes
  toggle.addEventListener("change", () => {
    browser.storage.local.set({ blockingEnabled: toggle.checked });
    browser.runtime.sendMessage({
      type: "toggleBlocking",
      enabled: toggle.checked,
    });
  });

  // Open options page
  openBtn.addEventListener("click", () => {
    browser.runtime.openOptionsPage();
  });

  const messageDiv = document.getElementById("message");

  function showMessage(text) {
    messageDiv.textContent = text;
    setTimeout(() => {
      messageDiv.textContent = "";
    }, 3000);
  }
  // Block current site button handler
  blockBtn.addEventListener("click", async () => {
    try {
      // Get current active tab
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length === 0) return;
      const currentUrl = tabs[0].url;
      const urlObj = new URL(currentUrl);
      const domain = urlObj.hostname.toLowerCase();

      // Get current blocked domains
      const { blockedDomains = [] } = await browser.storage.local.get(
        "blockedDomains"
      );

      // If domain not already blocked, add it
      if (!blockedDomains.includes(domain)) {
        blockedDomains.push(domain);
        await browser.storage.local.set({ blockedDomains });
        // alert(`Blocked site: ${domain}`);
        console.log(`Blocked site: ${domain}`);
        showMessage(`Blocked site: ${domain}`);
        // Optionally, notify background script to update list
        browser.runtime.sendMessage({
          type: "updateBlockedDomains",
          blockedDomains,
        });
      } else {
        //alert(`${domain} is already blocked.`);
        console.log(`${domain} is already blocked.`);
        showMessage(`${domain} is already blocked.`);
      }
    } catch (e) {
      console.error("Error blocking current site:", e);
    }
  });
});
