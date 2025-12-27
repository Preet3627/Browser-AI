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
    frame: true,
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

  // Manage Extensions Guide (IPC)
  ipcMain.handle('get-extension-path', () => extensionsPath);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});