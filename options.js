/// <reference types="firefox-webext-browser" />

const domainInput = document.getElementById("domainInput");
const addBtn = document.getElementById("addBtn");
const blockedListEl = document.getElementById("blockedList");
const emptyStateEl = document.getElementById("emptyState");

// Renders the list of blocked domains from storage
async function renderBlockedList() {
	try {
		const result = await browser.storage.sync.get("blockedDomains");
		const blockedDomains = result.blockedDomains || [];

		blockedListEl.innerHTML = ""; // Clear current list before re-rendering

		// Show empty state message if no domains are blocked
		if (blockedDomains.length === 0) {
			emptyStateEl.style.display = "block";
		} else {
			emptyStateEl.style.display = "none";
			blockedDomains.forEach((domain) => {
				const li = document.createElement("li");
				li.className = "blocked-item";
				li.dataset.domain = domain; // Store domain in a data attribute for easy access

				const domainText = document.createElement("span");
				domainText.textContent = domain;

				const removeBtn = document.createElement("button");
				removeBtn.className = "remove-btn";
				removeBtn.title = `Remove ${domain}`;
				// Inline SVG for the 'X' icon
				removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;

				li.appendChild(domainText);
				li.appendChild(removeBtn);
				blockedListEl.appendChild(li);
			});
		}
	} catch (error) {
		console.error("Error rendering blocked domains:", error);
	}
}

// Adds a new domain to the blocked list
async function addDomain() {
	const domain = domainInput.value.trim().toLowerCase();

	if (!domain) return; // Do nothing if input is empty

	// Basic validation for domain format
	if (!/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/.test(domain)) {
		alert("Please enter a valid domain format (e.g., example.com)");
		return;
	}

	try {
		const result = await browser.storage.sync.get("blockedDomains");
		let blockedDomains = result.blockedDomains || [];

		if (blockedDomains.includes(domain)) {
			console.log("Domain is already blocked:", domain);
			domainInput.value = ""; // Clear input even if it's a duplicate
			return;
		}

		blockedDomains.push(domain);
		await browser.storage.sync.set({ blockedDomains: blockedDomains });
		domainInput.value = ""; // Clear input field after successful add
	} catch (error) {
		console.error("Error adding domain:", error);
	}
}

// Removes a domain from the blocked list
async function removeDomain(domainToRemove) {
	try {
		const result = await browser.storage.sync.get("blockedDomains");
		let blockedDomains = result.blockedDomains || [];

		const updatedDomains = blockedDomains.filter((d) => d !== domainToRemove);

		await browser.storage.sync.set({ blockedDomains: updatedDomains });
	} catch (error) {
		console.error("Error removing domain:", error);
	}
}

// --- Event Listeners ---

// Listen for storage changes to auto-update the list
browser.storage.onChanged.addListener((changes, area) => {
	if (area === "sync" && changes.blockedDomains) {
		renderBlockedList();
	}
});

// Add domain when the 'Add' button is clicked
addBtn.addEventListener("click", addDomain);

// Also add domain when 'Enter' is pressed in the input field
domainInput.addEventListener("keypress", (event) => {
	if (event.key === "Enter") {
		addDomain();
	}
});

// Use event delegation to handle clicks on all 'remove' buttons
blockedListEl.addEventListener("click", (event) => {
	const removeBtn = event.target.closest(".remove-btn");
	if (removeBtn) {
		const itemToRemove = removeBtn.closest(".blocked-item");
		if (itemToRemove && itemToRemove.dataset.domain) {
			removeDomain(itemToRemove.dataset.domain);
		}
	}
});

// Initial render when the page loads
renderBlockedList();