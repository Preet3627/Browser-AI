const { contextBridge, ipcRenderer } = require('electron');

// Standard spoofing for Google Workspace and frame-sensitive sites
window.addEventListener('DOMContentLoaded', () => {
    try {
        // Deep spoofing for sandbox detection bypass
        const bypassDetection = () => {
            const secretSelf = window;

            Object.defineProperty(window, 'top', { get: () => secretSelf, configurable: false });
            Object.defineProperty(window, 'parent', { get: () => secretSelf, configurable: false });
            Object.defineProperty(window, 'opener', { get: () => null, configurable: false });

            // Spoof document.referrer if needed
            Object.defineProperty(document, 'referrer', { get: () => '', configurable: false });

            // Neuter common frame-busting scripts
            // Some sites check if (top.location != self.location)
            // We can't easily spoof top.location across domains without a Proxy, 
            // but we can try to intercept navigation attempts.
        };

        bypassDetection();

        // Extra tweaks for Google Docs/Sheets
        if (window.location.hostname.includes('google.com')) {
            const style = document.createElement('style');
            style.textContent = `
                /* Fix potentially broken layouts when embedded */
                body { overflow: auto !important; }
                #gb { display: flex !important; } 
            `;
            document.head.appendChild(style);
        }
    } catch (e) {
        console.warn("View Preload tweak failed:", e);
    }
});

// Intercept window.location.replace if it's a frame-buster
const originalReplace = window.location.replace;
window.location.replace = function (url) {
    if (url === window.location.href || url.includes(window.location.hostname)) {
        return originalReplace.apply(this, arguments);
    }
    console.log("[ViewPreload] Blocked potential frame-buster navigation to:", url);
};
