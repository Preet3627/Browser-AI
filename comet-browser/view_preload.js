const { contextBridge, ipcRenderer } = require('electron');

// Standard spoofing for Google Workspace and frame-sensitive sites
window.addEventListener('DOMContentLoaded', () => {
    try {
        // Deep spoofing for sandbox detection bypass
        const bypassDetection = () => {
            const secretSelf = window;

            try {
                Object.defineProperty(window, 'top', { get: () => secretSelf, configurable: true });
                Object.defineProperty(window, 'parent', { get: () => secretSelf, configurable: true });
                Object.defineProperty(window, 'opener', { get: () => null, configurable: true });
            } catch (e) {
                console.warn("Could not redefine top/parent - likely already locked by site.");
            }

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

        // Password Auto-Fill & Auto-Save Detection
        const handlePasswordManager = () => {
            const domain = window.location.hostname.replace('www.', '');
            const forms = document.querySelectorAll('form');

            // 1. Auto-Fill Search
            ipcRenderer.invoke('get-passwords-for-site', domain).then(passwords => {
                if (passwords && passwords.length > 0) {
                    const entry = passwords[0];
                    const userFields = document.querySelectorAll('input[type="text"], input[type="email"], input[name*="user"], input[name*="login"]');
                    const passFields = document.querySelectorAll('input[type="password"]');

                    if (passFields.length > 0) {
                        passFields.forEach(pf => { pf.value = entry.password; });
                        if (userFields.length > 0) {
                            userFields.forEach(uf => { if (!uf.value) uf.value = entry.username; });
                        }
                    }
                }
            });

            // 2. Capture Auto-Save
            document.addEventListener('submit', (e) => {
                const form = e.target;
                const passField = form.querySelector('input[type="password"]');
                const userField = form.querySelector('input[type="text"], input[type="email"], input[name*="user"]');

                if (passField && passField.value) {
                    const username = userField ? userField.value : '';
                    const password = passField.value;
                    ipcRenderer.send('propose-password-save', { domain, username, password });
                }
            });
        };

        handlePasswordManager();
    } catch (e) {
        console.warn("View Preload tweak failed:", e);
    }
});
