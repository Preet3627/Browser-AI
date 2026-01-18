import { getDatabase, ref, onValue, set, Database } from "firebase/database";
import { User, Auth } from "firebase/auth";
import firebaseService from "./FirebaseService"; // Corrected import
import { Security } from "./Security";

// These will be null initially, and set once firebaseService is initialized
let db: Database | null = null;
let auth: Auth | null = null;

// Listen for FirebaseService to be initialized and then set db and auth
const initCheckInterval = setInterval(() => {
  if (firebaseService.app && firebaseService.auth) {
    db = getDatabase(firebaseService.app);
    auth = firebaseService.auth;
    clearInterval(initCheckInterval);
  }
}, 500);


class FirebaseSyncService {
  private userId: string | null = null;

  constructor() {
    // Wait for auth to be initialized before listening to state changes
    const authCheckInterval = setInterval(() => {
      if (auth) {
        auth.onAuthStateChanged((user: User | null) => {
          if (user) {
            this.userId = user.uid;
            // Only sync if not in guest mode - check will be done in individual sync methods
            this.syncClipboard();
            this.syncHistory();
            this.syncApiKeys();
          } else {
            this.userId = null;
          }
        });
        clearInterval(authCheckInterval);
      }
    }, 500);
  }

  private async getStore() {
    const { useAppStore } = await import("@/store/useAppStore");
    return useAppStore;
  }

  public async syncClipboard() {
    if (!this.userId || !db) return;
    
    const useAppStore = await this.getStore();
    const store = useAppStore.getState();
    
    // Skip sync if guest mode is enabled
    if (store.isGuestMode || !store.cloudSyncConsent) return;

    const clipboardRef = ref(db, "clipboard/" + this.userId);
    onValue(clipboardRef, async (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        const useAppStore = await this.getStore();
        const store = useAppStore.getState();
        
        // Double-check guest mode and sync consent before syncing
        if (store.isGuestMode || !store.cloudSyncConsent) return;
        
        const decrypted = await Promise.all(
          data.map(item => Security.decrypt(item, store.syncPassphrase || undefined))
        );
        store.clipboard = decrypted;
      }
    });
  }

  public async setClipboard(clipboard: unknown[]) {
    if (!this.userId || !db) return;
    const useAppStore = await this.getStore();
    const store = useAppStore.getState();
    
    // Skip sync if guest mode is enabled
    if (store.isGuestMode || !store.cloudSyncConsent) return;
    
    const encrypted = await Promise.all(
      clipboard.map(item => Security.encrypt(String(item), store.syncPassphrase || undefined))
    );

    const clipboardRef = ref(db, "clipboard/" + this.userId);
    set(clipboardRef, encrypted);
  }

  public async syncHistory() {
    if (!this.userId || !db) return;

    const useAppStore = await this.getStore();
    const store = useAppStore.getState();
    
    // Skip sync if guest mode is enabled
    if (store.isGuestMode || !store.cloudSyncConsent) return;

    const historyRef = ref(db, "history/" + this.userId);
    onValue(historyRef, async (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        const useAppStore = await this.getStore();
        const store = useAppStore.getState();
        
        // Double-check guest mode and sync consent before syncing
        if (store.isGuestMode || !store.cloudSyncConsent) return;
        
        store.setHistory(data);
      }
    });
  }

  public async setHistory(history: string[]) {
    if (!this.userId || !db) return;
    const useAppStore = await this.getStore();
    const store = useAppStore.getState();
    
    // Skip sync if guest mode is enabled
    if (store.isGuestMode || !store.cloudSyncConsent) return;
    
    const encrypted = await Promise.all(
      history.map(item => Security.encrypt(item, store.syncPassphrase || undefined))
    );

    const historyRef = ref(db, "history/" + this.userId);
    set(historyRef, encrypted);
  }

  public async syncApiKeys() {
    if (!this.userId || !db) return;

    const useAppStore = await this.getStore();
    const store = useAppStore.getState();
    
    // Skip sync if guest mode is enabled
    if (store.isGuestMode || !store.cloudSyncConsent) return;

    const apiKeysRef = ref(db, "apiKeys/" + this.userId);
    onValue(apiKeysRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const useAppStore = await this.getStore();
        const store = useAppStore.getState();
        
        // Double-check guest mode and sync consent before syncing
        if (store.isGuestMode || !store.cloudSyncConsent) return;
        
        const decrypted = await Security.decrypt(data, store.syncPassphrase || undefined);
        const parsedKeys = JSON.parse(decrypted);
        store.setOpenaiApiKey(parsedKeys.openai);
        store.setGeminiApiKey(parsedKeys.gemini);
      }
    });
  }

  public async setApiKeys(apiKeys: Record<string, string>) {
    if (!this.userId || !db) return;
    const useAppStore = await this.getStore();
    const store = useAppStore.getState();
    
    // Skip sync if guest mode is enabled
    if (store.isGuestMode || !store.cloudSyncConsent) return;
    
    const encryptedKeys = await Security.encrypt(JSON.stringify(apiKeys), store.syncPassphrase || undefined);
    const apiKeysRef = ref(db, "apiKeys/" + this.userId);
    set(apiKeysRef, encryptedKeys);
  }
}

export const firebaseSyncService = new FirebaseSyncService();