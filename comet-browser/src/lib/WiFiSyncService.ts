import { EventEmitter } from 'events';
import { WebSocketServer, WebSocket } from 'ws';
import * as os from 'os';
import { clipboard } from 'electron';

export class WiFiSyncService extends EventEmitter {
    private port: number;
    private wss: WebSocketServer | null = null;
    private clients: Set<WebSocket> = new Set();
    private deviceId: string;

    constructor(port: number = 3004) {
        super();
        this.port = port;
        this.deviceId = `desktop-${os.hostname().substring(0, 8)}`;
    }

    public start(): boolean {
        try {
            this.wss = new WebSocketServer({ port: this.port });
            console.log(`[WiFi-Sync] Server started on port ${this.port}`);

            this.wss.on('connection', (ws: WebSocket) => {
                console.log('[WiFi-Sync] Mobile client connected');
                this.clients.add(ws);

                ws.on('message', (message: any) => {
                    this._handleMessage(ws, message);
                });

                ws.on('close', () => {
                    console.log('[WiFi-Sync] Mobile client disconnected');
                    this.clients.delete(ws);
                    this.emit('client-disconnected');
                });

                ws.on('error', (err) => {
                    console.error('[WiFi-Sync] WebSocket error:', err);
                });

                // Send immediate handshake info
                ws.send(JSON.stringify({
                    type: 'handshake-ack',
                    deviceId: this.deviceId,
                    hostname: os.hostname(),
                    platform: os.platform()
                }));

                this.emit('client-connected');
            });

            return true;
        } catch (e) {
            console.error('[WiFi-Sync] Failed to start server:', e);
            return false;
        }
    }

    private _handleMessage(ws: WebSocket, data: any) {
        try {
            const msg = JSON.parse(data.toString());
            console.log(`[WiFi-Sync] Received: ${msg.type}`);

            switch (msg.type) {
                case 'handshake':
                    ws.send(JSON.stringify({
                        type: 'handshake-ack',
                        deviceId: this.deviceId,
                        hostname: os.hostname(),
                        platform: os.platform()
                    }));
                    break;

                case 'execute-command':
                    this._handleCommand(ws, msg);
                    break;

                case 'clipboard-sync':
                    if (msg.text) {
                        clipboard.writeText(msg.text);
                        this.emit('clipboard-received', msg.text);
                    }
                    break;

                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;
            }
        } catch (e) {
            console.error('[WiFi-Sync] Error parsing message:', e);
        }
    }

    private async _handleCommand(ws: WebSocket, msg: any) {
        const { commandId, command, args } = msg;

        // Forward to main process via event
        this.emit('command', {
            commandId,
            command,
            args,
            sendResponse: (responseBody: any) => {
                ws.send(JSON.stringify({
                    type: 'command-response',
                    commandId,
                    ...responseBody
                }));
            }
        });
    }

    public getLocalIp(): string {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            const ifaceEntry = interfaces[name];
            if (!ifaceEntry) continue;
            for (const iface of ifaceEntry) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
        return '127.0.0.1';
    }

    public getConnectUri(): string {
        return `comet-ai://connect?ip=${this.getLocalIp()}&port=${this.port}&device=${this.deviceId}`;
    }

    public stop() {
        if (this.wss) {
            this.wss.close();
            this.wss = null;
        }
    }
}

let wifiSyncInstance: WiFiSyncService | null = null;
export function getWiFiSync(port?: number): WiFiSyncService {
    if (!wifiSyncInstance) {
        wifiSyncInstance = new WiFiSyncService(port);
    }
    return wifiSyncInstance;
}
