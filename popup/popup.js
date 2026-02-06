const trackerCountEl = document.getElementById("trackerCount");
const requestCountEl = document.getElementById("requestCount");
const trackerListEl = document.getElementById("trackerList");
const emptyStateEl = document.getElementById("emptyState");
const clearBtn = document.getElementById("clearBtn");
const refreshBtn = document.getElementById("refreshBtn");

// Format request type for display
function formatRequestType(type) {
    const typeMap = {
        'main_frame': 'Page',
        'sub_frame': 'Frame',
        'stylesheet': 'CSS',
        'script': 'Script',
        'image': 'Image',
        'font': 'Font',
        'object': 'Object',
        'xmlhttprequest': 'XHR',
        'ping': 'Ping',
        'media': 'Media',
        'websocket': 'WebSocket',
        'other': 'Other'
    };
    return typeMap[type] || type;
}

// Render tracker data
function renderTrackers(data) {
    // Update stats
    trackerCountEl.textContent = data.totalTrackers || 0;
    requestCountEl.textContent = data.totalRequests || 0;

    // Clear existing content
    trackerListEl.innerHTML = "";

    if (data.totalTrackers === 0) {
        // Show empty state
        emptyStateEl.classList.remove("hidden");
        trackerListEl.classList.add("hidden");
        return;
    }

    // Hide empty state and show tracker list
    emptyStateEl.classList.add("hidden");
    trackerListEl.classList.remove("hidden");

    // Sort trackers by count (highest first)
    const sortedTrackers = Object.entries(data.trackerData)
        .sort((a, b) => b[1].count - a[1].count);

    // Render each tracker
    sortedTrackers.forEach(([domain, info]) => {
        const trackerItem = document.createElement("div");
        trackerItem.className = "tracker-item";

        // Create header with domain and count
        const header = document.createElement("div");
        header.className = "tracker-header";

        const domainEl = document.createElement("div");
        domainEl.className = "tracker-domain";
        domainEl.textContent = domain;

        const countEl = document.createElement("div");
        countEl.className = "tracker-count";
        countEl.textContent = `${info.count} ${info.count === 1 ? 'request' : 'requests'}`;

        header.appendChild(domainEl);
        header.appendChild(countEl);

        // Create types badges
        const typesContainer = document.createElement("div");
        typesContainer.className = "tracker-types";

        // Sort types by count
        const sortedTypes = Object.entries(info.types)
            .sort((a, b) => b[1] - a[1]);

        sortedTypes.forEach(([type, count]) => {
            const badge = document.createElement("span");
            badge.className = "type-badge";
            badge.textContent = `${formatRequestType(type)}: ${count}`;
            typesContainer.appendChild(badge);
        });

        trackerItem.appendChild(header);
        trackerItem.appendChild(typesContainer);
        trackerListEl.appendChild(trackerItem);
    });
}

// Load tracker data
function loadTrackerData() {
    browser.runtime.sendMessage({ type: "getTrackerData" })
        .then(data => {
            renderTrackers(data);
        })
        .catch(err => {
            console.error("Error fetching tracker data:", err);
            trackerListEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #e74c3c;">Error loading tracker data</div>';
        });
}

// Clear all data
function clearData() {
    if (confirm("Clear all tracker data for this session?")) {
        browser.runtime.sendMessage({ type: "clearData" })
            .then(() => {
                loadTrackerData();
            })
            .catch(err => {
                console.error("Error clearing data:", err);
            });
    }
}

// Event listeners
clearBtn.addEventListener("click", clearData);
refreshBtn.addEventListener("click", loadTrackerData);

// New button handlers
const detailsBtn = document.getElementById("detailsBtn");
const graphBtn = document.getElementById("graphBtn");

detailsBtn.addEventListener("click", () => {
    browser.tabs.create({ url: browser.runtime.getURL("pages/details/details.html") });
});

graphBtn.addEventListener("click", () => {
    browser.tabs.create({ url: browser.runtime.getURL("pages/graph/graph.html") });
});

// Load data when popup opens
document.addEventListener("DOMContentLoaded", loadTrackerData);
