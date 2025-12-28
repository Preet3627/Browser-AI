/**
 * Gmail Integration Service
 * Connect Gmail for email management, OTP capture, and email AI
 */

export interface GmailConfig {
    clientId: string;
    clientSecret: string;
    refreshToken?: string;
    accessToken?: string;
}

export interface Email {
    id: string;
    threadId: string;
    from: string;
    to: string;
    subject: string;
    body: string;
    date: Date;
    labels: string[];
    hasAttachments: boolean;
    isRead: boolean;
}

export class GmailService {
    private config: GmailConfig | null = null;
    private accessToken: string | null = null;

    /**
     * Initialize Gmail connection
     */
    async connect(config: GmailConfig): Promise<boolean> {
        this.config = config;

        try {
            // Get access token
            const token = await this.getAccessToken();
            if (token) {
                this.accessToken = token;
                console.log('[Gmail] Connected successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('[Gmail] Connection failed:', error);
            return false;
        }
    }

    /**
     * OAuth2 authentication
     */
    async authenticate(): Promise<string> {
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${this.config?.clientId}&` +
            `redirect_uri=http://localhost:3000/auth/gmail/callback&` +
            `response_type=code&` +
            `scope=https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send&` +
            `access_type=offline`;

        // Open auth window
        if (typeof window !== 'undefined') {
            window.open(authUrl, '_blank', 'width=500,height=600');
        }

        return authUrl;
    }

    /**
     * Get access token
     */
    private async getAccessToken(): Promise<string | null> {
        if (!this.config) return null;

        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    refresh_token: this.config.refreshToken,
                    grant_type: 'refresh_token'
                })
            });

            const data = await response.json();
            return data.access_token || null;
        } catch (error) {
            console.error('[Gmail] Token refresh failed:', error);
            return null;
        }
    }

    /**
     * Fetch emails
     */
    async fetchEmails(maxResults: number = 50): Promise<Email[]> {
        if (!this.accessToken) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            const data = await response.json();
            const emails: Email[] = [];

            for (const message of data.messages || []) {
                const email = await this.fetchEmail(message.id);
                if (email) emails.push(email);
            }

            return emails;
        } catch (error) {
            console.error('[Gmail] Fetch failed:', error);
            return [];
        }
    }

    /**
     * Fetch single email
     */
    private async fetchEmail(id: string): Promise<Email | null> {
        if (!this.accessToken) return null;

        try {
            const response = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            const data = await response.json();
            const headers = data.payload.headers;

            return {
                id: data.id,
                threadId: data.threadId,
                from: this.getHeader(headers, 'From'),
                to: this.getHeader(headers, 'To'),
                subject: this.getHeader(headers, 'Subject'),
                body: this.getEmailBody(data.payload),
                date: new Date(parseInt(data.internalDate)),
                labels: data.labelIds || [],
                hasAttachments: this.hasAttachments(data.payload),
                isRead: !data.labelIds?.includes('UNREAD')
            };
        } catch (error) {
            console.error('[Gmail] Email fetch failed:', error);
            return null;
        }
    }

    /**
     * Send email
     */
    async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
        if (!this.accessToken) return false;

        try {
            const email = [
                `To: ${to}`,
                `Subject: ${subject}`,
                '',
                body
            ].join('\n');

            const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_');

            const response = await fetch(
                'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ raw: encodedEmail })
                }
            );

            return response.ok;
        } catch (error) {
            console.error('[Gmail] Send failed:', error);
            return false;
        }
    }

    /**
     * Search emails
     */
    async searchEmails(query: string): Promise<Email[]> {
        if (!this.accessToken) return [];

        try {
            const response = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            const data = await response.json();
            const emails: Email[] = [];

            for (const message of data.messages || []) {
                const email = await this.fetchEmail(message.id);
                if (email) emails.push(email);
            }

            return emails;
        } catch (error) {
            console.error('[Gmail] Search failed:', error);
            return [];
        }
    }

    /**
     * Monitor for OTP emails
     */
    async monitorOTPs(callback: (otp: string, service: string) => void): Promise<void> {
        setInterval(async () => {
            const otpEmails = await this.searchEmails('verification code OR OTP OR one-time');

            for (const email of otpEmails) {
                if (!email.isRead) {
                    const otpMatch = email.body.match(/\b\d{4,8}\b/);
                    if (otpMatch) {
                        callback(otpMatch[0], email.from);
                    }
                }
            }
        }, 10000); // Check every 10 seconds
    }

    private getHeader(headers: any[], name: string): string {
        const header = headers.find(h => h.name === name);
        return header?.value || '';
    }

    private getEmailBody(payload: any): string {
        if (payload.body.data) {
            return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/plain' && part.body.data) {
                    return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                }
            }
        }
        return '';
    }

    private hasAttachments(payload: any): boolean {
        if (payload.parts) {
            return payload.parts.some((part: any) => part.filename && part.filename.length > 0);
        }
        return false;
    }
}

// Singleton
let gmailInstance: GmailService | null = null;

export function getGmailService(): GmailService {
    if (!gmailInstance) {
        gmailInstance = new GmailService();
    }
    return gmailInstance;
}
