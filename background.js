// background.js

// List the cookie names you want to sync.
const cookieNames = ["accessToken", "refreshToken", "lastInteraction"];

/**
 * Read a cookie from the given source domain.
 * @param {string} domainUrl - The source domain URL.
 * @param {string} cookieName - Name of the cookie to retrieve.
 * @param {function} callback - Callback function to handle the cookie value.
 */
function getCookieFromDomain(domainUrl, cookieName, callback) {
  chrome.cookies.get({
    url: domainUrl, // Source domain URL (from user input)
    name: cookieName
  }, (cookie) => {
    if (cookie) {
      console.log(`Found ${cookieName} on ${domainUrl}:`, cookie.value);
      callback(cookie.value);
    } else {
      console.warn(`Cookie "${cookieName}" not found on ${domainUrl}`);
      callback(null);
    }
  });
}

/**
 * Set a cookie for the destination domain.
 * @param {string} toDomainUrl - The destination domain URL.
 * @param {string} cookieName - Name of the cookie.
 * @param {string} cookieValue - The value of the cookie.
 */
function setCookieForDomain(toDomainUrl, cookieName, cookieValue) {
  chrome.cookies.set({
    url: toDomainUrl, // Destination domain URL (from user input, e.g., http://localhost:3000)
    name: cookieName,
    value: cookieValue,
    domain: "localhost", // Ensure the domain is explicitly set if necessary (adjust if needed)
    path: "/"
    // Optionally add an expirationDate if required.
  }, (cookie) => {
    if (chrome.runtime.lastError) {
      console.error(`Error setting cookie "${cookieName}" on ${toDomainUrl}: ${chrome.runtime.lastError.message}`);
    } else {
      console.log(`Successfully set cookie "${cookieName}" on ${toDomainUrl}:`, cookie);
    }
  });
}

/**
 * Sync the desired cookies from one domain to another.
 * @param {string} fromDomain - URL of the source domain.
 * @param {string} toDomain - URL of the destination domain.
 */
function syncCookiesToDomain(fromDomain, toDomain) {
  cookieNames.forEach((cookieName) => {
    getCookieFromDomain(fromDomain, cookieName, (value) => {
      if (value) {
        setCookieForDomain(toDomain, cookieName, value);
      }
    });
  });
}

// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "syncCookies") {
    // Check if the extension is enabled.
    chrome.storage.sync.get(["extensionEnabled"], (result) => {
      if (result.extensionEnabled === false) {
        console.log("Extension is disabled; no sync performed.");
        sendResponse({ success: false, message: "Extension disabled." });
        return;
      }
      
      const { fromDomain, toDomain } = request.data;
      console.log("Starting cookie sync...", fromDomain, toDomain);
      syncCookiesToDomain(fromDomain, toDomain);
      sendResponse({ success: true, message: "Cookie sync initiated." });
    });
    // Return true to indicate the response will be sent asynchronously.
    return true;
  }
});
