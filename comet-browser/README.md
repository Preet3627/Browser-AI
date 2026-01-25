# ☄️ Comet Browser (v0.1.3 Stable)
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

## 🚀 Core Features (v0.1.3 Combined Dashboard)

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