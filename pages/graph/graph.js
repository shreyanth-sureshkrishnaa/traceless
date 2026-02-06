// Canvas and context
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

// DOM Elements
const tooltip = document.getElementById('tooltip');
const emptyState = document.getElementById('emptyState');
const resetBtn = document.getElementById('resetBtn');
const pauseBtn = document.getElementById('pauseBtn');
const pauseText = document.getElementById('pauseText');
const nodeCountEl = document.getElementById('nodeCount');
const connectionCountEl = document.getElementById('connectionCount');

// State
let nodes = [];
let isPaused = false;
let animationFrame = null;
let hoveredNode = null;
let dataLoaded = false;

// Category colors
const categoryColors = {
    analytics: '#00d4ff',
    advertising: '#ff3333',
    social: '#a855f7',
    other: '#ffb000'
};

// Tracker categories
const trackerCategories = {
    'google-analytics.com': 'analytics',
    'googletagmanager.com': 'analytics',
    'googletagservices.com': 'analytics',
    'analytics.google.com': 'analytics',
    'mixpanel.com': 'analytics',
    'hotjar.com': 'analytics',
    'mouseflow.com': 'analytics',
    'crazyegg.com': 'analytics',
    'segment.com': 'analytics',
    'segment.io': 'analytics',
    'amplitude.com': 'analytics',
    'fullstory.com': 'analytics',
    'newrelic.com': 'analytics',
    'nr-data.net': 'analytics',
    'optimizely.com': 'analytics',
    'chartbeat.com': 'analytics',
    'chartbeat.net': 'analytics',
    'kissmetrics.com': 'analytics',
    'scorecardresearch.com': 'analytics',
    'quantserve.com': 'analytics',
    'heapanalytics.com': 'analytics',
    'pendo.io': 'analytics',
    'bugsnag.com': 'analytics',
    'sentry.io': 'analytics',
    'loggly.com': 'analytics',
    'datadoghq.com': 'analytics',
    'cloudflareinsights.com': 'analytics',
    'doubleclick.net': 'advertising',
    'googlesyndication.com': 'advertising',
    'googleadservices.com': 'advertising',
    'adservice.google.com': 'advertising',
    'amazon-adsystem.com': 'advertising',
    'adnxs.com': 'advertising',
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
    'facebook.net': 'social',
    'facebook.com': 'social',
    'connect.facebook.net': 'social',
    'twitter.com': 'social',
    'analytics.twitter.com': 'social',
    'ads-twitter.com': 'social',
    'linkedin.com': 'social',
    'licdn.com': 'social',
    'instagram.com': 'social',
    'pinterest.com': 'social',
    'snapchat.com': 'social',
    'sc-static.net': 'social',
    'tiktok.com': 'social',
    'reddit.com': 'social',
    'redditmedia.com': 'social',
    'disqus.com': 'social',
    'addthis.com': 'social',
    'sharethis.com': 'social'
};

function getCategory(domain) {
    if (trackerCategories[domain]) return trackerCategories[domain];
    for (const [trackerDomain, category] of Object.entries(trackerCategories)) {
        if (domain.endsWith('.' + trackerDomain) || domain.includes(trackerDomain)) {
            return category;
        }
    }
    return 'other';
}

// Resize canvas
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Reposition nodes when resizing
    if (nodes.length > 0) {
        repositionNodes();
    }
}

function repositionNodes() {
    const total = nodes.length;
    nodes.forEach((node, index) => {
        const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.35;
        node.targetX = canvas.width / 2 + Math.cos(angle) * radius;
        node.targetY = canvas.height / 2 + Math.sin(angle) * radius;
    });
}

// Node class
class Node {
    constructor(domain, info, index, total) {
        this.domain = domain;
        this.info = info;
        this.category = getCategory(domain);
        this.color = categoryColors[this.category];

        // Position in orbit around center
        const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.35;

        this.targetX = canvas.width / 2 + Math.cos(angle) * radius;
        this.targetY = canvas.height / 2 + Math.sin(angle) * radius;

        // Start from center
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;

        // Size based on request count (log scale for better visual)
        this.radius = Math.min(35, Math.max(14, 10 + Math.log(info.count + 1) * 6));

        // Animation
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
        // Move towards target with easing
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.x += dx * 0.08;
        this.y += dy * 0.08;

        // Pulse animation
        this.pulsePhase += 0.04;
    }

