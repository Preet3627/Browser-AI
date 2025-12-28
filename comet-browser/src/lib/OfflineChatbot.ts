/**
 * Simple On-Device Chatbot
 * Offline-capable, rule-based responses for general queries
 */

export class OfflineChatbot {
    private responses: Map<string, string[]> = new Map();

    constructor() {
        this.initializeResponses();
    }

    private initializeResponses() {
        // Greetings
        this.responses.set('greeting', [
            "Hello! I'm your offline assistant. How can I help you today?",
            "Hi there! I'm here to help, even without internet.",
            "Hey! What can I do for you?"
        ]);

        // Help
        this.responses.set('help', [
            "I can help with:\n• Browser navigation\n• Tab management\n• Settings configuration\n• General questions\n\nJust ask me anything!",
            "I'm your offline assistant. I can guide you through browser features, manage tabs, or answer general questions."
        ]);

        // Browser features
        this.responses.set('tabs', [
            "To manage tabs, click the tab icon or use Ctrl+T for new tab, Ctrl+W to close.",
            "You can view all tabs in Settings > Tab Management."
        ]);

        this.responses.set('settings', [
            "Access settings by clicking the Settings icon in the toolbar.",
            "Settings include Appearance, Privacy, Vault, Extensions, and more!"
        ]);

        // Default
        this.responses.set('default', [
            "I'm not sure about that, but I'm learning! Try asking about browser features.",
            "Hmm, I don't have an answer for that offline. Try connecting to use cloud AI.",
            "That's beyond my offline knowledge. Connect to the internet for advanced AI assistance."
        ]);
    }

    public chat(message: string): string {
        const msg = message.toLowerCase().trim();

        // Pattern matching
        if (msg.match(/^(hi|hello|hey|greetings)/)) {
            return this.getRandomResponse('greeting');
        }

        if (msg.includes('help') || msg.includes('what can you do')) {
            return this.getRandomResponse('help');
        }

        if (msg.includes('tab')) {
            return this.getRandomResponse('tabs');
        }

        if (msg.includes('setting')) {
            return this.getRandomResponse('settings');
        }

        if (msg.includes('how are you')) {
            return "I'm functioning perfectly! How can I assist you?";
        }

        if (msg.includes('thank')) {
            return "You're welcome! Happy to help.";
        }

        return this.getRandomResponse('default');
    }

    private getRandomResponse(category: string): string {
        const options = this.responses.get(category) || this.responses.get('default')!;
        return options[Math.floor(Math.random() * options.length)];
    }
}

export const offlineChatbot = new OfflineChatbot();
