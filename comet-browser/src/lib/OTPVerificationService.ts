/**
 * Cross-Device OTP Verification Service
 * Automatically captures and verifies SMS/Email OTPs across devices
 */

export interface OTPMessage {
    id: string;
    type: 'sms' | 'email';
    sender: string;
    code: string;
    message: string;
    timestamp: number;
    verified: boolean;
    service?: string; // e.g., "Google", "Bank", etc.
}

export class OTPVerificationService {
    private otpMessages: Map<string, OTPMessage> = new Map();
    private otpPattern = /\b\d{4,8}\b/g; // Matches 4-8 digit codes
    private listeners: Set<(otp: OTPMessage) => void> = new Set();

    /**
     * Start listening for SMS messages (Android)
     */
    async startSMSListener(): Promise<boolean> {
        try {
            if ('sms' in navigator && 'receive' in (navigator as any).sms) {
                // Web OTP API
                const abortController = new AbortController();

                (navigator as any).sms.receive({
                    signal: abortController.signal
                }).then((message: any) => {
                    this.processSMS(message.content);
                });

                console.log('[OTP] SMS listener started');
                return true;
            } else if (typeof window !== 'undefined' && window.electronAPI) {
                // Use Electron IPC for desktop
                await window.electronAPI.startSMSListener();
                return true;
            }
            return false;
        } catch (error) {
            console.error('[OTP] SMS listener failed:', error);
            return false;
        }
    }

    /**
     * Process incoming SMS
     */
    private processSMS(content: string): void {
        const codes = content.match(this.otpPattern);
        if (!codes || codes.length === 0) return;

        const code = codes[0]; // Take first code found
        const service = this.detectService(content);

        const otp: OTPMessage = {
            id: `otp-${Date.now()}`,
            type: 'sms',
            sender: this.extractSender(content),
            code,
            message: content,
            timestamp: Date.now(),
            verified: false,
            service
        };

        this.otpMessages.set(otp.id, otp);
        this.notifyListeners(otp);

        // Auto-fill if possible
        this.autoFillOTP(code);
    }

    /**
     * Monitor email for OTP codes
     */
    async startEmailListener(): Promise<boolean> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                await window.electronAPI.startEmailListener();
                return true;
            }
            return false;
        } catch (error) {
            console.error('[OTP] Email listener failed:', error);
            return false;
        }
    }

    /**
     * Process incoming email
     */
    processEmail(subject: string, body: string, from: string): void {
        const codes = body.match(this.otpPattern);
        if (!codes || codes.length === 0) return;

        const code = codes[0];
        const service = this.detectService(subject + ' ' + body);

        const otp: OTPMessage = {
            id: `otp-${Date.now()}`,
            type: 'email',
            sender: from,
            code,
            message: body,
            timestamp: Date.now(),
            verified: false,
            service
        };

        this.otpMessages.set(otp.id, otp);
        this.notifyListeners(otp);

        // Auto-fill if possible
        this.autoFillOTP(code);
    }

    /**
     * Detect service from message content
     */
    private detectService(content: string): string | undefined {
        const contentLower = content.toLowerCase();

        const services = [
            { keywords: ['google', 'gmail'], name: 'Google' },
            { keywords: ['facebook', 'meta'], name: 'Facebook' },
            { keywords: ['twitter', 'x.com'], name: 'Twitter' },
            { keywords: ['instagram'], name: 'Instagram' },
            { keywords: ['whatsapp'], name: 'WhatsApp' },
            { keywords: ['bank', 'banking'], name: 'Bank' },
            { keywords: ['amazon'], name: 'Amazon' },
            { keywords: ['microsoft', 'outlook'], name: 'Microsoft' },
            { keywords: ['apple', 'icloud'], name: 'Apple' },
        ];

        for (const service of services) {
            if (service.keywords.some(keyword => contentLower.includes(keyword))) {
                return service.name;
            }
        }

        return undefined;
    }

    /**
     * Extract sender from message
     */
    private extractSender(content: string): string {
        // Try to extract sender from common patterns
        const senderMatch = content.match(/from\s+([A-Za-z0-9\s]+)/i);
        return senderMatch ? senderMatch[1].trim() : 'Unknown';
    }

    /**
     * Auto-fill OTP in active input field
     */
    private autoFillOTP(code: string): void {
        // Try to find OTP input field
        const otpInputs = document.querySelectorAll('input[type="text"], input[type="number"], input[autocomplete*="one-time-code"]');

        for (const input of Array.from(otpInputs)) {
            const htmlInput = input as HTMLInputElement;
            if (htmlInput.value === '' && (
                htmlInput.name.toLowerCase().includes('otp') ||
                htmlInput.name.toLowerCase().includes('code') ||
                htmlInput.placeholder.toLowerCase().includes('otp') ||
                htmlInput.placeholder.toLowerCase().includes('code')
            )) {
                htmlInput.value = code;
                htmlInput.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('[OTP] Auto-filled code:', code);
                break;
            }
        }
    }

    /**
     * Sync OTP to other devices
     */
    async syncOTPToDevices(otp: OTPMessage): Promise<boolean> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                await window.electronAPI.syncOTP(otp);
                return true;
            }
            return false;
        } catch (error) {
            console.error('[OTP] Sync failed:', error);
            return false;
        }
    }

    /**
     * Get recent OTP messages
     */
    getRecentOTPs(limit: number = 10): OTPMessage[] {
        return Array.from(this.otpMessages.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Mark OTP as verified
     */
    markVerified(id: string): void {
        const otp = this.otpMessages.get(id);
        if (otp) {
            otp.verified = true;
            this.otpMessages.set(id, otp);
        }
    }

    /**
     * Clear old OTPs (older than 10 minutes)
     */
    clearOldOTPs(): void {
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
        for (const [id, otp] of this.otpMessages.entries()) {
            if (otp.timestamp < tenMinutesAgo) {
                this.otpMessages.delete(id);
            }
        }
    }

    /**
     * Add listener for new OTPs
     */
    addListener(callback: (otp: OTPMessage) => void): void {
        this.listeners.add(callback);
    }

    /**
     * Remove listener
     */
    removeListener(callback: (otp: OTPMessage) => void): void {
        this.listeners.delete(callback);
    }

    /**
     * Notify all listeners
     */
    private notifyListeners(otp: OTPMessage): void {
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('OTP Received', {
                body: `${otp.service || 'Service'}: ${otp.code}`,
                icon: '/otp-icon.png',
                tag: otp.id
            });
        }

        // Notify listeners
        this.listeners.forEach(callback => callback(otp));

        // Sync to other devices
        this.syncOTPToDevices(otp);
    }

    /**
     * Request SMS permission (Android)
     */
    async requestSMSPermission(): Promise<boolean> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                return await window.electronAPI.requestSMSPermission();
            }
            return true; // Web OTP API doesn't need explicit permission
        } catch (error) {
            console.error('[OTP] Permission request failed:', error);
            return false;
        }
    }
}

// Singleton
let otpServiceInstance: OTPVerificationService | null = null;

export function getOTPService(): OTPVerificationService {
    if (!otpServiceInstance) {
        otpServiceInstance = new OTPVerificationService();

        // Auto-start listeners
        otpServiceInstance.startSMSListener();
        otpServiceInstance.startEmailListener();

        // Clear old OTPs every minute
        setInterval(() => {
            otpServiceInstance?.clearOldOTPs();
        }, 60000);
    }
    return otpServiceInstance;
}
