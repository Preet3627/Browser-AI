# 🚀 Quick Start - Push to GitHub

## Step-by-Step Instructions

### 1. Check Git Status
```powershell
git status
```

### 2. Add All Files
```powershell
git add .
```

### 3. Commit Changes
```powershell
git commit -m "Initial commit: Comet AI Browser v0.6.0

Features:
- Advanced tab management (50+ tabs with custom sounds)
- P2P file sync without cloud storage
- Phone call control via Bluetooth
- Contact sync across devices
- Automatic OTP verification (SMS/Email)
- Offline AI with cloud fallback
- Any AI provider/model support
- Cross-device sync for all data
- Military-grade AES-256 encryption
- Chrome extension support
- Enhanced PDF viewer with OCR
- MCP server support
- Native OS experience
- And 15+ more features

Platforms:
- Desktop: Windows, macOS, Linux
- Mobile: Android, iOS
- Web: Next.js PWA"
```

### 4. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `comet-browser` or `Browser-AI`
3. Description: `Privacy-First AI Browser with Offline Intelligence and Cross-Device Sync`
4. Choose **Public** (or Private if you prefer)
5. **DO NOT** check "Initialize with README" (we already have one)
6. Click "Create repository"

### 5. Add Remote (Replace YOUR_USERNAME)
```powershell
git remote add origin https://github.com/YOUR_USERNAME/comet-browser.git
```

### 6. Rename Branch to Main (if needed)
```powershell
git branch -M main
```

### 7. Push to GitHub
```powershell
git push -u origin main
```

### 8. Verify
```powershell
git remote -v
git status
```

---

## 🏗️ Build Native Apps

### Desktop (Windows)

```powershell
cd comet-browser

# Install dependencies
npm install

# Install electron-builder
npm install --save-dev electron-builder

# Build Next.js
npm run build

# Build Windows executable
npx electron-builder --windows --x64
```

**Output:** `dist/Comet-Browser-Setup-0.6.0.exe`

### Mobile (Android)

```powershell
cd CometBrowserMobile

# Install dependencies
npm install

# Build APK
cd android
.\gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

---

## 📦 Create GitHub Release

### 1. Create Tag
```powershell
git tag -a v0.6.0 -m "Release v0.6.0 - Advanced Features"
git push origin v0.6.0
```

### 2. Create Release on GitHub
1. Go to your repository
2. Click "Releases" → "Create a new release"
3. Choose tag: `v0.6.0`
4. Title: `v0.6.0 - Advanced Tab Management & Cross-Device Features`
5. Upload build files (exe, apk, etc.)
6. Click "Publish release"

---

## ✅ Quick Checklist

- [ ] Git initialized
- [ ] .gitignore created
- [ ] All files added
- [ ] Changes committed
- [ ] GitHub repository created
- [ ] Remote added
- [ ] Code pushed
- [ ] Builds created (optional)
- [ ] Release published (optional)

---

## 🆘 Need Help?

See [BUILD_GUIDE.md](BUILD_GUIDE.md) for detailed instructions.

---

**Ready to push!** Run the commands above in order. 🚀
