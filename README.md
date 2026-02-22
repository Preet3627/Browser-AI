# 🌟 Comet AI Browser (v0.2.0)

<div align="center">

![Comet AI Browser](https://raw.githubusercontent.com/Preet3627/Comet-AI/main/icon.ico)

**One Of World's Most Advanced Autonomous AI Browser**

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Android%20%7C%20iOS-blue)]()
[![Version](https://img.shields.io/badge/Version-0.2.0--stable-green)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

[Features](#-features) • [Download](#-download) • [Quick Start](#-quick-start) • [Development Status](#-development-status) • [Contributing](#-contributing)

</div>

***

## 🌌 Why Comet Exists

Modern browsers are built for scale, monetization, and cloud-first users. Comet exists for a different reason:

- **Autonomous Agency**: A browser that doesn't just display the web, but *navigates* it for you.
- **Privacy-First Intelligence**: AI access without forcing subscriptions or tracking.
- **Local-First Sync**: Zero-cloud cross-device synchronization.
- **Computer Vision**: An agent that "sees" the web through screenshots, OCR, and DOM analysis.

---

##  ️ Full Feature List

### 🤖 Autonomous AI Agency (Comet Agent)
*   **Multimodal Perception**: The agent perceives the web like a human using direct Screen Capture, Tesseract.js OCR, and Shadow DOM analysis.
*   **Self-Correction Loop**: Validates its own actions (e.g., checking if a click actually navigated) to ensure reliability in complex tasks.
*   **Action Engine**:
    *   `[NAVIGATE: url]` - Direct navigation.
    *   `[CLICK: text/selector]` - Human-like interaction.
    *   `[TYPE: text | selector]` - Input handling.
    *   `[SCROLL: direction]` - Page exploration.
    *   `[EXTRACT_DATA: query]` - Targeted scraping.
*   **Thinking Blocks**: Live visibility into the agent's reasoning process and current "vision" frame.

### 🧠 LLM Orchestration
*   **Latest Model Support**: Support for **Google Gemini 3.1 (Pro/Flash)**, **Claude 3.7 Sonnet**, GPT-4o, and Groq.
*   **Local AI (Ollama)**: Direct integration with Ollama for running models like **Deepseek R1** or Llama 3 locally for maximum privacy.
*   **RAG-Powered Memory**: Local vector database (using `vectorstore`) that indexes your browsing history for semantically accurate, privacy-preserving session recall.

### 🍱 Productivity & Workspace
*   **PDF Workspace**: Autonomous generation of PDF reports and documents from research queries.
*   **Presenton Studio**: Integrated AI presentation generator to turn web research into slide decks instantly.
*   **Spotlight Search (Alt+Space)**: System-wide shortcut for quick app launching, calculations, currency conversion, and AI prompts.
*   **Neural Modules (Extensions)**: A modular extension system with a glassmorphic UI for managing browser capabilities.
*   **Sidebar Multi-Tasking**: A persistent AI companion that stays with you across all tabs for summarization and action.
*   **Customizable Homepage**: Personalize your starting page with custom backgrounds, URLs, welcome messages, and quick actions.
*   **Floating Popups**: Enhanced multitasking with draggable, non-blocking popup windows for Search, Downloads, Unified Cart, and Translators.
*   **Pop-Search Integration**: Global, unified search capability accessible anywhere to quickly find what you need.

### ⚡ Performance & Core
*   **Speedometer 3 Optimized**: Consistently achieves ultra-low latency (~14ms) outperforming mainstream browsers.
*   **Hardware Isolation**: Sandboxed tabs and resource-heavy process management for crash resistance.
*   **Ad-Blocking & Privacy**: Integrated **Ghostery Adblocker** and tracking prevention.
*   **Premium UI**: Custom-built with **Framer Motion**, featuring vibrant dark modes, glassmorphism, and smooth micro-animations.

### 🔄 Multi-Device Ecosystem
*   **WiFi Desktop Sync**: Securely connect mobile and desktop via local network QR scans. Includes robust WebSockets architecture.
*   **P2P Clipboard Sharing**: Copy text on your phone and paste it on your laptop without the cloud.
*   **Sync Session Recovery**: Seamlessly pick up your open tabs and AI conversations across devices.
*   **Remote Device Control**: Broadcast intents like AI tasks or app launches from mobile to desktop using the unified bridge.

---

##  📊 Performance Snapshot

Measured on real hardware, not marketing slides.

| Metric | Value | Notes |
| :--- | :--- | :--- |
| Speedometer 3 | ~14 ms | |
| UI Load Time | < 2 seconds | Cold start observed |
| Electron RAM (AI + 1 tab) | ~462-500 MB | Expected Electron overhead |
| System RAM | 8 GB (6.9 GB used) | Still smooth, no visible lag |
| Agent Reaction Time | ~3-5s | Claude 3.7 Sonnet processing latency |

---

## 🧠 Recent Updates (v0.2.0) - The Agency Update

We've introduced groundbreaking autonomous capabilities:

- **Comet Agent (Mobile)**: A fully autonomous browser agent on Android. Trigger it by typing `>>` in the search bar.
- **Gemini 3.1 & Claude 3.7**: Integration of the latest multimodal reasoning models.
- **WiFi Desktop Sync**: Connect mobile to desktop via WiFi & QR scan to execute commands remotely.
- **Autonomous PDF Generation**: The browser can now generate and download PDF documents autonomously via AI commands.
- **Premium Black UI**: New high-contrast "Pure Black" aesthetic for OLED mobile screens.

---

## 🆕 Latest Updates (v0.3.0) - The Desktop Agent Update
<img width="1162" height="623" alt="image" src="https://github.com/user-attachments/assets/61c8e42e-0887-4f57-835e-4bfd9e2bc394" />

### Desktop Automation
- **PopSearch Integration**: Quick search popup (Ctrl+Shift+S) with 10+ search providers
- **RobotJS Automation**: Screen automation with permission-gated execution
- **Tesseract OCR**: Screen text recognition with AI-assisted click targeting
- **Screen Vision**: AI-powered screen description using Claude/Gemini Vision

### Enhanced AI Models
- **Gemini 2.5 Flash/Pro**: Latest Google models
- **GPT-5.2**: OpenAI's latest model
- **Claude Sonnet 4.6**: Anthropic's latest model
- **Llama 3.3**: Meta's latest open model

### Desktop Features
- **Keyboard Shortcuts**: 
  - `Shift+Enter`: New line in address bar (multi-line queries)
  - `Ctrl+Enter`: Search in new tab
  - `Alt+Enter`: Open in background tab
- **Raycast Extension**: Full macOS Raycast integration for tab search, AI commands, and quick actions
- **MCP Desktop Servers**: FileSystem and NativeApp MCP servers for advanced automation
- **Flutter Bridge**: WebSocket server for mobile-desktop communication
- **Voice Control**: Whisper transcription for voice commands
- **Workflow Recorder**: Record and replay AI action sequences

---


---

### **1. The "Security Hardening" Section**

Most people are scared of AI browsers because of "Prompt Injection." You should brag about your unique solution here.

> ### 🛡️ Security & Anti-Injection Architecture
> 
> 
> Unlike other agentic browsers that are vulnerable to code-based prompt injection, Comet-AI uses a **Triple-Lock** security model:
> * **Visual Sandbox (OCR-Only):** The AI perceives the web via **Tesseract OCR** screenshots. It never reads raw HTML/JS, making it immune to hidden malicious scripts.
> * **Syntactic Firewall:** Every OCR output is filtered to strip out OS-level commands (CMD/PowerShell) before reaching the LLM.
> * **Out-of-Band Authorization (HITL):** All **RobotJS** native actions require a **QR/PIN-secured signature** from the Comet Mobile app. The "Brain" (LLM) cannot act without the "Human" (You).
> 
> 

---

### **2. The "Hardware Optimization" Section**

This is where you mention the **i5-U** and **8GB RAM**. It shows you can write efficient code, which is a rare skill today.

> ### ⚡ Performance & Efficiency
> 
> 
> Comet-AI is engineered for **Low-Resource Environments**. While most AI browsers require 16GB+ RAM, Comet is optimized for:
> * **CPU:** Intel i5-U Series (Ultra-Low Power)
> * **Memory:** Sub-500MB footprint (Electron optimized)
> * **Latency:** ~14ms UI response time via Speedometer 3
> * **Inference:** Local execution via **Ollama** or high-speed edge inference via **Groq**.
> 
> 

---

### **3. The "AGENTS.md" File (New 2026 Standard)**

There is a new trend in open-source where you add an `AGENTS.md` file to your repo. This is basically a "README for AI." It tells other AI agents (like me!) how to contribute to your code.

**Add this to a new file named `AGENTS.md` in your root:**

```markdown
# Agent Instructions for Comet-AI
This project uses a specific hybrid architecture of Electron and Flutter.

### Key Rules for AI Contributors:
- **No Direct Shell Access:** Never propose code that gives the LLM raw shell access.
- **Node.js Main Process:** Native OS calls must go through the RobotJS wrapper.
- **Security First:** Any UI changes must maintain the visibility of the "Thinking Blocks."
- **Stack:** Electron (Main), Next.js (Renderer), Flutter (Mobile Bridge).

```

## 🚀 Development Status

Comet AI Browser is a multi-platform, open-source project in active development.

### 🖥️ Desktop (Windows / macOS / Linux)
**Framework**: Electron + Next.js

- ✅ **Windows**: Fully functional, installable beta available.
- ✅ **MacOS**: Fully functional, installable beta available.
- ✅ **Linux**: Fully functional, installable beta available.

### 📱 Mobile (Android / iOS)
**Framework**: Flutter

- ✅ **Android**: **Production Ready** with Comet Agent v1.0.
- 🧪 **iOS**: Design & simulator testing phase.

---

## ✨ Feature Matrix (Desktop vs Mobile)

| Feature                   | 🖥️ Desktop| 📱 Mobile   | Status                       |
| **Comet Agent (Agency)**  |     ✅    |     ✅      | **New!** (Use `>>` on Mobile)|
| **Multimodal Perception** |     ✅    |     ✅      | Vision + OCR + DOM           |
| **PDF Generation**        |     ✅    |     🧪      | Autonomous Document Creation |
| **Presenton Studio**      |     ✅    |     🧪      | AI Presentations             |
| **WiFi Desktop Sync**     |     ✅    |     ✅      | **Core Feature**             |
| **History & Clipboard**   |     ✅    |     ✅      | Cross-device                 |

---

## 🤖 Intelligent AI Agent

Comet AI is designed as an autonomous browser-level agent.

- **Multimodal Agency**: Perceptual loop using Screenshots, OCR, and DOM.
- **Action Tags**:
    - `[NAVIGATE: url]`
    - `[GENERATE_PDF: title | content]`
    - `[OPEN_PRESENTON: prompt]`
    - `[SCREENSHOT_AND_ANALYZE]`
    - `[SET_THEME: dark|light|system]`
    - `[EXEC_DESKTOP: command]`

---

## 📦 Download & Installation

### 🖥️ Desktop

| Platform | Binary    | Status    |
| Windows  | `.exe`    | ✅ Beta   |
| macOS    | `.dmg`    | 🧪 In Dev |
| Linux    | `AppImage`| 🧪 In Dev |

### 📱 Mobile

> APK & TestFlight builds coming soon. Manual build required for now.

---

### 🛠️ Quick Start

Visit [https://browser.ponsrischool.in](https://browser.ponsrischool.in) for documentation and official builds.

```bash
# Clone the repository
git clone https://github.com/Preet3627/Comet-AI.git
cd Browser-AI
npm install
```

### Run Desktop App

```bash
cd comet-browser
npm install
npm run dev
# In new terminal:
npm run electron-start
```

### Run Mobile App

```bash
cd flutter_browser_app
flutter pub get
flutter run
```

---

## 🗺️ Roadmap to v1.0.0

- [ ] Native Chromium-based core
- [ ] Fully offline LLM (1.5B–3B params)
- [ ] Extension marketplace
- [ ] **Autonomous Browser Workspace** (Multi-agent collaboration)
- [ ] **Advanced Tool Permission Gating** (OS Actions Safety)

---

## 👥 Contributors

A big thank you to the community for their suggestions and feedback!

- **Otherwise_Wave9374** - Suggested tool permission gating and reliable agent loop patterns.

---

## 🧑‍💻 About the Creator

Built by a **16‑year‑old student** preparing for JEE, Comet AI Browser is proof that skill, patience, and curiosity matter more than budget or hardware.

**Primary Dev Machine**: Intel i5‑U | 8GB RAM | SATA SSD

---

## 📝 License

This project is licensed under the MIT License.

<div align="center">Built with ❤️ for privacy, performance, and agency

[⬆ Back to Top](#-comet-ai-browser)

</div>
