document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("toggle-extension");
  const syncButton = document.getElementById("sync-cookies");
  const fromDomainInput = document.getElementById("from-domain");
  const toDomainInput = document.getElementById("to-domain");
  const toast = document.getElementById("toast");

  // Helper function to display toast messages
  function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, duration);
  }

  // Retrieve persisted configuration (extension state and domain fields) from storage.
  chrome.storage.sync.get(["extensionEnabled", "fromDomain", "toDomain"], (result) => {
    // Default the extension toggle to true if not set.
    toggle.checked = (result.extensionEnabled === undefined) ? true : result.extensionEnabled;
    // Prefill input fields with persisted values or use defaults.
    fromDomainInput.value = result.fromDomain || "https://uat-tenant.providhy.com";
    toDomainInput.value = result.toDomain || "http://localhost:3000";
  });

  // Store the toggle state when it changes.
  toggle.addEventListener("change", () => {
    chrome.storage.sync.set({ extensionEnabled: toggle.checked });
    console.log("Extension enabled:", toggle.checked);
  });

  // On Sync button click, update the persisted configuration and perform the sync.
  syncButton.addEventListener("click", () => {
    const fromDomain = fromDomainInput.value.trim();
    const toDomain = toDomainInput.value.trim();

    // Save the latest domain values into Chrome storage.
    chrome.storage.sync.set({
      fromDomain: fromDomain,
      toDomain: toDomain,
    }, () => {
      console.log("Domain configuration saved.");
    });

    const data = { fromDomain, toDomain };
    chrome.runtime.sendMessage({ action: "syncCookies", data: data }, (response) => {
      console.log("Sync response:", response);
      if (response && response.success) {
        showToast("Cookie sync initiated!");
      } else {
        showToast("Sync failed or extension is disabled.");
      }
    });
  });
});
