// src/lib/BackendService.ts
import firebaseService from './FirebaseService';

export type HistoryItem = {
    url: string;
    title: string;
    timestamp: any;
};

class BackendService {
    private mode: 'firebase' | 'mysql' = 'firebase';

    setMode(mode: 'firebase' | 'mysql') {
        this.mode = mode;
    }

    async saveHistory(userId: string, url: string, title: string) {
        if (this.mode === 'firebase') {
            return firebaseService.addHistoryEntry(userId, url, title);
        }
        // MySQL logic would go here if we had a node-mysql connection
        console.log(`[MySQL Mock] Saving history: ${url}`);
    }

    async getHistory(userId: string): Promise<HistoryItem[]> {
        // Implement history retrieval
        return [];
    }
}

const backendService = new BackendService();
export default backendService;
