# 🌟 Comet AI Browser (v0.1.9)

<div align="center">

![Comet AI Browser](https://raw.githubusercontent.com/Preet3627/Browser-AI/main/icon.ico)

**The World's Most Advanced Privacy-First AI Browser**

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Android%20%7C%20iOS-blue)]()
[![Version](https://img.shields.io/badge/Version-0.1.9--stable-green)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

[Features](#-features) • [Download](#-download) • [Quick Start](#-quick-start) • [Development Status](#-development-status) • [Contributing](#-contributing)

</div>

***

## 🌌 Why Comet Exists

Modern browsers are built for scale, monetization, and cloud-first users. Comet exists for a different reason:

- To prove high-performance browsing is possible on modest hardware
- To give AI access without forcing subscriptions
- To stay local-first, privacy-first, and transparent
- To explore what a browser can become when AI is treated as a core system, not a plugin

Comet is intentionally experimental. Some choices (like Electron) are pragmatic tradeoffs to move fast and learn deeply. The long-term goal is a native Chromium-based core once hardware and time allow.

---

## 📊 Performance Snapshot

Measured on real hardware, not marketing slides.

| Metric | Value | Notes |
| :--- | :--- | :--- |
| Speedometer 3 | ~14 ms | Faster than Chrome/Edge on same system |
| UI Load Time | < 2 seconds | Cold start observed |
| Electron RAM (AI + 1 tab) | ~700–800 MB | Expected Electron overhead |
| System RAM | 8 GB (6.9 GB used) | Still smooth, no visible lag |
| Crashes | 0 in 2+ months | Daily usage |

> _Offline network conditions may cause temporary stalls due to AI/network fallback handling._

---

## 🧠 Recent Updates (v0.1.9)

We've been hard at work refining the Comet experience:

- **Vibrant Glassmorphic UI**: Completely redesigned mobile home page with stunning cosmic themes and glassmorphism.
- **WiFi Desktop Sync**: Connect mobile to desktop via WiFi & QR scan to execute commands remotely.
- **Fixed Android Launch**: Resolved `ClassNotFoundException` and platform-specific crashes.
- **Synced Config**: Secure environment variable syncing from landing page.
- **Cross-Platform**: Full support for Android, iOS (Beta), Windows, macOS, and Linux.

---

## 🚀 Development Status

Comet AI Browser is a multi-platform, open-source project in active development.

### 🖥️ Desktop (Windows / macOS / Linux)
**Framework**: Electron + Next.js

- ✅ **Windows**: Fully functional, installable beta available.
- ✅ **MacOS**: Fully functional, installable beta available.
- ✅ **Linux**: Fully functional, installable beta available.

### 📱 Mobile (Android / iOS)
**Framework**: Flutter

- ✅ **Android**: Vibrant UI, WiFi Desktop Sync, and core browser functionality ready.
- 🧪 **iOS**: Design & simulator testing phase.

---

## ✨ Feature Matrix (Desktop vs Mobile)

| Feature | 🖥️ Desktop | 📱 Mobile | Status |
| :--- | :---: | :---: | :--- |
| **Glassmorphic UI** | ✅ | ✅ | Production Ready |
| **WiFi Desktop Sync** | ✅ | ✅ | **New!** |
| **AI Sidebar (Cloud)** | ✅ | ✅ | OpenAI / Gemini |
| **Offline AI Models** | ✅ | 🧪 | Local LLM optimization |
| **AI Web Agency** | ✅ | 🧪 | Command-based navigation |
| **P2P Sync (WebRTC)** | ✅ | 🧪 | Zero-cloud design |
| **History & Clipboard** | ✅ | ✅ | Cross-device |

---

## 🤖 Intelligent AI Assistant

Comet AI is designed as an autonomous browser-level agent.

- **Smart Provider Switching**: OpenAI, Gemini, Groq, or fully local models.
- **Natural Commands**: "Open YouTube", "Summarize this page", "Execute on Windows".
- **Action Tags**:
    - `[NAVIGATE: url]`
    - `[SEARCH: query]`
    - `[SET_THEME: dark|light|system]`
    - `[EXEC_DESKTOP: command]`

---

## 📦 Download & Installation

### 🖥️ Desktop

| Platform | Binary | Status |
| :--- | :--- | :--- |
| Windows | `.exe` | ✅ Beta |
| macOS | `.dmg` | 🧪 In Dev |
| Linux | `AppImage` | 🧪 In Dev |

### 📱 Mobile

> APK & TestFlight builds coming soon. Manual build required for now.

---

### 🛠️ Quick Start

Visit [https://browser.ponsrischool.in](https://browser.ponsrischool.in) for documentation and official builds.

```bash
# Clone the repository
git clone https://github.com/Preet3627/Browser-AI.git
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
- [ ] Advanced tab & memory management
- [ ] **Advanced Tool Permission Gating** (OS Actions Safety) - *Recommended by community*

---

## 👥 Contributors

A big thank you to the community for their suggestions and feedback!

- **Otherwise_Wave9374** - Suggested tool permission gating and reliable agent loop patterns.

---

## 📚 Resources & Inspiration

- [Agentix Labs Blog](https://www.agentixlabs.com/blog/) - Patterns for reliable agent loops and AI safety.

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's fixing bugs, improving documentation, or suggesting new features, your help is appreciated.

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 🧑‍💻 About the Creator

Built by a **16‑year‑old student** preparing for JEE, Comet AI Browser is proof that skill, patience, and curiosity matter more than budget or hardware.

**Primary Dev Machine**: Intel i5‑U | 8GB RAM | SATA SSD

---

## 📝 License

This project is licensed under the MIT License.

<div align="center">Built with ❤️ for privacy, performance, and learning

[⬆ Back to Top](#-comet-ai-browser)

</div>