/**
 * Cross-Device Phone Call Control & Bluetooth Integration
 * Allows desktop to control phone calls when Bluetooth is connected
 */

export interface BluetoothDevice {
    id: string;
    name: string;
    type: 'phone' | 'headset' | 'computer' | 'other';
    connected: boolean;
    batteryLevel?: number;
}

export interface PhoneCall {
    id: string;
    number: string;
    contactName?: string;
    direction: 'incoming' | 'outgoing';
    status: 'ringing' | 'active' | 'held' | 'ended';
    startTime: number;
    duration?: number;
}

export class PhoneCallControlService {
    private connectedDevices: Map<string, BluetoothDevice> = new Map();
    private activeCalls: Map<string, PhoneCall> = new Map();
    private bluetoothAvailable: boolean = false;

    constructor() {
        this.checkBluetoothAvailability();
    }

    private async checkBluetoothAvailability() {
        if ('bluetooth' in navigator) {
            this.bluetoothAvailable = true;
            console.log('[Bluetooth] API available');
        } else {
            console.warn('[Bluetooth] API not available in this browser');
        }
    }

    /**
     * Scan for nearby Bluetooth devices
     */
    async scanForDevices(): Promise<BluetoothDevice[]> {
        if (!this.bluetoothAvailable) {
            throw new Error('Bluetooth not available');
        }

        try {
            // Request Bluetooth device
            const device = await (navigator as any).bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['battery_service', 'phone_service']
            });

            const btDevice: BluetoothDevice = {
                id: device.id,
                name: device.name || 'Unknown Device',
                type: this.detectDeviceType(device.name),
                connected: device.gatt?.connected || false
            };

