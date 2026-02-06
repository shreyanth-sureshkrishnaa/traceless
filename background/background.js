// Global tracker data - persists across navigations
let trackerList = [];
let trackerData = {}; // { domain: { count: 0, types: {}, firstSeen: timestamp } }
let currentTabId = null;

// Load tracker list on startup
function loadTrackerList() {
    fetch(browser.runtime.getURL("data/trackers.json"))
        .then(response => response.json())
        .then(data => {
            trackerList = data;
            console.log("Tracker list loaded:", trackerList.length, "trackers");
        })
        .catch(err => console.error("Failed to load tracker list:", err));
}

loadTrackerList();

// Helper function to check if a domain matches any tracker
function isTracker(domain) {
    return trackerList.some(tracker => {
        // Match exact domain or subdomain
        return domain === tracker || domain.endsWith('.' + tracker);
    });
}

// Listen to all web requests
browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        try {
            // Ignore requests from the extension itself
            if (details.tabId === -1) return;

            const url = new URL(details.url);
            const domain = url.hostname;

            // Skip extension pages
            if (url.protocol === 'moz-extension:' || url.protocol === 'chrome-extension:') {
                return;
            }

            // Check if domain matches any known tracker
            if (isTracker(domain)) {
                // Initialize tracker entry if first time
                if (!trackerData[domain]) {
                    trackerData[domain] = {
                        count: 0,
                        types: {},
                        firstSeen: Date.now()
                    };
                }

                // Increment counters
                trackerData[domain].count += 1;
                trackerData[domain].types[details.type] =
                    (trackerData[domain].types[details.type] || 0) + 1;

                // Update badge with total tracker count
                updateBadge();

                console.log("Tracker detected:", domain, "Total:", Object.keys(trackerData).length);
            }
        } catch (e) {
            console.error("Error processing URL:", details.url, e);
        }
    },
    { urls: ["<all_urls>"] }
);

// Update badge to show number of unique trackers detected
function updateBadge() {
    const trackerCount = Object.keys(trackerData).length;
    if (trackerCount > 0) {
        browser.browserAction.setBadgeText({
            text: trackerCount.toString()
        });
        browser.browserAction.setBadgeBackgroundColor({
            color: "#ff3333"
        });
    } else {
        browser.browserAction.setBadgeText({ text: "" });
    }
}

// Track active tab changes
browser.tabs.onActivated.addListener((activeInfo) => {
    currentTabId = activeInfo.tabId;
    updateBadge();
});

// Listen for messages from popup and other pages
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received:", message.type, "Data count:", Object.keys(trackerData).length);

    if (message.type === "getTrackerData") {
        const response = {
            trackerData: JSON.parse(JSON.stringify(trackerData)), // Deep copy
            totalTrackers: Object.keys(trackerData).length,
            totalRequests: Object.values(trackerData).reduce((sum, t) => sum + t.count, 0)
        };
        console.log("Sending tracker data:", response.totalTrackers, "trackers");
        return Promise.resolve(response);
    } else if (message.type === "clearData") {
        trackerData = {};
        updateBadge();
        return Promise.resolve({ success: true });
    }
});

// Initialize badge on startup
updateBadge();

console.log("Traceless background script loaded");
