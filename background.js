// background.js

// List the cookie names you want to sync
const cookieNames = ["accessToken", "refreshToken"];

/**
 * Read a cookie from the providhy domain.
 * @param {string} cookieName - Name of the cookie to retrieve.
 * @param {function} callback - Callback function to handle the cookie value.
 */
function getCookieFromProvidhy(cookieName, callback) {
  chrome.cookies.get({
    url: "https://uat-tenant.providhy.com", // Source domain URL (adjust if necessary)
    name: cookieName
  }, (cookie) => {
    if (cookie) {
      console.log(`Found ${cookieName} on providhy.com:`, cookie.value);
      callback(cookie.value);
    } else {
      console.warn(`Cookie "${cookieName}" not found on providhy.com`);
      callback(null);
    }
  });
}

/**
 * Set a cookie for localhost.
 * @param {string} cookieName - Name of the cookie.
 * @param {string} cookieValue - The value of the cookie.
 */
function setCookieForLocalhost(cookieName, cookieValue) {
  // Ensure the URL matches your local environment.
  chrome.cookies.set({
    url: "http://localhost:3000", // Use "http://localhost:3000" if your local site runs on port 3000, for example.
    name: cookieName,
    value: cookieValue,
    domain: "localhost",  // Explicitly set the domain to "localhost"
    path: "/"
    // Optionally add an expirationDate (in seconds since UNIX epoch)
    // expirationDate: (Date.now() / 1000) + 3600  // Expires in 1 hour
  }, (cookie) => {
    if (chrome.runtime.lastError) {
      console.error(`Error setting cookie "${cookieName}" on localhost: ${chrome.runtime.lastError.message}`);
    } else {
      console.log(`Successfully set cookie "${cookieName}" on localhost:`, cookie);
    }
  });
}

/**
 * Sync the desired cookies from providhy.com to localhost.
 */
function syncCookiesToLocalhost() {
  cookieNames.forEach((cookieName) => {
    getCookieFromProvidhy(cookieName, (value) => {
      if (value) {
        setCookieForLocalhost(cookieName, value);
      }
    });
  });
}

// Trigger the synchronization when the extension is installed or updated.
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed/updated. Syncing cookies...");
  syncCookiesToLocalhost();
});

// Listen for any changes in cookies on the providhy.com domain and re-sync as needed.
chrome.cookies.onChanged.addListener((changeInfo) => {
  if (
    changeInfo.cookie &&
    changeInfo.cookie.domain.includes("providhy.com") &&
    cookieNames.includes(changeInfo.cookie.name)
  ) {
    console.log(`Cookie change detected for ${changeInfo.cookie.name} on providhy.com. Resyncing...`);
    setCookieForLocalhost(changeInfo.cookie.name, changeInfo.cookie.value);
  }
});

// Optional: Allow manual syncing when the user clicks on the extension icon.
chrome.action.onClicked.addListener(() => {
  console.log("Extension icon clicked. Syncing cookies...");
  syncCookiesToLocalhost();
});
