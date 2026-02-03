# # 🌟 Comet AI Browser

<div align="center">

![Comet AI Browser](https://raw.githubusercontent.com/Preet3627/Browser-AI/refs/heads/main/comet-browser/icon.ico)

**The World's Most Advanced Privacy-First AI Browser**

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Android%20%7C%20iOS-blue)]()
[![Version](https://img.shields.io/badge/Version-0.1.5-green)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

[Features](#-features) • [Download](#-download) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

***

## 🚀 Project Status

Comet AI Browser is currently in **v0.1.5**.

- ✅ Windows (Electron): Installable and usable  
- 🧪 Mobile (React Native): Under active development  
- 🧪 macOS & Linux: Desktop builds in development  
- 🧪 Advanced features (phone control, full P2P suite, etc.): Being implemented step by step  

***

## 🚀 What Makes Comet Special?

Comet AI Browser is the **first browser** to combine:

- 🤖 Offline AI with automatic cloud fallback  
- 🔒 Military-grade encryption (AES-256)  
- 📁 P2P file sync without cloud storage  
- 📞 Phone call control from desktop  
- 🔐 Auto OTP verification across devices  
- 🗂️ 50+ tabs with custom sounds per tab  
- 🌐 Cross-device sync for everything  

**No tracking. No telemetry. Your data, your control.**

***

## ✨ Features

### 🗂️ Advanced Tab Management

- 50+ tabs simultaneously on desktop and mobile  
- Custom sound per tab with volume control and mute options  
- Background execution – keep tabs active when not visible  
- Priority system – High / Normal / Low priority tabs  
- Memory optimization – auto-close low-priority tabs  
- Visual tab manager – grid view with badges  
- Tab-specific settings – configure each tab independently  

### 🤖 Intelligent AI Assistant

- Smart mode switching – automatically switches between cloud and offline AI  
- Offline chatbot – works without internet (target <50 ms response time)  
- Full-screen mode – immersive chat interface like Perplexity / ChatGPT  
- Export conversations – save as `.txt` or `.pdf`  
- Math & Science – render equations, subscripts, chemistry formulas  
- Any AI provider – OpenAI, Gemini, Claude, or local models  
- Any model – `gpt-4o`, `gemini-3.0-pro`, `claude-3-opus`, etc.  

### 🤖 AI Agency & Autonomous Navigation

Comet AI is not just a chatbot; it's an **Autonomous Web Agent**. It has the ability to take actions within the browser based on your natural language instructions.

- **Direct Navigation**: Ask "Go to YouTube" or "Open Google", and the AI will use `[NAVIGATE]` to change your URL.
- **Smart Search**: Say "Search for the latest JEE news", and the AI will use `[SEARCH]` to find information using your default engine.
- **UI Control**: Commands like "Switch to dark mode" or "Change theme to light" are handled via `[SET_THEME]`.
- **Workspace Orchestration**: Tell the AI to "Open the media lab" or "Go to dev mode", and it will use `[OPEN_VIEW]` to switch interfaces.
- **History & Control**: Commands like "go back", "reload this page", or "go forward" are executed instantly.

#### Action Commands (For Developer Interest):
The AI communicates with the browser using structured tags:
- `[NAVIGATE: url]`
- `[SEARCH: query]`
- `[SET_THEME: dark|light|system]`
- `[OPEN_VIEW: view_name]`
- `[RELOAD]`, `[GO_BACK]`, `[GO_FORWARD]`

### 📁 P2P File Sync (No Cloud!)

- WebRTC-based direct device-to-device transfer  
- Folder selection – choose exactly what to sync  
- File type filtering – images, PDFs, documents, or all  
- Automatic sync – background synchronization  
- Multi-OS support – Windows ↔ macOS ↔ Linux ↔ Android ↔ iOS (design target)  
- No cloud storage – your data never leaves your devices  
- Progress tracking – real-time sync progress  

### 📞 Phone Call Control

- Answer / reject calls from desktop via Bluetooth  
- Make calls from desktop  
- Mute / unmute control  
- Hold / resume calls  
- Desktop notifications for incoming calls  
- Battery monitoring – see phone battery level  

> Note: Phone control is under active development in the current beta.

### 👥 Contact Sync

- Import device contacts – access phone contacts  
- Cross-device sync – available on all devices  
- Search contacts – find by name, phone, email  
- Add / edit contacts – manage from any device  
- Auto-sync – background synchronization  
- Encrypted sync – privacy-first  

### 🔐 Automatic OTP Verification

- SMS OTP capture – auto-detect codes in SMS  
- Email OTP capture – monitor emails for codes  
- Auto-fill – automatically fill OTP input fields  
- Cross-device sync – share OTPs across devices  
- Service detection – identify Google, Bank, Facebook, etc.  
- Desktop notifications – see OTPs on all devices  
- Auto-cleanup – remove old OTPs after 10 minutes  

### 🔒 Military-Grade Security

- AES-256 encryption – all passwords encrypted locally  
- Zero-knowledge architecture – your master key never leaves your device  
- Secure vault – password manager with Excel import  
- Privacy-first – no tracking, no telemetry  
- Sandboxed extensions – Chrome extensions run isolated  
- End-to-end encryption – for all synced data  

### 📄 Advanced PDF Workspace

- OCR text extraction – extract text from images (Tesseract.js)  
- Zoom & Rotate – 50%–300% zoom, 90° rotation  
- Annotations – draggable, editable notes  
- Export tools – save annotated PDFs  

### 🧩 Chrome Extension Support

- Full compatibility – load Chrome extensions seamlessly  
- Easy installation – drop into extensions folder  
- Runtime loading – auto-load on startup  
- Settings guide – built-in instructions  

### 🌐 Model Context Protocol (MCP)

- Secure AI-to-data – connect AI to databases without cloud  
- Built-in filesystem MCP – access local files securely  
- Custom servers – PostgreSQL, MySQL, or custom  
- Privacy-preserving – only relevant context shared  

### 🎨 Native OS Experience

- Frameless design – custom title bar with native controls  
- Platform optimization – looks native on every OS  
- Translucent effects – macOS-style vibrancy (planned)  
- Responsive UI – desktop, tablet, and mobile optimized  

### 📱 Cross-Platform

- Desktop – Windows (Electron) – **v0.1.5** available  
- Desktop – macOS & Linux (Electron) – **under development**  
- Mobile – Android, iOS (React Native) – **under development**  
- Web – Progressive Web App (Next.js) – **in progress**  
- Sync – unified data model across devices (design target)  

### ⚙️ Advanced Settings

- Chrome-style dropdown – quick access to settings  
- Tab management – visual manager with create / switch / close  
- Customizable UI – sidebar position, width, theme  
- Extension manager – view and configure extensions  

### 🗄️ Automatic Database Setup

- SQL table generation – auto-creates required tables  
- MySQL / MariaDB – full support  
- Cross-device sync – bookmarks, history, passwords, tabs  
- Conflict resolution – smart merge strategies  

***

## 📦 Download

### Desktop

| Platform | Download | Status | Size |
|----------|----------|--------|------
| 🪟 **Windows** | [Download v0.1.5 (.exe)](https://github.com/Preet3627/Browser-AI/releases/download/Comet-Browser/Comet.Browser.Setup.0.1.5.exe) | ✅ Available | ~150 MB |
| 🍎 **macOS** | Coming soon | 🧪 In development | – |
| 🐧 **Linux** | Coming soon | 🧪 In development | – |

### Mobile

> Mobile apps (Android & iOS) are under active development. APK / TestFlight links will be added in upcoming releases.

| Platform | Download | Status |
|----------|----------|--------|
| 🤖 **Android** | Coming soon | 🧪 In development |
| 📱 **iOS** | Coming soon | 🧪 In development |

***

## 🚀 Quick Start

### Desktop (Electron)

```bash
# Clone the repository
git clone https://github.com/Preet3627/Browser-AI.git
cd Browser-AI/comet-browser

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Edit .env.local with your API keys
# GEMINI_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here
# CLAUDE_API_KEY=your_key_here

# Run development server
npm run dev

# In another terminal, start Electron
npm run electron-start

# Build for production
npm run build
npm run build-electron
```

### Mobile (React Native)

```bash
cd ../CometBrowserMobile

# Install dependencies
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

> Note: Mobile apps are work‑in‑progress; some features may be stubbed or experimental.

***

## 🔧 Configuration

### Environment Variables

Create `.env.local` in `Browser-AI/comet-browser/`:

```env
# AI Providers (at least one required for cloud AI)
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
CLAUDE_API_KEY=your_claude_key

# App Branding
NEXT_PUBLIC_APP_NAME=Comet
NEXT_PUBLIC_APP_VERSION=0.1.5

# Database (Optional - for sync)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=comet_browser

# Firebase (Optional - for admin portal)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
```

### Chrome Extensions

1. Open **Settings > Extensions** in Comet  
2. Click **“View Extensions Dir”**  
3. Copy your extension folder to the revealed directory  
4. Restart Comet Browser  

### Database Setup

**Option 1: Automatic (Recommended)**

```javascript
await window.electronAPI.initDatabase({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'comet_browser'
});
```

**Option 2: Environment Variables**

Set `MYSQL_*` variables in `.env.local`.

***

## 📖 Documentation

### Core Guides

- **Features Guide** – Complete feature documentation (FEATURES.md)  
- **Cross-Device Features** – P2P sync, phone control, OTP (CROSS_DEVICE_FEATURES.md)  
- **Tab Management** – Advanced tab features (TAB_MANAGEMENT.md)  
- **Setup Guide** – Detailed setup instructions (SETUP-COMET.TXT)  

### API Reference

- Tab Manager API – Tab creation, switching, priorities  
- P2P Sync API – File synchronization  
- Phone Control API – Call management  
- OTP Service API – OTP verification  

***

## 🎯 Usage Examples

### Tab Management

```typescript
import { getTabManager } from '@/lib/AdvancedTabManager';

const tabManager = getTabManager();

// Create new tab
const tabId = tabManager.createTab('https://example.com');

// Set custom sound
tabManager.setTabSound(tabId, '/notification.mp3', 0.8, true);

// Keep alive in background
tabManager.setKeepAlive(tabId, true);

// Set priority
tabManager.setTabPriority(tabId, 'high');

// Switch to tab
tabManager.switchToTab(tabId);
```

### P2P File Sync

```typescript
import { getP2PSync } from '@/lib/P2PFileSyncService';

const sync = getP2PSync('device-123');

// Add folder to sync
const folderId = sync.addSyncFolder({
  localPath: '/Users/me/Documents',
  remotePath: '/storage/emulated/0/Documents',
  deviceId: 'phone-456',
  autoSync: true,
  syncTypes: ['images', 'pdfs'],
});

// Sync folder
const result = await sync.syncFolder(folderId);
console.log(`Synced ${result.filesSynced} files`);
```

### Phone Call Control

```typescript
import { getPhoneControl } from '@/lib/PhoneCallControlService';

const phoneControl = getPhoneControl();

// Scan for devices
const devices = await phoneControl.scanForDevices();

// Connect to phone
await phoneControl.connectDevice(devices[0].id);

// Answer incoming call
await phoneControl.answerCall(callId);

// Make outgoing call
const callId = await phoneControl.makeCall('+1234567890');
```

### OTP Auto-Verification

```typescript
import { getOTPService } from '@/lib/OTPVerificationService';

const otpService = getOTPService();

// Start listening
await otpService.startSMSListener();

// Listen for new OTPs
otpService.addListener((otp) => {
  console.log(`New OTP: ${otp.code} from ${otp.service}`);
  // Auto-filled automatically!
});
```

***

## 🔐 Security & Privacy

### Our Commitment

- No Tracking – no browsing analytics  
- Local-First – all data stored locally by default  
- Encrypted Storage – AES-256 for sensitive data  
- Open Source – transparent, auditable code  
- Zero-Knowledge – your keys never leave your device  

### Security Features

- End-to-end encryption for passwords and sync  
- Sandboxed extension execution  
- Content Security Policy headers  
- Secure IPC communication  
- WebRTC with DTLS encryption for P2P  
- Regular security audits (planned)  

### Privacy Features

- No telemetry or analytics  
- No cloud storage for P2P sync  
- Local AI processing option  
- Encrypted database storage  
- Permission-based access control  

***

## 📊 Performance

| Metric         | Desktop Target | Mobile Target |
|----------------|----------------|---------------|
| Startup Time   | <2 s           | <3 s          |
| Memory Usage   | ~150 MB        | ~120 MB       |
| Memory per Tab | ~50 MB         | ~40 MB        |
| Max Tabs       | 50             | 50            |
| P2P Transfer   | ~10 MB/s       | ~8 MB/s       |
| OTP Detection  | <100 ms        | <100 ms       |
| Tab Switch     | <50 ms         | <100 ms       |
| Offline AI     | <50 ms         | <50 ms        |
| Cloud AI       | 1–3 s          | 1–3 s         |

> Actual performance may vary depending on hardware and network.

***

## 🏗️ Architecture

### Desktop (Electron + Next.js)

```text
Browser-AI/
├── comet-browser/
│   ├── src/
│   │   ├── app/              # Next.js app router
│   │   ├── components/       # React components
│   │   ├── lib/              # Core libraries
│   │   │   ├── AdvancedTabManager.ts
│   │   │   ├── P2PFileSyncService.ts
│   │   │   ├── PhoneCallControlService.ts
│   │   │   ├── ContactSyncService.ts
│   │   │   ├── OTPVerificationService.ts
│   │   │   ├── Security.ts
│   │   │   └── ...
│   │   ├── store/            # Zustand state
│   │   └── types/            # TypeScript types
│   ├── electron.js           # Electron main process
│   ├── preload.js            # Electron preload
│   └── package.json
```

### Mobile (React Native)

```text
Browser-AI/
└── CometBrowserMobile/
    ├── App.tsx               # Main app component
    ├── android/              # Android native code
    ├── ios/                  # iOS native code
    └── package.json
```

***

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository  
2. Create a feature branch: `git checkout -b feature/amazing-feature`  
3. Commit your changes: `git commit -m "Add amazing feature"`  
4. Push to the branch: `git push origin feature/amazing-feature`  
5. Open a Pull Request  

Please see `CONTRIBUTING.md` (when added) for detailed guidelines.

***

## 🗺️ Roadmap

### v0.1.5

- Stabilize Windows build  
- Implement core P2P sync in production  
- Basic phone call control integration  
- OTP service MVP  

### v0.1.5

- macOS & Linux installers  
- Android APK (public beta)  
- iOS TestFlight beta  
- Privacy dashboard  

### v1.1.2

- Stable cross-platform release  
- Full documentation  
- Video tutorials  
- Plugin marketplace  
- Enterprise features  

***
---

## 🧑‍💻 About the Creator & Setup

Comet AI Browser is built by an 11th‑grade student preparing for **JEE** who got inspired after seeing Perplexity’s Comet AI browser and wondered, “Can I build something like this myself?”.  
The first working version of this project was hacked together in **under 6 hours** using the Gemini CLI free API tier while managing JEE study alongside development.

### 💻 Development Machine

Comet AI Browser is being developed on a very modest setup:

- **Desktop**: Acer Veriton  
- **Monitor**: 60 Hz VA Acer monitor  
- **RAM**: 8 GB  
- **Storage**: 256 GB SATA SSD  
- **CPU**: Intel Core i5 (U‑series)  
- **GPU**: Intel UHD integrated graphics  

Despite this basic hardware, the goal is to design a browser that feels fast, privacy‑first, and AI‑native, even on non‑flagship machines.

### 🚧 Long‑Term Vision

- Current version (**v0.1.5**) uses **Electron + Next.js** and **React Native** for rapid cross‑platform prototyping.  
- After finishing 12th, the plan is to **rebuild Comet on a C++ + Chromium engine** for a fully native, high‑performance browser core.  
- The roadmap is to evolve this from an experimental AI browser into a serious, open‑source alternative focused on privacy, performance, and offline‑first AI.

---


## 💬 Community & Support

- GitHub Issues – <https://github.com/Preet3627/Browser-AI/issues>  
- Discussions – <https://github.com/Preet3627/Browser-AI/discussions>  
- YouTube – <https://youtube.com/@latestinssan?si=r8FJ3VswSYvrGo9C>  

***

## 📝 License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

***

<div align="center">

**Built with ❤️ for privacy and performance**

[⬆ Back to Top](#-comet-ai-browser)

***

**Comet AI Browser** – *The Future of Browsing is Here*

</div># ☄️ Comet Browser (v0.1.5 Stable)
Made in India 🇮🇳
### The Intelligent Workspace for the Future

**Built by a solo high school developer (Latestinssan)**, running on extreme constraints (i3 4th Gen, 4GB RAM), yet designed to outperform modern browsers in productivity and intelligence.

**Comet** is a custom-hardened Chromium environment designed for architectural efficiency, native AI orchestration, and hardware-accelerated privacy.

---

## 🚀 Vision & Engine Highlights

*   **Native AI Orchestration**: Seamlessly toggle between Google Gemini, GPT-4o, Claude 3.5, Groq, and **Local Ollama (Deepseek R1)**.
*   **Perplexity-Style RAG**: A persistent local vector database indexing your sessions for "Perplexity-style" answers that understand your personal context.
*   **Low-End Optimization**: Validated on 4GB RAM machines using aggressive tab suspension and offloading technology (handle 50+ tabs on a potato PC).
*   **Absolute Privacy**: Zero telemetry. Integrated hardware-level isolation for every tab and extension.

---

## 🚀 Core Features (v0.1.4 Combined Dashboard)

### 🧠 Intelligence & RAG System
*   **Neural Analysis Sidebar**: A context-aware sidebar that "reads" the page with you. Ask it to summarize, extract data, or explain complex concepts.
*   **Persistent Neural Memory**: Uses **TensorFlow.js** to build local embeddings of your history. Your intelligence persists across sessions on your local disk.
*   **Advanced AI Search**: Predicts and synthesizes search results using native neural logic.
*   **OCR & Vision Engine**: Real-time screenshot analysis and text extraction powered by **Tesseract.js**.

### 🎨 Design & Workspace
*   **Vibrant Glassmorphic UI**: A premium, hardware-accelerated interface built with **Framer Motion** and **Tailwind 4**.
*   **Media Studio & PDF Workspace**: Native environments for intense media tasks and document workflows without leaving the browser.
*   **Coding Mode**: A dedicated view for developers with real-time terminal feedback and AI-assisted debugging.
*   **Custom Sidebar Rail**: Instant access to Docs, Shopping, Workspace, and Dev tools via a sleek, minimalist rail.

### 🧩 Extension & Plugin Management
*   **Comprehensive Dashboard**: Manage all your extensions from a single premium UI.
*   **Manual Sideloading**: Drop extension folders (with `manifest.json`) into the `UserData` directory to activate them instantly.
*   **Chrome Web Store**: Integrated support to browse and install plugins directly from the official store.
*   **Direct Uninstallation**: Safely remove and scrub extension files with one click.

### 🔐 Security & Synchronization
*   **Secure Auth Portal**: Real Google Authentication via the custom `browser.ponsrischool.in` portal, relayed via deep links (`comet-browser://`).
*   **P2P Direct Sync**: Sync tabs and clipboards between devices using **WebRTC**—no cloud required.
*   **End-to-End Encryption**: Your sync data is protected by a local passphrase. Developers cannot see your data.
*   **Ad-Blocker Native**: High-performance, low-latency ad and tracker blocking included in the kernel.

---

## 🔬 Specialized AI Capabilities

Comet's AI transforms how you interact with specialized content:

*   **Code & Markdown**: Paste snippets for instant refactoring, explanation, or conversion with full syntax highlighting.
*   **Math & Chemistry**: Render complex LaTeX equations and chemical formulas directly in the chat interface.
*   **Fonts & Design**: Use the Vision engine to identify fonts from images and get design recommendations based on page aesthetics.

---

## 🛠️ The Story Behind Comet: Challenges & Solutions

Building a browser is considered "impossible" for a solo developer. Doing it while studying for high school exams on a laggy i3 laptop? **That's insanity.**

### 1. The "Frozen UI" Crisis (The Drag Region Paradox)
*   **Challenge**: Our premium title bar frequently made buttons like "Close" and "Login" unclickable.
*   **Solution**: We discovered that Electron's `-webkit-app-region: drag` consumes all click events. We implemented a surgical CSS mask, wrapping every interactive element in `.no-drag-region` while keeping the title bar draggable.

### 2. The Google OAuth Sandbox Barrier
*   **Challenge**: Google blocks browser shells (like Electron/BrowserView) from using OAuth for security.
*   **Solution**: We engineered a custom authentication relay (`browser.ponsrischool.in`). The app opens your system's default browser to handle the secure login, then captures the identity token via a **Custom Protocol Handler** to sign you into Comet instantly.

### 3. IPC IPC Consistency (The Bridge stability)
*   **Challenge**: Inter-Process Communication (IPC) would often break, causing the UI to loop or crash with "Missing Function" errors.
*   **Solution**: We built a **Unified Global Preload Proxy**. This resilient bridge manages listeners dynamically, ensuring that the React frontend and Electron backend are always in sync, even after multiple tab reloads.

### 4. Native Windows local AI (No WSL!)
*   **Challenge**: Most AI browsers force Windows users into WSL or Docker environments.
*   **Solution**: We treated **Ollama as a native Windows kernel service**. Comet spawns `ollama.exe` directly via `child_process`, injects custom `Modelfiles` programmatically, and pipes the output stream to the UI for a zero-config local AI experience.

---

## 🚀 AI Deployment (Native Windows Ollama)

**Setup in 3 steps:**
1.  Download **Ollama for Windows** from [ollama.com](https://ollama.com/download/windows).
2.  Install it normally.
3.  Launch Comet. It will automatically detect Ollama and allow you to pull models like `deepseek-r1:1.5b`.

---

## 📦 Quick Start
```bash
# Clone the repository
git clone https://github.com/Latestinssan/comet-browser.git

# Install dependencies
npm install

# Run (Dev Mode)
npm run dev

# Build for Windows
npm run build-electron
```

---

## 📄 Licensing & Appreciation
Comet is built with open-source technologies including **Electron, Next.js, TensorFlow.js, and Framer Motion**. We are grateful to the global dev community. Full details in [Licence.md](Licence.md).

---
*Dedicated to the builders who code on potato PCs. Hardware is a constraint, not a limit.* ❤️