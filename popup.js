// popup.js

document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("toggle-extension");
    const syncButton = document.getElementById("sync-cookies");
    const fromDomainInput = document.getElementById("from-domain");
    const toDomainInput = document.getElementById("to-domain");
    const toast = document.getElementById("toast");
  
    // Helper function to display toast messages
    function showToast(message, duration = 2000) {
      toast.textContent = message;
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, duration);
    }
  
    // Retrieve extension enabled state from Chrome storage.
    chrome.storage.sync.get(["extensionEnabled"], (result) => {
      // Default to true if not set.
      toggle.checked = (result.extensionEnabled === undefined) ? true : result.extensionEnabled;
    });
  
    // Store the toggle state.
    toggle.addEventListener("change", () => {
      chrome.storage.sync.set({ extensionEnabled: toggle.checked });
      console.log("Extension enabled:", toggle.checked);
    });
  
    // On Sync button click, send a message with the domain configuration.
    syncButton.addEventListener("click", () => {
      const data = {
        fromDomain: fromDomainInput.value.trim(),
        toDomain: toDomainInput.value.trim()
      };
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
  