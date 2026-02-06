// DOM Elements
const totalTrackersEl = document.getElementById('totalTrackers');
const totalRequestsEl = document.getElementById('totalRequests');
const trackerGridEl = document.getElementById('trackerGrid');
const emptyStateEl = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const exportBtn = document.getElementById('exportBtn');
const lastUpdatedEl = document.getElementById('lastUpdated');

// Tracker category mapping - expanded list
const trackerCategories = {
    // Analytics
    'google-analytics.com': 'analytics',
    'googletagmanager.com': 'analytics',
    'googletagservices.com': 'analytics',
    'analytics.google.com': 'analytics',
    'mixpanel.com': 'analytics',
    'api.mixpanel.com': 'analytics',
    'hotjar.com': 'analytics',
    'static.hotjar.com': 'analytics',
    'mouseflow.com': 'analytics',
    'crazyegg.com': 'analytics',
    'segment.com': 'analytics',
    'segment.io': 'analytics',
    'api.segment.io': 'analytics',
    'amplitude.com': 'analytics',
    'api.amplitude.com': 'analytics',
    'fullstory.com': 'analytics',
    'rs.fullstory.com': 'analytics',
    'newrelic.com': 'analytics',
    'nr-data.net': 'analytics',
    'bam.nr-data.net': 'analytics',
    'optimizely.com': 'analytics',
    'cdn.optimizely.com': 'analytics',
    'chartbeat.com': 'analytics',
    'chartbeat.net': 'analytics',
    'kissmetrics.com': 'analytics',
    'scorecardresearch.com': 'analytics',
    'quantserve.com': 'analytics',
    'heapanalytics.com': 'analytics',
    'pendo.io': 'analytics',
    'app.pendo.io': 'analytics',
    'bugsnag.com': 'analytics',
    'sentry.io': 'analytics',
    'sentry-cdn.com': 'analytics',
    'loggly.com': 'analytics',
    'datadoghq.com': 'analytics',
    'cloudflareinsights.com': 'analytics',
    'hubspot.com': 'analytics',
    'hs-scripts.com': 'analytics',
    'hs-analytics.net': 'analytics',
    'mparticle.com': 'analytics',
    'braze.com': 'analytics',
    'clevertap.com': 'analytics',
    'leanplum.com': 'analytics',
    'localytics.com': 'analytics',
    // Advertising
    'doubleclick.net': 'advertising',
    'googlesyndication.com': 'advertising',
    'googleadservices.com': 'advertising',
    'adservice.google.com': 'advertising',
    'pagead2.googlesyndication.com': 'advertising',
    'amazon-adsystem.com': 'advertising',
    'adnxs.com': 'advertising',
    'ib.adnxs.com': 'advertising',
    'rubiconproject.com': 'advertising',
    'pubmatic.com': 'advertising',
    'openx.net': 'advertising',
    'criteo.com': 'advertising',
    'criteo.net': 'advertising',
    'taboola.com': 'advertising',
    'outbrain.com': 'advertising',
    'advertising.com': 'advertising',
    'moatads.com': 'advertising',
    'adsrvr.org': 'advertising',
    'rlcdn.com': 'advertising',
    'casalemedia.com': 'advertising',
    'contextweb.com': 'advertising',
    'turn.com': 'advertising',
    'mathtag.com': 'advertising',
    'bidswitch.net': 'advertising',
    'spotxchange.com': 'advertising',
    'yieldmo.com': 'advertising',
    'appnexus.com': 'advertising',
    'adroll.com': 'advertising',
    'thetradedesk.com': 'advertising',
    'bluekai.com': 'advertising',
    'demdex.net': 'advertising',
    'everesttech.net': 'advertising',
    'adsafeprotected.com': 'advertising',
    'doubleverify.com': 'advertising',
    'teads.tv': 'advertising',
    'sharethrough.com': 'advertising',
    'inmobi.com': 'advertising',
    'applovin.com': 'advertising',
    'unityads.unity3d.com': 'advertising',
    'ironsrc.com': 'advertising',
    'chartboost.com': 'advertising',
    'vungle.com': 'advertising',
    'mopub.com': 'advertising',
    'admob.com': 'advertising',
    // Social
    'facebook.net': 'social',
    'facebook.com': 'social',
    'connect.facebook.net': 'social',
    'pixel.facebook.com': 'social',
    'twitter.com': 'social',
    'analytics.twitter.com': 'social',
    'ads-twitter.com': 'social',
    't.co': 'social',
    'linkedin.com': 'social',
    'licdn.com': 'social',
    'snap.licdn.com': 'social',
    'instagram.com': 'social',
    'pinterest.com': 'social',
    'ct.pinterest.com': 'social',
    'snapchat.com': 'social',
    'sc-static.net': 'social',
    'tiktok.com': 'social',
    'analytics.tiktok.com': 'social',
    'reddit.com': 'social',
    'redditmedia.com': 'social',
    'disqus.com': 'social',
    'addthis.com': 'social',
    'sharethis.com': 'social'
};

