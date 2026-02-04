# # 🌟 Comet AI Browser

<div align="center">

![Comet AI Browser](https://raw.githubusercontent.com/Preet3627/Browser-AI/refs/heads/main/comet-browser/icon.ico)

**The World's Most Advanced Privacy-First AI Browser**

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Android%20%7C%20iOS-blue)]()
[![Version](https://img.shields.io/badge/Version-0.1.3--beta-green)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

[Features](#-features) • [Download](#-download) • [Quick Start](#-quick-start) • [Development Status](#-development-status) • [Contributing](#-contributing)

</div>

***

## 🚀 Development Status

Comet AI Browser is a multi-platform project in active development. We are currently in **v0.1.3‑beta**.

### 🖥️ Desktop (Windows/macOS/Linux)
*Current Framework: Electron + Next.js*
- ✅ **Windows**: Fully functional, installable beta available.
- 🧪 **macOS**: Under development (Build scripts being refined).
- 🧪 **Linux**: Under development (Testing AppImage/Debian packages).

### 📱 Mobile (Android/iOS)
*Current Framework: Flutter*
- 🧪 **Android**: Implementation in progress. Core browser and UI ready. P2P Sync & Offline AI being integrated.
- 🧪 **iOS**: Design phase. Core UI matches Android; testing on simulators.

***

## ✨ Feature Matrix (Desktop vs Mobile)

| Feature | 🖥️ Desktop | 📱 Mobile | Status |
| :--- | :---: | :---: | :--- |
| **Glassmorphic UI** | ✅ | ✅ | Production Ready |
| **AI Sidebar (Cloud)** | ✅ | ✅ | OpenAI / Gemini Integration |
| **Offline AI Model** | ✅ | 🧪 | Optimizing for mobile NPU |
| **AI Web Agency** | ✅ | 🧪 | Navigation commands in testing |
| **P2P File Sync** | ✅ | 🧪 | WebRTC handshake optimization |
| **Music Lab / Visualizer**| ✅ | ✅ | Local & Cloud support |
| **Phone Call Control** | ✅ | 🚧 | Bluetooth HID profile in dev |
| **Auto OTP Detection** | ✅ | ✅ | Native SMS listener implemented |
| **PDF Workspace + OCR** | ✅ | 🧪 | Tesseract WASM porting to mobile |
| **Chrome Extensions** | ✅ | ❌ | Desktop only |
| **Cross-Device Sync** | ✅ | ✅ | Firebase Realtime DB backend |

***

## 🤖 Intelligent AI Assistant

Comet AI is not just a chatbot; it's an **Autonomous Web Agent**.

- **Smart Mode Switching**: Automatically switches between cloud providers (OpenAI, Gemini, Groq) and local models.
- **AI Agency**: Use commands like "Go to YouTube", "Search for JEE news", or "Change theme to dark".
- **Dynamic Action Tags**:
  - `[NAVIGATE: url]`
  - `[SEARCH: query]`
  - `[SET_THEME: dark|light|system]`
  - `[OPEN_VIEW: view_name]`

***

## 📁 P2P File Sync (Zero Cloud)

Direct device-to-device synchronization using WebRTC.
- **Privacy-First**: Your files never touch a server.
- **Selective Sync**: Choose specific folders (Images, PDFs, Documents).
- **Background Sync**: Keep devices in sync automatically when connected to the same network.

***

## 📞 Unity: Phone & Desktop Integration

- **Call Control**: Answer/Reject phone calls directly from your PC via Bluetooth.
- **OTP Auto-Fill**: Mobile listens for SMS OTPs and instantly sends them to your Desktop browser.
- **Contact Sync**: Unified address book accessible across all your devices.

***

## 📦 Download & Installation

### 🖥️ Desktop
| Platform | Binary | Status |
| :--- | :--- | :--- |
| **Windows** | [Download .exe](https://github.com/Preet3627/Browser-AI/actions/runs/21679902806/artifacts/5377464680) | ✅ Stable Beta |
| **macOS** | [Download .dmg](https://github.com/Preet3627/Browser-AI/actions/runs/21679902806/artifacts/5377510774) | 🧪 In Dev |
| **Linux** | [Download AppImage](https://github.com/Preet3627/Browser-AI/actions/runs/21679902806/artifacts/5377413855) | 🧪 In Dev |

### 📱 Mobile
> Note: APK and TestFlight links will be available shortly. Currently requires manual build.

***

## 🛠️ Quick Start for Developers

### 1. Root Setup (Monorepo)
```bash
git clone https://github.com/Preet3627/Browser-AI.git
cd Browser-AI
npm install
```

### 2. Run Desktop
```bash
cd comet-browser
# Create symlinks/junctions for dependencies
.\setup-workspace.ps1
# Setup environment
cp .env.example .env.local
# Launch
npm run dev
# In new terminal
npm run electron-start
```

### 3. Run Mobile
```bash
cd CometBrowserMobile/comet_ai
flutter pub get
flutter run
```

***

## 🗺️ Roadmap: The Path to v1.0

- [ ] **Native Core**: Rebuild the browser using C++ and Chromium for maximum performance.
- [ ] **Full Offline LLM**: Support for 1.5B - 3B parameter models running entirely on-device (Mobile & Desktop).
- [ ] **Plugin Marketplace**: A privacy-focused extension gallery.
- [ ] **Enterprise Suite**: Secure workspaces for corporate environments.

---

## 🧑‍💻 About the Creator

Comet AI Browser is a passion project built by an 11th-grade student preparing for **JEE**. Inspired by the potential of AI to revolutionize browsing, it was born from a desire to create a privacy-first, power-user browser that works on modest hardware.

**Development Setup:** Acer Veriton | Intel i5 (U-series) | 8GB RAM | 256GB SSD.

---

## 📝 License
This project is licensed under the **MIT License**.

<div align="center">

**Built with ❤️ for privacy and performance**

[⬆ Back to Top](#-comet-ai-browser)

</div>