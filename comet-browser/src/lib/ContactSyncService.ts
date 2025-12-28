/**
 * Contact Sync Service
 * Syncs contacts across devices with P2P encryption
 */

export interface Contact {
    id: string;
    name: string;
    phoneNumbers: { type: string; number: string }[];
    emails: { type: string; email: string }[];
    photo?: string;
    organization?: string;
    birthday?: string;
    notes?: string;
    lastModified: number;
    deviceId: string;
}

export class ContactSyncService {
    private contacts: Map<string, Contact> = new Map();
    private syncEnabled: boolean = false;

    /**
     * Import contacts from device
     */
    async importDeviceContacts(): Promise<number> {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                // Desktop: Use Electron IPC
                const deviceContacts = await window.electronAPI.getDeviceContacts();
                deviceContacts.forEach((contact: Contact) => {
                    this.contacts.set(contact.id, contact);
                });
                return deviceContacts.length;
            } else if ('contacts' in navigator && 'ContactsManager' in window) {
                // Mobile: Use Contact Picker API
                const props = ['name', 'tel', 'email'];
                const opts = { multiple: true };
                const contacts = await (navigator as any).contacts.select(props, opts);

                contacts.forEach((contact: any, index: number) => {
                    const id = `contact-${Date.now()}-${index}`;
                    this.contacts.set(id, {
                        id,
                        name: contact.name?.[0] || 'Unknown',
                        phoneNumbers: contact.tel?.map((tel: string) => ({ type: 'mobile', number: tel })) || [],
                        emails: contact.email?.map((email: string) => ({ type: 'personal', email })) || [],
                        lastModified: Date.now(),
                        deviceId: 'current'
                    });
                });

                return contacts.length;
            }
            return 0;
        } catch (error) {
            console.error('[Contacts] Import failed:', error);
            return 0;
        }
    }

    /**
     * Sync contacts to remote device
     */
    async syncToDevice(deviceId: string): Promise<{ success: boolean; synced: number }> {
        try {
            const contactsArray = Array.from(this.contacts.values());

            if (typeof window !== 'undefined' && window.electronAPI) {
                const result = await window.electronAPI.syncContacts(deviceId, contactsArray);
                return result;
            }

            return { success: false, synced: 0 };
        } catch (error) {
            console.error('[Contacts] Sync failed:', error);
            return { success: false, synced: 0 };
        }
    }

    /**
     * Search contacts
     */
    searchContacts(query: string): Contact[] {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.contacts.values()).filter(contact =>
            contact.name.toLowerCase().includes(lowerQuery) ||
            contact.phoneNumbers.some(p => p.number.includes(query)) ||
            contact.emails.some(e => e.email.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Get all contacts
     */
    getAllContacts(): Contact[] {
        return Array.from(this.contacts.values());
    }

    /**
     * Add or update contact
     */
    saveContact(contact: Contact): void {
        contact.lastModified = Date.now();
        this.contacts.set(contact.id, contact);
    }

    /**
     * Delete contact
     */
    deleteContact(id: string): boolean {
        return this.contacts.delete(id);
    }

    /**
     * Enable/disable auto-sync
     */
    setAutoSync(enabled: boolean): void {
        this.syncEnabled = enabled;
    }
}

// Singleton
let contactSyncInstance: ContactSyncService | null = null;

export function getContactSync(): ContactSyncService {
    if (!contactSyncInstance) {
        contactSyncInstance = new ContactSyncService();
    }
    return contactSyncInstance;
}
