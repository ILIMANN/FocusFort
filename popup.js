/// <reference types="firefox-webext-browser" />

const powerToggle = document.getElementById("powerToggle");
const blockBtn = document.getElementById("blockBtn");
const clearBtn = document.getElementById("clearBtn");
const optionsBtn = document.getElementById("optionsBtn");

const redirectUrl = browser.runtime.getURL("blocked.html");
let isEnabledP;

function UpdatePowerButton() {
	powerToggle.checked = isEnabledP;
	blockBtn.disabled = !isEnabledP;
}

browser.storage.local.get("powerStatus").then((result) => {
	if (result.powerStatus !== undefined) {
		isEnabledP = result.powerStatus;
	}

	UpdatePowerButton();
});

powerToggle.addEventListener("change", () => {
	isEnabledP = powerToggle.checked;

	console.log("power switch changed");

	UpdatePowerButton();

	browser.storage.local.set({ powerStatus: isEnabledP });
});

async function GetActiveTabUrl() {
	let [tab] = await browser.tabs.query({ active: true, currentWindow: true });
	if (tab && tab.url && tab.url.startsWith("http")) {
		let urlObj = new URL(tab.url);
		return urlObj.hostname.toLowerCase();
	}
	console.error("There is no tab available!");
	return null;
}

async function BlockThisPage(hostname) {
	let result = await browser.storage.sync.get("blockedDomains");
	let blockedList = result.blockedDomains || [];

	if (!blockedList.includes(hostname)) {
		blockedList.push(hostname);

		await browser.storage.sync.set({ blockedDomains: blockedList });
	} else {
		console.error("Hostname already blocked:", hostname);
	}
}

async function RedirectCurrentTab() {
	const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
	if (!tab || !tab.id) return;

	await browser.tabs.update(tab.id, { url: redirectUrl });
}

blockBtn.addEventListener("click", () => {
	console.log("block button clicked");

	if (isEnabledP) {
		GetActiveTabUrl().then((hostname) => {
			if (!hostname) return;

			BlockThisPage(hostname);
			RedirectCurrentTab();
		});
	}
});

browser.runtime.onMessage.addListener((data, sender) => {
	if (data.action === "block-current-site") {
		if (isEnabledP) {
			GetActiveTabUrl().then((hostname) => {
				if (!hostname) return;

				BlockThisPage(hostname);
				RedirectCurrentTab();
			});
		}
	}
});

async function ClearBlockedList() {
	let emptyBlockedList = [];

	await browser.storage.sync.set({ blockedDomains: emptyBlockedList });
}

clearBtn.addEventListener("click", () => {
	console.log("clear button clicked");
	ClearBlockedList();
});

optionsBtn.addEventListener("click", () => {
	console.log("options button clicked");
	browser.runtime.openOptionsPage();
	window.close();
});