    draw(ctx, isHovered) {
        const pulse = Math.sin(this.pulsePhase) * 0.12;
        const currentRadius = this.radius * (1 + pulse);

        // Outer glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, currentRadius * 3
        );
        gradient.addColorStop(0, this.color + '50');
        gradient.addColorStop(0.5, this.color + '20');
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Main circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? this.color : this.color + 'dd';
        ctx.fill();

        // Border
        ctx.strokeStyle = isHovered ? '#ffffff' : this.color;
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.stroke();

        // Inner highlight
        ctx.beginPath();
        ctx.arc(this.x - currentRadius * 0.25, this.y - currentRadius * 0.25, currentRadius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fill();

        // Request count in center
        if (currentRadius > 16) {
            ctx.fillStyle = '#0a0a0f';
            ctx.font = `bold ${Math.max(9, currentRadius * 0.5)}px IBM Plex Mono, monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.info.count.toString(), this.x, this.y);
        }
    }

    containsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius * 1.5;
    }
}

// Draw center node (user)
function drawCenterNode() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 45;

    // Animated outer ring
    const ringPulse = Math.sin(Date.now() / 500) * 0.1 + 1;

    // Multiple glow rings
    for (let i = 3; i >= 1; i--) {
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * (2 + i * 0.5) * ringPulse);
        gradient.addColorStop(0, `rgba(0, 255, 65, ${0.15 / i})`);
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, radius * (2 + i * 0.5) * ringPulse, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // Main circle background
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0f';
    ctx.fill();
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner rings
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ff4180';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ff4160';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center dot with glow
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff41';
    ctx.fill();

    // Crosshairs
    ctx.strokeStyle = '#00ff4150';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx - 10, cy);
    ctx.moveTo(cx + 10, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy - 10);
    ctx.moveTo(cx, cy + 10);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 11px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU', cx, cy + radius + 20);
}

// Draw connections with animated data flow
function drawConnections() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const time = Date.now();

    nodes.forEach((node, index) => {
        // Calculate line angle for proper arrow direction
        const dx = node.x - cx;
        const dy = node.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Skip if node is still at center
        if (dist < 10) return;

        // Dashed line
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = node.color + '30';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 12]);
        ctx.lineDashOffset = -(time / 30) % 18;
        ctx.stroke();
        ctx.setLineDash([]);

        // Multiple animated particles
        const particleCount = Math.min(3, Math.ceil(node.info.count / 5));
        for (let p = 0; p < particleCount; p++) {
            const offset = p * (1 / particleCount);
            const progress = ((time / 1500 + offset + index * 0.1) % 1);

            const px = cx + dx * progress;
            const py = cy + dy * progress;

            // Particle with trail
            const gradient = ctx.createRadialGradient(px, py, 0, px, py, 6);
            gradient.addColorStop(0, node.color);
            gradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.fill();
        }
    });
}

// Main draw loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (nodes.length === 0) {
        emptyState.classList.remove('hidden');
        animationFrame = requestAnimationFrame(draw);
        return;
    }

    emptyState.classList.add('hidden');

    // Draw connections first (behind nodes)
    drawConnections();

    // Draw center node
    drawCenterNode();

    // Update and draw tracker nodes
    nodes.forEach(node => {
        if (!isPaused) node.update();
        node.draw(ctx, node === hoveredNode);
    });

    // Draw hovered node label
    if (hoveredNode) {
        const labelY = hoveredNode.y - hoveredNode.radius - 15;

        // Truncate long domains
        let label = hoveredNode.domain;
        if (label.length > 28) {
            label = label.substring(0, 25) + '...';
        }

        // Background for label
        ctx.font = '11px IBM Plex Mono, monospace';
        const metrics = ctx.measureText(label);
        const padding = 8;

        ctx.fillStyle = '#12121aee';
        ctx.strokeStyle = hoveredNode.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(
            hoveredNode.x - metrics.width / 2 - padding,
            labelY - 10,
            metrics.width + padding * 2,
            20,
            4
        );
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e0e0e0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, hoveredNode.x, labelY);
    }

    animationFrame = requestAnimationFrame(draw);
}

// Update nodes from tracker data
function updateNodes(trackerData) {
    const entries = Object.entries(trackerData);

    console.log('Updating graph with', entries.length, 'trackers');

    // Update stats
    nodeCountEl.textContent = entries.length;
    connectionCountEl.textContent = entries.length;

    if (entries.length === 0) {
        nodes = [];
        return;
    }

    // Create nodes - preserve positions for existing nodes
    const existingDomains = new Map(nodes.map(n => [n.domain, n]));

    nodes = entries.map(([domain, info], index) => {
        const existing = existingDomains.get(domain);
        if (existing) {
            // Update info but keep position
            existing.info = info;
            existing.radius = Math.min(35, Math.max(14, 10 + Math.log(info.count + 1) * 6));
            return existing;
        }
        return new Node(domain, info, index, entries.length);
    });

    // Reposition all nodes to proper orbital positions
    repositionNodes();
    dataLoaded = true;
}

// Load tracker data
function loadTrackerData() {
    console.log('Loading tracker data...');

    browser.runtime.sendMessage({ type: 'getTrackerData' })
        .then(data => {
            console.log('Received data:', data);
            if (data && data.trackerData) {
                updateNodes(data.trackerData);
            }
        })
        .catch(err => {
            console.error('Error fetching tracker data:', err);
        });
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

// Show tooltip
function showTooltip(node, x, y) {
    const domainEl = tooltip.querySelector('.tooltip-domain');
    const countEl = tooltip.querySelector('.tooltip-count');
    const categoryEl = tooltip.querySelector('.tooltip-category');
    const typesEl = tooltip.querySelector('.tooltip-types');

    domainEl.textContent = node.domain;
    countEl.textContent = `${node.info.count} reqs`;
    categoryEl.textContent = node.category.toUpperCase();
    categoryEl.style.color = node.color;

    // Types
    const typesHtml = Object.entries(node.info.types)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => `<span class="tooltip-type">${formatRequestType(type)}: ${count}</span>`)
        .join('');
    typesEl.innerHTML = typesHtml;

    // Position tooltip
    let posX = x + 20;
    let posY = y + 20;

    // Keep on screen
    const tooltipRect = tooltip.getBoundingClientRect();
    if (posX + 250 > window.innerWidth) posX = x - 250;
    if (posY + 180 > window.innerHeight) posY = y - 180;

    tooltip.style.left = posX + 'px';
    tooltip.style.top = posY + 'px';
    tooltip.classList.remove('hidden');
}

// Hide tooltip
function hideTooltip() {
    tooltip.classList.add('hidden');
}

// Mouse move handler
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoveredNode = null;
    for (const node of nodes) {
        if (node.containsPoint(x, y)) {
            hoveredNode = node;
            showTooltip(node, e.clientX, e.clientY);
            canvas.style.cursor = 'pointer';
            return;
        }
    }

    hideTooltip();
    canvas.style.cursor = 'default';
});

canvas.addEventListener('mouseleave', () => {
    hoveredNode = null;
    hideTooltip();
});

// Reset view
resetBtn.addEventListener('click', () => {
    nodes = [];
    loadTrackerData();
});

// Pause/resume
pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseText.textContent = isPaused ? 'Resume' : 'Pause';
    pauseBtn.classList.toggle('active', isPaused);
});

// Initialize
window.addEventListener('resize', resizeCanvas);

// Start everything
function init() {
    console.log('Initializing graph...');
    resizeCanvas();
    loadTrackerData();
    draw();
}

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Auto-refresh every 2 seconds
setInterval(() => {
    if (!isPaused) {
        loadTrackerData();
    }
}, 2000);

console.log('Graph script loaded');
