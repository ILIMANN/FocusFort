const domainInput = document.getElementById("domainInput");
const addBtn = document.getElementById("addBtn");
const blockedListEl = document.getElementById("blockedList");
let blockedDomainsO = [];

async function LoadBlockedList() {
	try {
		const result = await browser.storage.sync.get("blockedDomains");
		blockedDomainsO = result.blockedDomains || [];

		console.log("(options page) loaded blockedList", blockedDomainsO);

		blockedListEl.innerHTML = "";

		blockedDomainsO.forEach((domain) => {
			const li = document.createElement("li");
			li.textContent = domain;
			blockedListEl.appendChild(li);
		});
	} catch (error) {
		console.error("(options page) Error loading blocked domains:", error);
	}
}

async function SetBlockedList(typedDomain) {
	try {
		const result = await browser.storage.sync.get("blockedDomains");
		blockedDomainsO = result.blockedDomains || [];

		blockedDomainsO.push(typedDomain);
		await browser.storage.sync.set({ blockedDomains: blockedDomainsO });
	} catch (error) {
		console.log("(options page) Error setting blocked domains: ", error);
	}
}

LoadBlockedList();

browser.storage.onChanged.addListener((changes, area) => {
	if (area === "sync" && changes.blockedDomains) {
		LoadBlockedList();
	}
});

addBtn.addEventListener("click", () => {
	const typedDomain = domainInput.value.trim();
	console.log("user typed: ", typedDomain);
	SetBlockedList(typedDomain);
});
