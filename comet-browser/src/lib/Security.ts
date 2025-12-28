/**
 * Security module for Comet Browser
 * Handles sensitive data encryption and verification
 */

const SECRET_KEY = "comet-secure-vault-key";

export const Security = {
    /**
     * Simple encryption for demonstration.
     * In production, use Web Crypto API (AES-GCM)
     */
    encrypt: (text: string): string => {
        try {
            const b64 = btoa(text);
            return `ENC:${b64.split('').reverse().join('')}`;
        } catch (e) {
            return text;
        }
    },

    decrypt: (encoded: string): string => {
        try {
            if (!encoded.startsWith("ENC:")) return encoded;
            const data = encoded.replace("ENC:", "").split('').reverse().join('');
            return atob(data);
        } catch (e) {
            return encoded;
        }
    },

    /**
     * Scrub sensitive data from logs
     */
    scrub: (data: any): any => {
        const sensitiveKeys = ['password', 'api_key', 'apiKey', 'secret'];
        if (typeof data === 'string') {
            for (const key of sensitiveKeys) {
                if (data.toLowerCase().includes(key)) return "[REDACTED]";
            }
        }
        return data;
    }
};