            this.connectedDevices.set(btDevice.id, btDevice);
            return Array.from(this.connectedDevices.values());
        } catch (error) {
            console.error('[Bluetooth] Scan failed:', error);
            return [];
        }
    }

    private detectDeviceType(name: string): BluetoothDevice['type'] {
        const nameLower = name?.toLowerCase() || '';
        if (nameLower.includes('phone') || nameLower.includes('android') || nameLower.includes('iphone')) {
            return 'phone';
        }
        if (nameLower.includes('headset') || nameLower.includes('buds') || nameLower.includes('airpods')) {
            return 'headset';
        }
        if (nameLower.includes('pc') || nameLower.includes('laptop') || nameLower.includes('macbook')) {
            return 'computer';
        }
        return 'other';
    }

    /**
     * Connect to a Bluetooth device
     */
    async connectDevice(deviceId: string): Promise<boolean> {
        const device = this.connectedDevices.get(deviceId);
        if (!device) return false;

        try {
            // In a real implementation, this would use the Web Bluetooth API
            // to establish a GATT connection
            device.connected = true;
            this.connectedDevices.set(deviceId, device);
            console.log(`[Bluetooth] Connected to ${device.name}`);
            return true;
        } catch (error) {
            console.error('[Bluetooth] Connection failed:', error);
            return false;
        }
    }

    /**
     * Answer incoming call
     */
    async answerCall(callId: string): Promise<boolean> {
        const call = this.activeCalls.get(callId);
        if (!call || call.status !== 'ringing') return false;

        try {
            // Send command to phone via Bluetooth
            await this.sendPhoneCommand('ANSWER_CALL', { callId });

            call.status = 'active';
            call.startTime = Date.now();
            this.activeCalls.set(callId, call);

            console.log(`[Phone] Answered call from ${call.number}`);
            return true;
        } catch (error) {
            console.error('[Phone] Answer failed:', error);
            return false;
        }
    }

    /**
     * Reject incoming call
     */
    async rejectCall(callId: string): Promise<boolean> {
        const call = this.activeCalls.get(callId);
        if (!call) return false;

        try {
            await this.sendPhoneCommand('REJECT_CALL', { callId });

            call.status = 'ended';
            this.activeCalls.set(callId, call);

            console.log(`[Phone] Rejected call from ${call.number}`);
            return true;
        } catch (error) {
            console.error('[Phone] Reject failed:', error);
            return false;
        }
    }

    /**
     * End active call
     */
    async endCall(callId: string): Promise<boolean> {
        const call = this.activeCalls.get(callId);
        if (!call || call.status === 'ended') return false;

        try {
            await this.sendPhoneCommand('END_CALL', { callId });

            call.status = 'ended';
            call.duration = Date.now() - call.startTime;
            this.activeCalls.set(callId, call);

            console.log(`[Phone] Ended call with ${call.number}`);
            return true;
        } catch (error) {
            console.error('[Phone] End call failed:', error);
            return false;
        }
    }

    /**
     * Make outgoing call
     */
    async makeCall(number: string): Promise<string | null> {
        try {
            const callId = `call-${Date.now()}`;
            const call: PhoneCall = {
                id: callId,
                number,
                direction: 'outgoing',
                status: 'ringing',
                startTime: Date.now()
            };

            await this.sendPhoneCommand('MAKE_CALL', { number });

            this.activeCalls.set(callId, call);
            console.log(`[Phone] Calling ${number}`);

            return callId;
        } catch (error) {
            console.error('[Phone] Make call failed:', error);
            return null;
        }
    }

    /**
     * Mute/unmute call
     */
    async toggleMute(callId: string, muted: boolean): Promise<boolean> {
        try {
            await this.sendPhoneCommand('TOGGLE_MUTE', { callId, muted });
            console.log(`[Phone] Mute ${muted ? 'enabled' : 'disabled'}`);
            return true;
        } catch (error) {
            console.error('[Phone] Mute toggle failed:', error);
            return false;
        }
    }

    /**
     * Put call on hold
     */
    async holdCall(callId: string): Promise<boolean> {
        const call = this.activeCalls.get(callId);
        if (!call || call.status !== 'active') return false;

        try {
            await this.sendPhoneCommand('HOLD_CALL', { callId });
            call.status = 'held';
            this.activeCalls.set(callId, call);
            return true;
        } catch (error) {
            console.error('[Phone] Hold failed:', error);
            return false;
        }
    }

    /**
     * Resume held call
     */
    async resumeCall(callId: string): Promise<boolean> {
        const call = this.activeCalls.get(callId);
        if (!call || call.status !== 'held') return false;

        try {
            await this.sendPhoneCommand('RESUME_CALL', { callId });
            call.status = 'active';
            this.activeCalls.set(callId, call);
            return true;
        } catch (error) {
            console.error('[Phone] Resume failed:', error);
            return false;
        }
    }

    /**
     * Send command to phone via Bluetooth
     */
    private async sendPhoneCommand(command: string, data: any): Promise<void> {
        // This would use the Bluetooth GATT protocol to send commands
        // For now, we'll use the Electron IPC if available
        if (typeof window !== 'undefined' && window.electronAPI) {
            await window.electronAPI.sendPhoneCommand(command, data);
        } else {
            console.log(`[Phone Command] ${command}`, data);
        }
    }

    /**
     * Get all active calls
     */
    getActiveCalls(): PhoneCall[] {
        return Array.from(this.activeCalls.values()).filter(
            call => call.status !== 'ended'
        );
    }

    /**
     * Get connected devices
     */
    getConnectedDevices(): BluetoothDevice[] {
        return Array.from(this.connectedDevices.values()).filter(
            device => device.connected
        );
    }

    /**
     * Handle incoming call notification
     */
    handleIncomingCall(number: string, contactName?: string): string {
        const callId = `call-${Date.now()}`;
        const call: PhoneCall = {
            id: callId,
            number,
            contactName,
            direction: 'incoming',
            status: 'ringing',
            startTime: Date.now()
        };

        this.activeCalls.set(callId, call);

        // Show desktop notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Incoming Call', {
                body: contactName || number,
                icon: '/phone-icon.png',
                tag: callId
            });
        }

        return callId;
    }
}

// Singleton instance
let phoneControlInstance: PhoneCallControlService | null = null;

export function getPhoneControl(): PhoneCallControlService {
    if (!phoneControlInstance) {
        phoneControlInstance = new PhoneCallControlService();
    }
    return phoneControlInstance;
}