// Store data
let trackerData = {};

// Get category for a domain
function getCategory(domain) {
    // Check exact match first
    if (trackerCategories[domain]) {
        return trackerCategories[domain];
    }
    // Check if domain is subdomain of known tracker
    for (const [trackerDomain, category] of Object.entries(trackerCategories)) {
        if (domain.endsWith('.' + trackerDomain) || domain.includes(trackerDomain)) {
            return category;
        }
    }
    return 'other';
}

// Format request type
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
        'websocket': 'WS',
        'other': 'Other'
    };
    return typeMap[type] || type;
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

// Create tracker card HTML
function createTrackerCard(domain, info) {
    const category = getCategory(domain);
    const card = document.createElement('div');
    card.className = `tracker-card category-${category}`;
    card.dataset.domain = domain;
    card.dataset.category = category;

    const typesHtml = Object.entries(info.types)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => `<span class="type-tag">${formatRequestType(type)}: ${count}</span>`)
        .join('');

    card.innerHTML = `
        <div class="card-header">
            <span class="tracker-domain">${domain}</span>
            <span class="request-count">${info.count} ${info.count === 1 ? 'req' : 'reqs'}</span>
        </div>
        <div class="card-meta">
            <span class="category-badge ${category}">${category}</span>
        </div>
        <div class="card-details">
            <div class="detail-row">
                <span class="detail-label">First Seen</span>
                <span class="detail-value">${formatTime(info.firstSeen)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Request Types</span>
                <span class="detail-value">${Object.keys(info.types).length} types</span>
            </div>
        </div>
        <div class="request-types">${typesHtml}</div>
    `;

    return card;
}

// Render trackers
function renderTrackers(data, searchTerm = '', categoryFilterValue = 'all') {
    trackerData = data.trackerData || {};

    console.log('Rendering trackers:', Object.keys(trackerData).length);

    // Update stats
    totalTrackersEl.textContent = data.totalTrackers || 0;
    totalRequestsEl.textContent = data.totalRequests || 0;

    // Clear grid
    trackerGridEl.innerHTML = '';

    // Get filtered and sorted trackers
    let trackers = Object.entries(trackerData);

    // Filter by search
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        trackers = trackers.filter(([domain]) => domain.toLowerCase().includes(term));
    }

    // Filter by category
    if (categoryFilterValue !== 'all') {
        trackers = trackers.filter(([domain]) => getCategory(domain) === categoryFilterValue);
    }

    // Sort by request count
    trackers.sort((a, b) => b[1].count - a[1].count);

    if (trackers.length === 0) {
        emptyStateEl.classList.remove('hidden');
        trackerGridEl.classList.add('hidden');
        return;
    }

    emptyStateEl.classList.add('hidden');
    trackerGridEl.classList.remove('hidden');

    // Render cards
    trackers.forEach(([domain, info]) => {
        const card = createTrackerCard(domain, info);
        trackerGridEl.appendChild(card);
    });

    // Update timestamp
    lastUpdatedEl.textContent = `Last updated: ${formatTime(Date.now())}`;
}

// Load tracker data
function loadTrackerData() {
    console.log('Loading tracker data...');

    browser.runtime.sendMessage({ type: 'getTrackerData' })
        .then(data => {
            console.log('Received tracker data:', data);
            if (data) {
                renderTrackers(data, searchInput.value, categoryFilter.value);
            }
        })
        .catch(err => {
            console.error('Error fetching tracker data:', err);
            trackerGridEl.innerHTML = '<div class="error" style="padding: 20px; color: #ff3333;">Error loading tracker data. Make sure the extension is active.</div>';
        });
}

// Export data as JSON
function exportData() {
    const exportObj = {
        exportedAt: new Date().toISOString(),
        totalTrackers: Object.keys(trackerData).length,
        totalRequests: Object.values(trackerData).reduce((sum, t) => sum + t.count, 0),
        trackers: Object.entries(trackerData).map(([domain, info]) => ({
            domain,
            category: getCategory(domain),
            requestCount: info.count,
            requestTypes: info.types,
            firstSeen: new Date(info.firstSeen).toISOString()
        }))
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `traceless-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

// Debounced filter function
let filterTimeout = null;
function debouncedFilter() {
    if (filterTimeout) clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
        renderTrackers(
            {
                trackerData,
                totalTrackers: Object.keys(trackerData).length,
                totalRequests: Object.values(trackerData).reduce((sum, t) => sum + t.count, 0)
            },
            searchInput.value,
            categoryFilter.value
        );
    }, 150);
}

// Event listeners
searchInput.addEventListener('input', debouncedFilter);
categoryFilter.addEventListener('change', debouncedFilter);
exportBtn.addEventListener('click', exportData);

// Initial load
function init() {
    console.log('Details page initializing...');
    loadTrackerData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Auto-refresh every 3 seconds
setInterval(loadTrackerData, 3000);

console.log('Details script loaded');
