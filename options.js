const domainInput = document.getElementById("domainInput");
const addBtn = document.getElementById("addBtn");
const blockedList = document.getElementById("blockedList");

function renderList(domains) {
  blockedList.innerHTML = "";
  domains.forEach((domain) => {
    const li = document.createElement("li");
    li.textContent = domain;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      removeDomain(domain);
    });

    li.appendChild(removeBtn);
    blockedList.appendChild(li);
  });
}

function saveDomains(domains) {
  browser.storage.local.set({ blockedDomains: domains });
}

function loadDomains() {
  return browser.storage.local
    .get("blockedDomains")
    .then((result) => result.blockedDomains || []);
}

function addDomain(domain) {
  domain = domain.trim().toLowerCase();
  if (!domain) return;

  loadDomains().then((domains) => {
    if (!domains.includes(domain)) {
      domains.push(domain);
      saveDomains(domains);
      renderList(domains);
      domainInput.value = "";
    } else {
      alert("Domain already in blocklist");
    }
  });
}

function removeDomain(domain) {
  loadDomains().then((domains) => {
    const filtered = domains.filter((d) => d !== domain);
    saveDomains(filtered);
    renderList(filtered);
  });
}

// Initial load
loadDomains().then(renderList);

// Event listeners
addBtn.addEventListener("click", () => {
  addDomain(domainInput.value);
});

domainInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    addDomain(domainInput.value);
  }
});
