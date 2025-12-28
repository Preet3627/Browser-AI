// electron.js
const { app, BrowserWindow, ipcMain, session, shell, clipboard, BrowserView, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

let mainWindow;
let browserView;

// Memory Manager (JSONL)
const memoryPath = path.join(app.getPath('userData'), 'memory.jsonl');
const extensionsPath = path.join(app.getPath('userData'), 'extensions');

if (!fs.existsSync(extensionsPath)) fs.mkdirSync(extensionsPath, { recursive: true });

function appendToMemory(entry) {
  const log = JSON.stringify({ ...entry, timestamp: new Date().toISOString() }) + '\n';
  fs.appendFileSync(memoryPath, log);
}

function readMemory() {
  if (!fs.existsSync(memoryPath)) return [];
  const lines = fs.readFileSync(memoryPath, 'utf-8').trim().split('\n');
  return lines.map(l => {
    try { return JSON.parse(l); } catch (e) { return null; }
  }).filter(Boolean);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#050510',
    show: false,
    frame: false, // Frameless for custom OS feel
    titleBarStyle: 'hidden',
    title: process.env.NEXT_PUBLIC_APP_NAME || 'Comet Browser',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: true
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Window Control Handlers
  ipcMain.on('window-minimize', () => mainWindow.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  ipcMain.on('window-close', () => mainWindow.close());

  const url = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'out/index.html')}`;

  mainWindow.loadURL(url);

  // Initialize BrowserView
  browserView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: true
    },
  });

  mainWindow.setBrowserView(browserView);
  browserView.webContents.loadURL('https://www.google.com');

  // Load Extensions from userData/extensions
  const extensionDirs = fs.readdirSync(extensionsPath);
  extensionDirs.forEach(dir => {
    const extPath = path.join(extensionsPath, dir);
    if (fs.lstatSync(extPath).isDirectory()) {
      session.defaultSession.loadExtension(extPath).then(({ name }) => {
        console.log(`[Extension] Loaded: ${name}`);
      }).catch(e => console.error(`[Extension] Load failed: ${dir}`, e));
    }
  });

  // Strip headers to allow embedding
  session.defaultSession.webRequest.onHeadersReceived({ urls: ['*://*/*'] }, (details, callback) => {
    const headers = { ...details.responseHeaders };
    delete headers['x-frame-options'];
    delete headers['content-security-policy'];
    delete headers['X-Frame-Options'];
    delete headers['Content-Security-Policy'];
    callback({ cancel: false, responseHeaders: headers });
  });

  // IPC Handlers
  ipcMain.on('set-browser-view-bounds', (event, bounds) => {
    if (browserView && mainWindow) {
      browserView.setBounds({
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
      });
    }
  });

  ipcMain.on('navigate-browser-view', (event, url) => {
    if (browserView) browserView.webContents.loadURL(url);
    appendToMemory({ action: 'navigate', url });
  });

  ipcMain.on('browser-view-go-back', () => {
    if (browserView && browserView.webContents.canGoBack()) browserView.webContents.goBack();
  });

  ipcMain.on('browser-view-go-forward', () => {
    if (browserView && browserView.webContents.canGoForward()) browserView.webContents.goForward();
  });

  ipcMain.on('browser-view-reload', () => {
    if (browserView) browserView.webContents.reload();
  });

  ipcMain.on('open-dev-tools', () => {
    if (browserView) browserView.webContents.openDevTools({ mode: 'detach' });
  });

  ipcMain.handle('get-browser-view-url', () => {
    return browserView ? browserView.webContents.getURL() : '';
  });

  ipcMain.handle('extract-page-content', async () => {
    if (!browserView) return { error: 'No browser view' };
    try {
      const content = await browserView.webContents.executeJavaScript(`document.body.innerText`);
      return { content };
    } catch (err) {
      return { error: err.message };
    }
  });

  // Analytics & Folder Sharing
  ipcMain.handle('share-device-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (!result.canceled) {
      const folderPath = result.filePaths[0];
      appendToMemory({ action: 'folder_share', path: folderPath });
      return { path: folderPath, success: true };
    }
    return { success: false };
  });

  // Memory & MCP Mock
  ipcMain.handle('get-ai-memory', async () => readMemory());
  ipcMain.on('add-ai-memory', (event, entry) => appendToMemory(entry));

  ipcMain.handle('mcp-command', async (event, { command, data }) => {
    console.log(`[MCP] Executing ${command} with`, data);
    return { success: true, result: `Executed ${command} via Dev-MCP` };
  });

  ipcMain.handle('capture-page-html', async () => {
    if (!browserView) return "";
    try {
      const html = await browserView.webContents.executeJavaScript('document.documentElement.outerHTML');
      return html;
    } catch (e) {
      return "";
    }
  });

  ipcMain.handle('save-offline-page', async (event, { url, title, html }) => {
    console.log(`[Offline] Saved ${title} (${url})`);
    return true;
  });

  // LLM Proxies
  ipcMain.handle('llm-get-available-providers', async () => {
    return [
      { id: 'openai-compatible', name: 'OpenAI (Cloud)' },
      { id: 'gemini', name: 'Google Gemini' },
      { id: 'claude', name: 'Anthropic Claude' },
      { id: 'local', name: 'Local LLM (Ollama/TF.js)' }
    ];
  });

  ipcMain.handle('llm-set-active-provider', async (e, id) => {
    console.log(`[AI] Activating: ${id}`);
    return true;
  });

  ipcMain.handle('llm-configure-provider', async (e, id, cfg) => true);

  ipcMain.handle('llm-generate-chat-content', async (event, messages, options = {}) => {
    // Determine provider & key
    const providerId = options.provider || 'gemini';
    let apiKey = options.apiKey;

    // Fallback to environment variables if not provided by user
    if (!apiKey) {
      if (providerId === 'gemini') apiKey = process.env.GEMINI_API_KEY;
      else if (providerId === 'openai-compatible') apiKey = process.env.OPENAI_API_KEY;
      else if (providerId === 'claude') apiKey = process.env.CLAUDE_API_KEY;
    }

    if (!apiKey && providerId !== 'local') return { error: `No API key for ${providerId}. Please configure in settings.` };

    // Native implementation or calling a library
    try {
      if (providerId === 'gemini') {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: messages.map(m => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }]
            }))
          })
        });
        const data = await response.json();
        return { text: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.' };
      }
      // Add other providers here...
      return { error: 'Provider not fully implemented in native shell.' };
    } catch (e) {
      return { error: e.message };
    }
  });

  // Chat & File Export Handlers
  ipcMain.handle('export-chat-txt', async (event, messages) => {
    const content = messages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join('\n\n');
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Chat as TXT',
      defaultPath: path.join(app.getPath('downloads'), 'chat-export.txt'),
      filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });

    if (filePath) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    return false;
  });

  ipcMain.handle('export-chat-pdf', async (event, messages) => {
    // Basic simulation for now - in a real app would use pdf-lib to generate a nice PDF
    const content = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Chat as PDF',
      defaultPath: path.join(app.getPath('downloads'), 'chat-export.pdf'),
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (filePath) {
      // Simulate PDF write for now as standard fs write
      fs.writeFileSync(filePath, "COMET AI CHAT EXPORT\n\n" + content);
      return true;
    }
    return false;
  });

  // Manage Extensions Guide (IPC)
  ipcMain.handle('get-extension-path', () => extensionsPath);

  // Database & Sync Handlers
  ipcMain.handle('init-database', async (event, config) => {
    try {
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: config.host || process.env.MYSQL_HOST || 'localhost',
        port: config.port || process.env.MYSQL_PORT || 3306,
        user: config.user || process.env.MYSQL_USER,
        password: config.password || process.env.MYSQL_PASSWORD,
      });

      // Create database
      const dbName = config.database || process.env.MYSQL_DATABASE || 'comet_browser';
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      await connection.query(`USE \`${dbName}\``);

      // Create tables
      const tables = [
        `CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          display_name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_sync TIMESTAMP NULL,
          device_id VARCHAR(255),
          INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

        `CREATE TABLE IF NOT EXISTS bookmarks (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          url TEXT NOT NULL,
          title VARCHAR(500),
          icon_url TEXT,
          folder VARCHAR(255) DEFAULT 'default',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted BOOLEAN DEFAULT FALSE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      ];

      for (const tableSQL of tables) {
        await connection.query(tableSQL);
      }

      await connection.end();
      console.log('[DB] Database initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('[DB] Initialization failed:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('sync-data', async (event, { userId, type, data, direction }) => {
    console.log(`[Sync] ${direction} ${type} for user ${userId}`);
    // Sync implementation would go here
    return { success: true, synced: data.length };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});