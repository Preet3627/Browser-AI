import { ChatMessage } from "@/lib/llm/providers/base";

declare global {
    interface Window {
        electronAPI: {
            // BrowserView related APIs
            navigateTo: (url: string) => void;
            goBack: () => void;
            goForward: () => void;
            reload: () => void;
            getCurrentUrl: () => Promise<string>;
            extractPageContent: () => Promise<{ content?: string; error?: string }>;
            setBrowserViewBounds: (bounds: { x: number; y: number; width: number; height: number }) => void;
            capturePageHtml: () => Promise<string>;
            saveOfflinePage: (data: { url: string; title: string, html: string }) => Promise<boolean>;
            openDevTools: () => void;

            // LLM & Memory APIs
            getAvailableLLMProviders: () => Promise<{ id: string; name: string }[]>;
            setActiveLLMProvider: (providerId: string) => Promise<boolean>;
            configureLLMProvider: (providerId: string, options: any) => Promise<boolean>;
            generateChatContent: (messages: ChatMessage[], options?: any) => Promise<{ text?: string; error?: string }>;
            getAiMemory: () => Promise<any[]>;
            addAiMemory: (entry: any) => void;

            // Dev-MCP & Analytics
            sendMcpCommand: (command: string, data: any) => Promise<any>;
            shareDeviceFolder: () => Promise<{ path?: string; success: boolean }>;

            // Utils
            setUserId: (userId: string | null) => void;
            getClipboardText: () => Promise<string>;
            setClipboardText: (text: string) => void;

            // Extensions
            getExtensionPath: () => Promise<string>;
        };
    }
}

export { };
