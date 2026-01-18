/**
 * Security module for Comet Browser
 * Handles sensitive data encryption and verification (E2EE)
 */

export const Security = {
    // deriveKey could be more complex, but for E2EE we need a consistent way to turn a passphrase into a key
    deriveKey: async (passphrase: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(passphrase);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return await crypto.subtle.importKey(
            'raw',
            hash,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
    },

    encrypt: async (text: string, passphrase?: string): Promise<string> => {
        if (!passphrase) {
            // Fallback for non-E2EE data
            return `LCL:${btoa(text)}`;
        }
        try {
            const key = await Security.deriveKey(passphrase);
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encoder = new TextEncoder();
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                encoder.encode(text)
            );

            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encrypted), iv.length);

            return `E2EE:${btoa(String.fromCharCode(...combined))}`;
        } catch (e) {
            console.error("Encryption failed:", e);
            return text;
        }
    },

    decrypt: async (encoded: string, passphrase?: string): Promise<string> => {
        if (encoded.startsWith("LCL:")) return atob(encoded.replace("LCL:", ""));
        if (!encoded.startsWith("E2EE:") || !passphrase) return encoded;

        try {
            const key = await Security.deriveKey(passphrase);
            const combined = new Uint8Array(
                atob(encoded.replace("E2EE:", ""))
                    .split('')
                    .map(c => c.charCodeAt(0))
            );

            const iv = combined.slice(0, 12);
            const data = combined.slice(12);

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                data
            );

            return new TextDecoder().decode(decrypted);
        } catch (e) {
            console.error("Decryption failed:", e);
            return "[Error: Decryption Failed - Check Passphrase]";
        }
    },

    /**
     * AI Fortress System
     * Detects and protects sensitive patterns (API Keys, Secrets)
     */
    fortress: (content: string): { content: string, wasProtected: boolean } => {
        const patterns = [
            { name: "[Gemini_API_Key]", regex: /AIzaSy[A-Za-z0-9_-]{33}/g },
            { name: "[OpenAI_API_Key]", regex: /sk-[A-Za-z0-9]{48}/g },
            { name: "[Anthropic_API_Key]", regex: /sk-ant-api03-[A-Za-z0-9-_]{93}/g },
            { name: "[Generic_Secret]", regex: /(password|secret|key|token)[=: ]+['"][A-Za-z0-9!@#$%^&*]{8,}['"]/gi }
        ];

        let protectedContent = content;
        let wasProtected = false;

        patterns.forEach(p => {
            if (p.regex.test(protectedContent)) {
                protectedContent = protectedContent.replace(p.regex, p.name);
                wasProtected = true;
            }
        });

        return { content: protectedContent, wasProtected };
    }
};
