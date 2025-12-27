# ☄️ COMET BROWSER ECOSYSTEM

A unified, high-performance browser ecosystem featuring a **Desktop Shell (Electron)**, a **Premium Web Portal (Next.js)**, and a **Cross-Platform Mobile App (React Native)**. Integrated with Firebase for Auth and MySQL for deep data persistence.

---

## 🏗️ Project Architecture

- **`/comet-browser`**: The core web engine (Next.js 15 + Tailwind 4).
    - Can be built as an **Electron Desktop App**.
    - Can be deployed as a **Standalone Web Portal** (`/web`).
- **`/CometBrowserMobile`**: The Android/iOS application built with React Native.
- **Root Directory**: Managed via NPM Workspaces for unified dependency control.

---

## 🚀 Quick Start (Root Directory)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `comet-browser/.env.local` and fill in your credentials (see below).

### 3. Running Development Modes
- **Desktop/Web**: `npm run dev:desktop`
- **Mobile (Metro)**: `npm run dev:mobile`
- **Mobile (Android)**: `npm run mobile:android`

---

## 📦 Deployment & Building

### Web / Hosting
1.  **Vercel**: Connect your repo and deploy the `comet-browser` directory. 
2.  **Firebase**: Add your production domain to the Firebase Console "Authorized Domains" list.
3.  **MySQL**: Ensure your Hostinger/Remote MySQL allows connections from your production IP.

### Desktop (EXE/DMG)
```bash
cd comet-browser
npm run build-electron
```

### Mobile (APK)
```bash
# Build production debug APK
npm run mobile:build-debug
```

---

## 🛠️ Integrated Features

- **Unified Auth**: Login once via Google (Firebase) and sync across Web, Mobile, and Desktop.
- **AI Personal Node**: Securely store your own OpenAI/Gemini keys in the local vault.
- **Admin Dashboard**: Real-time system monitoring and logs built directly into `/web`.
- **Hardened Browser**: Built-in tracking protection and AI-powered URL prediction.

---

## 📁 Repository Map
- `SETUP-COMET.TXT`: Detailed build instructions for Android.
- `package.json`: Workspace configuration and unified scripts.
- `comet-browser/src/app/web/page.tsx`: The heart of the web/landing experience.
