# 🚀 COMET-AI — Complete Product Overview
**Version 2.0 | February 2026 | Enterprise-Grade AI-Powered Cross-Platform Browser**

---

## 📊 Executive Summary

**Comet-AI** is a revolutionary **agentic desktop browser** that combines:
- 🌐 **Next.js + Electron** web browser (Windows, macOS, Linux)
- 📱 **Flutter companion** mobile app (iOS, Android)
- 🤖 **Multi-AI backbone** (Gemini, Claude, Groq, OpenAI)
- 🔧 **Desktop automation** (RobotJS, Tesseract OCR, MCP)
- 🔐 **Enterprise security** (permission gating, audit logging, encrypted storage)

**Use case:** AI that doesn't just chat — it *acts* on your desktop and web. Click buttons across apps, automate workflows, search/summarize web content, execute MCP tools, all under explicit permission control.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMET-AI ECOSYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            ELECTRON (Desktop) - Windows/Mac/Linux         │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │  Next.js Browser UI + Modern Web Interface         │   │   │
│  │  │  • Tabbed browsing  • AI sidebar chat              │   │   │
│  │  │  • Settings/Profiles  • Plugin manager             │   │   │
│  │  │  • Downloads/History  • Bookmarks                  │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  │                          ↑↓ (IPC Bridge)                   │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │  Electron Main Process                             │   │   │
│  │  │  ├─ AI Engine (Gemini/Groq/OpenAI/Claude)         │   │   │
│  │  │  ├─ RobotJS (cross-app clicking/typing)           │   │   │
│  │  │  ├─ Tesseract OCR (screen vision + click targets)  │   │   │
│  │  │  ├─ MCP Servers (FileSystem, NativeApp, RAG)       │   │   │
│  │  │  ├─ WebSocket Bridge Server (Flutter sync)         │   │   │
│  │  │  ├─ Security Layer (permissions + audit log)       │   │   │
│  │  │  └─ Native APIs (system tray, menu bar, etc.)      │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FLUTTER (Mobile) - iOS/Android                           │   │
│  │  ├─ AI chat interface                                     │   │
│  │  ├─ Desktop control (trigger desktop AI actions)          │   │
│  │  ├─ Screen context (see what's on desktop)                │   │
│  │  └─ Sync with desktop (tabs, history, bookmarks)          │   │
│  │           ↕ (WebSocket @ 127.0.0.1:9876)                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  EXTERNAL SERVICES (with API key auth)                    │   │
│  │  ├─ Google Gemini / Groq  / OpenAI  / Anthropic (LLMs)   │   │
│  │  ├─ Brave / Tavily / SerpAPI (web search)                │   │
│  │  ├─ Gmail / GitHub / Notion / Slack (MCP servers)        │   │
│  │  └─ LanceDB (local vector DB for RAG)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Features Matrix

### 1️⃣ **Browser & Navigation**
| Feature | Status | Details |
|---------|--------|---------|
| **Tab Management** | ✅ Full | Create, close, switch, reorder tabs |
| **Multi-Tab Display** | ✅ Full | Side-by-side, tabbed interface |
| **History & Bookmarks** | ✅ Full | Persistent SQLite storage |
| **Search Engines** | ✅ Full | Google, Bing, DuckDuckGo, Brave |
| **Extensions/Plugins** | ✅ Full | Plugin manager UI |
| **Incognito Mode** | ✅ Full | Private browsing |
| **Download Manager** | ✅ Full | Download history, folder access |

### 2️⃣ **AI Integration**
| Feature | Status | Model Options |
|---------|--------|----------------|
| **Chat Sidebar** | ✅ Full | Gemini 2.5 Pro/Flash, Claude, Groq, OpenAI |
| **Web Search** | ✅ Full | Brave, Tavily, SerpAPI |
| **RAG (Context)** | ✅ Full | LanceDB local vector DB |
| **Screen Understanding** | ✅ Full | Claude Sonnet 4.6 vision |
| **Natural Language Commands** | ✅ Full | [NAVIGATE:], [SEARCH:], [CLICK:] |
| **Streaming Responses** | ✅ Full | Real-time chunk delivery |

### 3️⃣ **Desktop Automation**
| Feature | Status | Capability |
|---------|--------|------------|
| **RobotJS Clicking** | ✅ Full | Click any app, any button (coordinates) |
| **RobotJS Typing** | ✅ Full | Type text, passwords into any field |
| **RobotJS Keyboard** | ✅ Full | Send hotkeys (Cmd+C, Ctrl+Z, etc.) |
| **RobotJS Scrolling** | ✅ Full | Scroll in any window |
| **Tesseract OCR** | ✅ Full | Screen → text extraction → click targets |
| **Screen Capture** | ✅ Full | 4K-ready, multi-display support |
| **Cross-App Control** | ✅ Full | Works with ANY desktop app |

### 4️⃣ **Security & Permissions**
| Feature | Status | Details |
|---------|--------|---------|
| **Permission Gating** | ✅ Full | SQLite permission store, grant/revoke |
| **Audit Logging** | ✅ Full | HMAC-signed action log |
| **Kill Switch** | ✅ Full | Cmd/Ctrl+Shift+Esc emergency abort |
| **User Confirmation** | ✅ Full | Dialog before write/click actions |
| **Rate Limiting** | ✅ Full | 300ms min delay between robot actions |
| **Encrypted Storage** | ✅ Full | Electron safeStorage for API keys |

### 5️⃣ **MCP (Model Context Protocol)**
| Server | Type | Status | Purpose |
|--------|------|--------|---------|
| **Gmail** | Official | ✅ | Read/send/search emails |
| **GitHub** | Official | ✅ | Issues, PRs, code search |
| **Slack** | Official | ✅ | Read channels, post messages |
| **Notion** | Community | ✅ | Pages, databases, blocks |
| **FileSystem** | Desktop NEW | ✅ | Sandboxed file read/write |
| **NativeApp** | Desktop NEW | ✅ | AppleScript/PowerShell |
| **ScreenContext** | Desktop NEW | ✅ | OCR as a tool |
| **Flutter Bridge** | Desktop NEW | ✅ | Control mobile from desktop |

### 6️⃣ **Mobile (Flutter)**
| Feature | iOS | Android | Details |
|---------|-----|---------|---------|
| **AI Chat** | ✅ | ✅ | Chat with Gemini/Groq |
| **Desktop Control** | ✅ | ✅ | Trigger desktop actions |
| **Screen Context** | ✅ | ✅ | See desktop screenshot |
| **Tab/History Sync** | ✅ | ✅ | WebSocket sync |
| **QR Pairing** | ✅ | ✅ | Secure device pairing |
| **Push Notifications** | ⚠️ | ⚠️ | Planned |

### 7️⃣ **Platform Integration**
| Platform | Features |
|----------|----------|
| **macOS** | Dock menu, Touch Bar, Spotlight, Raycast extension, Handoff, Quick Look |
| **Windows** | Jump List, Taskbar buttons, Taskbar progress, Overlay icons |
| **Linux** | System tray, Desktop file, MIME registration, KDE/GNOME/XFCE support |

### 8️⃣ **Advanced Features**
| Feature | Status | Purpose |
|---------|--------|---------|
| **Voice Control** | ✅ | Whisper transcription → AI command |
| **Workflow Recorder** | ✅ | Record actions, replay with trigger |
| **Global Hotkeys** | ✅ | Cmd/Windows+Shift+Space for search |
| **Settings Popup** | ✅ | Separate window system (no z-index conflicts) |
| **Music Visualizer** | ✅ | Minimal compact waveform display |
| **Unified Search** | ✅ | Search apps, WiFi, files, web in one place |

---

## 🎨 User Interface Showcase

### Desktop (Electron)
```
┌─────────────────────────────────────────────────────────┐
│  File  Edit  View  History                          [ _ □ X ] │
│ ◀  ▶  ⟳  🌐 https://example.com     🔍  ⚙️              │
├─────────────────────────────────────────────────────────┤
│ Tab 1  Tab 2  Tab 3 ⊞  + (new tab)                      │
├──────────────────────────────┬──────────────────────────┤
│                              │                          │
│                              │  ✨ COMET AI             │
│     Google search result      │  ─────────────────      │
│     ........................  │                          │
│     ........................  │  What can I help?       │
│                              │                          │
│     [ad banner]              │  💬 Ask me to:           │
│                              │  • Search the web        │
│                              │  • Click buttons         │
│                              │  • Type text             │
│                              │  • Read files            │
│                              │                          │
│                              │  [Send message...]   ✈️  │
│                              │                          │
└──────────────────────────────┴──────────────────────────┘
```

### Settings Panel (Popup Window)
```
┌────────────────────────────────┐
│  SETTINGS              [Close]  │
├────────────────────────────────┤
│ 🔹 Profile                     │
│ 🔹 Privacy & Security          │
│ 🔹 Permissions (Robot/AI)      │
│ 🔹 AI Models                   │
│ 🔹 Extensions                  │
│ 🔹 About                       │
└────────────────────────────────┘
```

### Mobile (Flutter)
```
┌────────────────────────────────┐
│ ☰ COMET-AI          🔗 ⚙️      │
├────────────────────────────────┤
│                                │
│  Comet AI Mobile              │
│  ─────────────────            │
│                                │
│  [Type a message...]           │
│                                │
│  💡 Desktop Actions:            │
│  • Click button on desktop      │
│  • Describe screen              │
│  • Trigger workflow             │
│                                │
└────────────────────────────────┘
```

---

## 🔐 Security Architecture

### Permission Levels (Low → High Risk)
```
READ (see screen)
  ↓
INTERACT (click, scroll)
  ↓
WRITE (type, edit files)
  ↓
EXECUTE (run scripts, send API)
  ↓
SEND (external APIs, email)
```

### Action Gating Pipeline
```
User says: "Click the Pay button"
    ↓
[CLASSIFY] Is this a write/critical action? → YES
    ↓
[PERMISSION CHECK] Does user allow robot actions? → YES
    ↓
[BOUNDS CHECK] Are coordinates on valid display? → YES
    ↓
[RATE LIMIT] Has 300ms passed since last action? → YES
    ↓
[CONFIRM DIALOG] Show user what will happen
    ↓ (User clicks "Approve")
[EXECUTE] RobotJS click (923, 442)
    ↓
[AUDIT LOG] Log action with timestamp + reason
```

### Audit Logging
```sqlite
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY,
  action_type TEXT,
  reason TEXT,
  coordinates TEXT,
  user_approved BOOLEAN,
  timestamp INTEGER,
  hmac_signature TEXT
);
```

---

## 💻 Technical Stack

### Frontend (Renderer)
- **React 19.0.0** — UI framework
- **Next.js 16.1.3** — SSR/SSG
- **TypeScript 5.x** — Type safety
- **Tailwind CSS 4.x** — Styling with custom glassmorphism
- **Framer Motion** — Animations
- **Lucide React** — Icon library
- **Zustand** — State management (lightweight)

### Backend (Electron Main)
- **Electron 32+** — Desktop framework
- **Node.js 20+** — Runtime
- **TypeScript** — Type safety
- **Better-SQLite3** — Local database
- **electron-store** — Config persistence
- **socket.io** — WebSocket server for Flutter bridge

### Native Modules
- **robotjs** — Cross-app mouse/keyboard control
- **tesseract.js** — WASM OCR (screen reading)
- **sharp** — Image preprocessing
- **desktopCapturer** — Electron screen capture API

### AI & LLM Integration
- **@google/generative-ai** — Gemini API
- **groq-sdk** — Groq inference
- **openai** — GPT/Whisper
- **@anthropic-ai/sdk** — Claude vision
- **lancedb** — Vector database for RAG

### Mobile (Flutter)
- **Flutter 3.5+** — Cross-platform mobile
- **Dart 3.10.9** — Language
- **firebase_core** — Backend services
- **socket_io_client** — WebSocket client
- **camera** — Device camera access
- **speech_to_text** — Voice input

### Build & CI/CD
- **electron-builder** — Electron packaging
- **GitHub Actions** — Automated builds
- **gradle 9.3.1** (Android) — Android build system
- **fastlane** (iOS) — iOS deployment

---

## 📈 AI Model Recommendations

### By Task Type

| Task | Recommended Model | Why |
|------|-------------------|-----|
| **Robot Action Planning** | Groq llama-3.3-70b | Sub-200ms response, perfect for rapid decisions |
| **OCR Target Resolution** | Groq llama-3.1-8b-instant | Tiny + instant, just picks from options |
| **Complex Reasoning** | Gemini 2.5 Pro / GPT-5 | Long context, multi-step planning |
| **Screen Vision** | Claude Sonnet 4.6 | Best vision capabilities, safe outputs |
| **Web Search Summary** | Gemini 2.5 Flash | Fast, good at synthesis |
| **Code Generation** | GPT-5 / Claude Sonnet 4.6 | Production-quality code |
| **Voice Transcription** | OpenAI Whisper | 99%+ accuracy |

### Cost Optimization (Feb 2026)
- **Free tier users:** Groq (unlimited with rate limits)
- **Pro users:** Gemini with soft limit
- **Enterprise:** OpenAI GPT-5 + Claude for safety-critical tasks

---

## 🚀 Getting Started

### Installation

**Windows/macOS/Linux:**
```bash
# Download from GitHub Releases or comet-ai.app
# Run installer → Comet-AI launches automatically

# Or build from source:
git clone https://github.com/comet-ai/comet-browser
cd comet-browser
npm install
npm run build
npm run dist:win  # Windows
npm run dist:mac  # macOS
npm run dist:linux # Linux
```

**Mobile (iOS/Android):**
```bash
cd CometBrowserMobile/comet_ai
flutter pub get
flutter build apk --release  # Android
flutter build ios --release  # iOS
```

### First Run
1. Launch Comet-AI
2. Sign in with Google account
3. Add API keys in Settings (Gemini, Groq, OpenAI, etc.)
4. Enable permissions in Privacy & Security
5. (Optional) Scan QR code to pair Flutter mobile app

---

## 📊 Feature Comparison vs. Competitors

| Feature | Comet-AI | Chrome | Edge | Safari | Firefox |
|---------|----------|--------|------|--------|---------|
| **AI Chat Sidebar** | ✅ Full | ❌ | Bing only | ❌ | ❌ |
| **Desktop Automation** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Cross-App Clicking** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Local Vector DB** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Screen Vision AI** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Voice Control** | ✅ Full | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| **Mobile Sync** | ✅ Full | ❌ | ❌ | ✅ iCloud | ❌ |
| **MCP Support** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Workflow Automation** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Privacy-First** | ✅ Full | ⚠️ | ⚠️ | ✅ | ✅ |

---

## 💼 Use Cases

### 1. **Personal Assistant Mode**
> "Search for best flights to Tokyo next month, then show me hotel reviews in Shibuya"
- Executes web searches
- Reads and summarizes results
- Opens booking sites and pre-fills forms

### 2. **Data Researcher**
> "Extract all LinkedIn profiles from this search result, then write summaries for each"
- Captures screen
- OCR extracts links
- Opens each in new tab
- AI writes summary in sidebar
- Exports to CSV

### 3. **Workflow Automation**
> "Run my morning routine: check email, read news, check calendar"
- Recorded workflow plays back
- Clicks Gmail, reads unread messages
- Searches news feed
- Opens Google Calendar
- Summarizes day ahead in sidebar

### 4. **Accessibility**
- Voice control for hands-free browsing
- Screen reader integration
- Large text + high contrast themes
- Keyboard-only navigation

### 5. **Developer**
> "Read this GitHub issue, then implement a fix"
- Opens GitHub PR
- OCR + vision AI understands code diff
- Suggests code changes
- Can execute shell commands via MCP
- Commits and pushes automatically

---

## 📊 Performance Metrics

### Desktop (Electron)
| Metric | Target | Status |
|--------|--------|--------|
| **Startup time** | < 3s | ✅ |
| **Tab open** | < 500ms | ✅ |
| **AI response** | < 500ms (Groq) | ✅ |
| **OCR scan** | < 2s | ✅ |
| **RobotJS click** | < 100ms | ✅ |
| **Memory (idle)** | < 400MB | ✅ |
| **Memory (5 tabs)** | < 800MB | ✅ |

### Mobile (Flutter)
| Metric | Target | Status |
|--------|--------|--------|
| **Startup time** | < 2s | ✅ |
| **Bridge latency** | < 200ms | ✅ |
| **App size (iOS)** | < 120MB | ✅ |
| **App size (Android)** | < 150MB | ✅ |

---

## 🔄 Version History

### v2.0 (February 2026) — Current
- ✅ Desktop automation (RobotJS)
- ✅ Screen vision AI (Claude Sonnet)
- ✅ Tesseract OCR click engine
- ✅ Flutter mobile bridge
- ✅ MCP v2 with desktop servers
- ✅ Voice control
- ✅ Workflow recorder

### v1.8 (January 2026)
- Initial release with chat sidebar
- Web search integration
- Popup window system

### v1.0 (December 2025)
- Beta launch
- Basic browser + AI chat

---

## 🛣️ Roadmap (2026)

### Q1 2026 ✅
- [x] RobotJS automation
- [x] Tesseract OCR
- [x] Flutter bridge
- [x] Voice control

### Q2 2026 📅
- [ ] Browser extensions API
- [ ] Collaborative features (share workflows)
- [ ] Advanced RAG (document upload)
- [ ] Screen annotation tools

### Q3 2026 🎯
- [ ] Vision AI in Android app
- [ ] Advanced scheduling/cron
- [ ] Integration with Zapier/Make
- [ ] Team/enterprise mode

### Q4 2026 🚀
- [ ] Open-source community edition
- [ ] Plugin marketplace
- [ ] Advanced agentic reasoning
- [ ] Multi-agent collaboration

---

## 📞 Support & Community

- **GitHub:** github.com/comet-ai/comet-browser
- **Docs:** comet-ai.app/docs
- **Discord:** discord.gg/comet-ai
- **Issues:** github.com/comet-ai/comet-browser/issues
- **Email:** support@comet-ai.app

---

## 📄 License

**MIT License** — Open source, free for personal and commercial use.

```
Copyright (c) 2026 Comet-AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 🎓 Key Learnings

### Why Comet-AI is Different

1. **Desktop as a first-class citizen** — Not just a web app in Electron, but deep OS integration (RobotJS, native menus, platform APIs)

2. **Security by design** — Every action gated, confirmed, logged, and reversible. No silent executions.

3. **Multi-AI, not single-vendor lock-in** — Use Gemini, Claude, Groq, or OpenAI depending on the task. Easy to swap.

4. **OCR + vision, not just text** — Can "see" the screen and click buttons in any desktop app, even ones with no API.

5. **Local-first data** — LanceDB vector DB, SQLite for everything, nothing synced without explicit permission.

6. **Mobile sync via WebSocket, not cloud** — Flutter app talks to desktop over local LAN with rotating shared secret. More private, lower latency.

7. **MCP extensibility** — Can integrate with Gmail, GitHub, Notion, or your own custom tools without rewriting the core.

---

## ✨ Final Thoughts

Comet-AI represents the **next evolution of the web browser** — from passive content consumption to **active agentic computing**. 

With explicit permission gating and comprehensive audit trails, it brings **AI power to the desktop safely**, respecting both security and privacy while enabling workflows that were previously impossible.

Whether you're automating tedious data entry, conducting research, or building complex multi-step procedures, **Comet-AI is your AI copilot for the desktop.**

---

**Made with ❤️ by the Comet-AI Team**  
*"AI that sees. AI that acts. AI that respects your security."*

