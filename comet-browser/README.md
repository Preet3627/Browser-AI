# Comet Browser
![Comet Browser Banner](https://user-images.githubusercontent.com/12345/some-banner-image-url.png)

**Comet Browser** is a high-performance, AI-integrated desktop workspace. Built for architects of the web, it combines the speed of Chromium with the power of modern AI orchestration and cross-device sync.

## 🚀 Recent Core Updates (v0.5.2)

*   **AI Omnibar & URL Predictor:** Integrated TensorFlow.js for intelligent, debounced URL prefilling and intent matching.
*   **Unified Shopping Cart:** An AI-powered cross-site shopping engine that automatically scans pages for items and manages them in a single, unified interface.
*   **Offline Web Engine:** Native capability to capture and download full websites for high-fidelity offline access.
*   **Master Sync Core:** Connect your local browser to a master MySQL database for instant synchronization of bookmarks, history, and AI memory.
*   **Admin Command Center:** A secure portal (Google Auth) for managing system health, user directories, and browser build distributions.
*   **Vibrant Mesh Design:** A new procedural background system alongside premium glassmorphic UI components for a state-of-the-art aesthetic.

## 🛠️ Tech Stack & Architecture

*   **Frontend:** Next.js 14, Tailwind CSS, Framer Motion, Zustand (State Management)
*   **Core:** Electron (Chromium Shell), Node.js
*   **Intelligence:** TensorFlow.js (In-browser ML), Multi-LLM Provider Engine (Gemini, OpenAI, Claude, Ollama)
*   **Backend & Auth:** Firebase (Auth/Store), MySQL (Persistent Sync), SMTP (Automated Comms)

## ⚙️ Configuration (.env)

Comet is highly customizable via environment variables. See `env.example` for the full list.

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_APP_NAME` | Change the entire browser branding (Logo, Titles, etc.) |
| `MYSQL_URL` | Connection string for the Master Sync Database |
| `SMTP_HOST` | Mail server for system notifications |
| `GEMINI_API_KEY` | Key for the primary AI orchestration engine |

## 🚀 Getting Started

1.  **Clone & Install:**
    ```bash
    git clone https://github.com/admin/comet-browser.git
    npm install
    ```

2.  **Environment Setup:**
    ```bash
    cp env.example .env.local
    # Fill in your API keys and MySQL credentials
    ```

3.  **Launch Dev Instance:**
    ```bash
    npm run dev
    ```

## 🏗️ Building for Production

To generate optimized installers for Windows, macOS, or Linux:
```bash
npm run build
```

## 📄 License
MIT License - Personal Use Only. (See LICENSE for full terms)