/// <reference types="firefox-webext-browser" />

console.log("Focus Fort has started!");

const redirectUrl = browser.runtime.getURL("blocked.html");

let isEnabledB = false;
browser.storage.local.get("powerStatus").then((result) => {
	if (result.powerStatus === undefined) {
		browser.storage.local.set({ powerStatus: false });
	}
	isEnabledB = result.powerStatus;
	console.log("(start point) isEnabled: ", isEnabledB);
});

let blockedDomainsB = [];
browser.storage.sync.get("blockedDomains").then((result) => {
	if (result.blockedDomains === undefined) {
		browser.storage.sync.set({ blockedDomains: [] });
	}
	blockedDomainsB = result.blockedDomains || [];
	console.log("(start point) blockedDomains: ", blockedDomainsB);
});

browser.storage.onChanged.addListener((changes, area) => {
	if (area === "local" && changes.powerStatus) {
		isEnabledB = changes.powerStatus.newValue;
		console.log("(onChange) isEnabled: ", isEnabledB);
	}

	if (area === "sync" && changes.blockedDomains) {
		blockedDomainsB = changes.blockedDomains.newValue || [];
		console.log("(onChange) blockedDomains: ", blockedDomainsB);
	}
});

browser.webRequest.onBeforeRequest.addListener(
	(details) => {
		if (!isEnabledB || blockedDomainsB.length === 0) return;

		try {
			const urlObj = new URL(details.url);
			const domain = urlObj.hostname.toLowerCase();

			console.log("Request: ", domain);

			const isBlocked = blockedDomainsB.some(
				(blockedDomain) => domain === blockedDomain
			);

			console.log("isBlocked: ", isBlocked);

			if (isBlocked) {
				return { redirectUrl };
			}
		} catch (error) {
			console.error("Invalid URL:", details.url);
		}
	},
	{ urls: ["<all_urls>"], types: ["main_frame"] },
	["blocking"]
);

browser.commands.onCommand.addListener((cmd) => {
	if (cmd === "block-current-site") {
		console.log("Blocked current site via shortcut!");
		browser.runtime.sendMessage({ action: "block-current-site" });
	}
});
