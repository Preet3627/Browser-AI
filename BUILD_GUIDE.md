# 🚀 Build & Deployment Guide - Comet AI Browser

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Desktop Apps (Windows, macOS, Linux)](#desktop-apps)
3. [Mobile Apps (Android, iOS)](#mobile-apps)
4. [Git Setup & Push](#git-setup--push)
5. [GitHub Release](#github-release)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **Visual Studio Code** (recommended)

### Platform-Specific Requirements

#### Windows
- **Windows 10/11**
- **Visual Studio Build Tools** (for native modules)
  ```powershell
  npm install --global windows-build-tools
  ```

#### macOS
- **macOS 10.15+**
- **Xcode** (from App Store)
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```

#### Linux
- **Ubuntu 20.04+** or equivalent
- Build essentials
  ```bash
  sudo apt-get install build-essential
  ```

#### Android
- **Android Studio** ([Download](https://developer.android.com/studio))
- **JDK 11+**
- **Android SDK** (via Android Studio)

#### iOS
- **macOS only**
- **Xcode 14+**
- **CocoaPods**
  ```bash
  sudo gem install cocoapods
  ```

---

## Desktop Apps

### Step 1: Install Dependencies

```bash
cd comet-browser
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your settings
# Required: At least one AI API key
# Optional: Database credentials, Firebase config
```

### Step 3: Build Desktop Apps

#### Windows (.exe)

```bash
# Install electron-builder if not already installed
npm install --save-dev electron-builder

# Build Windows installer
npm run build              # Build Next.js
npm run build-electron     # Build Electron app

# Or use electron-builder directly
npx electron-builder --windows --x64
```

**Output:** `dist/Comet-Browser-Setup-0.6.0.exe`

#### macOS (.dmg)

```bash
# Build macOS app (requires macOS)
npm run build
npm run build-electron

# Build DMG
npx electron-builder --mac --x64 --arm64
```

**Output:** `dist/Comet-Browser-0.6.0.dmg`

#### Linux (.AppImage, .deb)

```bash
# Build Linux app
npm run build
npm run build-electron

# Build AppImage and deb
npx electron-builder --linux --x64
```

**Output:** 
- `dist/Comet-Browser-0.6.0.AppImage`
- `dist/Comet-Browser-0.6.0.deb`

### Step 4: Configure electron-builder

Create `electron-builder.json` in `comet-browser/`:

```json
{
  "appId": "com.comet.browser",
  "productName": "Comet Browser",
  "directories": {
    "output": "dist",
    "buildResources": "build"
  },
  "files": [
    "out/**/*",
    "electron.js",
    "preload.js",
    "package.json"
  ],
  "win": {
    "target": ["nsis", "portable"],
    "icon": "build/icon.ico",
    "artifactName": "Comet-Browser-Setup-${version}.${ext}"
  },
  "mac": {
    "target": ["dmg", "zip"],
    "icon": "build/icon.icns",
    "category": "public.app-category.productivity",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist"
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "icon": "build/icon.png",
    "category": "Network"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

### Step 5: Add Build Scripts to package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "electron-start": "electron .",
    "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "build-electron": "next build && electron-builder",
    "build-win": "next build && electron-builder --windows",
    "build-mac": "next build && electron-builder --mac",
    "build-linux": "next build && electron-builder --linux",
    "build-all": "next build && electron-builder -mwl"
  }
}
```

---

## Mobile Apps

### Android

#### Step 1: Setup Android Environment

```bash
cd CometBrowserMobile

# Install dependencies
npm install

# Link native modules (if needed)
npx react-native link
```

#### Step 2: Configure Android

Edit `android/app/build.gradle`:

```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        applicationId "com.comet.browser"
        minSdkVersion 24
        targetSdkVersion 33
        versionCode 1
        versionName "0.6.0"
    }
    
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### Step 3: Generate Signing Key

```bash
# Generate keystore
keytool -genkeypair -v -storetype PKCS12 -keystore comet-release-key.keystore -alias comet-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Move to android/app
mv comet-release-key.keystore android/app/
```

#### Step 4: Configure Signing

Create `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=comet-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=comet-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your_store_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

#### Step 5: Build APK

```bash
# Debug APK (for testing)
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk

# Release APK (for distribution)
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk

# Or use React Native CLI
cd ..
npx react-native build-android --mode=release
```

#### Step 6: Build AAB (for Play Store)

```bash
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS

#### Step 1: Setup iOS Environment

```bash
cd CometBrowserMobile

# Install dependencies
npm install

# Install CocoaPods dependencies
cd ios
pod install
cd ..
```

#### Step 2: Configure Xcode

1. Open `ios/CometBrowserMobile.xcworkspace` in Xcode
2. Select project in navigator
3. Go to "Signing & Capabilities"
4. Select your Team
5. Set Bundle Identifier: `com.comet.browser`
6. Enable capabilities:
   - Background Modes
   - Push Notifications
   - Bluetooth

#### Step 3: Build iOS App

```bash
# Debug build (for simulator)
npx react-native run-ios

# Release build (for device)
npx react-native run-ios --configuration Release

# Or build in Xcode
# Product > Archive
# Then distribute via App Store Connect
```

#### Step 4: Create IPA (for distribution)

1. In Xcode: Product > Archive
2. Wait for archive to complete
3. Click "Distribute App"
4. Choose distribution method:
   - App Store Connect (for App Store)
   - Ad Hoc (for testing)
   - Enterprise (for internal)
5. Follow prompts to export IPA

---

## Git Setup & Push

### Step 1: Initialize Git Repository

```bash
cd C:\Users\admin\Desktop\Projects\Browser

# Initialize git (if not already)
git init

# Check status
git status
```

### Step 2: Create .gitignore

Create `.gitignore` in root directory:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Electron
electron-builder.yml
dist/

# Mobile
*.apk
*.aab
*.ipa
*.keystore
*.jks
android/app/build/
ios/build/
ios/Pods/

# Misc
*.pem
*.p12
*.mobileprovision
```

### Step 3: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click "New Repository"
3. Name: `comet-browser`
4. Description: "Privacy-First AI Browser with Offline Intelligence"
5. Choose Public or Private
6. **Don't** initialize with README (we already have one)
7. Click "Create Repository"

### Step 4: Add Remote and Push

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Comet AI Browser v0.6.0

Features:
- Advanced tab management (50+ tabs)
- Custom sound per tab
- P2P file sync (no cloud)
- Phone call control via Bluetooth
- Contact sync
- Automatic OTP verification
- Offline AI with cloud fallback
- Cross-device sync
- Military-grade encryption
- Chrome extension support
- And 15+ more features"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/comet-browser.git

# Push to GitHub
git push -u origin main

# If main branch doesn't exist, create it
git branch -M main
git push -u origin main
```

### Step 5: Verify Push

```bash
# Check remote
git remote -v

# Check branches
git branch -a

# Check status
git status
```

---

## GitHub Release

### Step 1: Create Release Tag

```bash
# Create and push tag
git tag -a v0.6.0 -m "Release v0.6.0 - Advanced Tab Management & Cross-Device Features"
git push origin v0.6.0
```

### Step 2: Create GitHub Release

1. Go to your repository on GitHub
2. Click "Releases" (right sidebar)
3. Click "Create a new release"
4. Choose tag: `v0.6.0`
5. Release title: `v0.6.0 - Advanced Tab Management & Cross-Device Features`
6. Description:

```markdown
## 🎉 What's New

### 🗂️ Advanced Tab Management
- Up to 50 tabs simultaneously
- Custom sound per tab with volume control
- Background execution for tabs
- Priority system (High/Normal/Low)

### 📁 Cross-Device Features
- P2P file sync without cloud storage
- Phone call control via Bluetooth
- Contact sync across devices
- Automatic OTP verification

### 🤖 AI Enhancements
- Any AI provider support
- Any model selection
- Offline chatbot improvements

## 📦 Downloads

### Desktop
- Windows: `Comet-Browser-Setup-0.6.0.exe`
- macOS: `Comet-Browser-0.6.0.dmg`
- Linux: `Comet-Browser-0.6.0.AppImage`

### Mobile
- Android: `comet-browser-0.6.0.apk`
- iOS: Available on App Store

## 🔧 Installation

See [README.md](README.md) for detailed installation instructions.

## 📝 Changelog

Full changelog: [CHANGELOG.md](CHANGELOG.md)
```

7. Upload build files:
   - Drag and drop your built apps
   - Windows .exe
   - macOS .dmg
   - Linux .AppImage
   - Android .apk

8. Click "Publish release"

---

## Automated Build & Release

### Create GitHub Actions Workflow

Create `.github/workflows/build.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build-desktop:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd comet-browser
          npm install
      
      - name: Build
        run: |
          cd comet-browser
          npm run build
          npm run build-electron
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: comet-browser/dist/*

  build-android:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '11'
      
      - name: Install dependencies
        run: |
          cd CometBrowserMobile
          npm install
      
      - name: Build APK
        run: |
          cd CometBrowserMobile/android
          ./gradlew assembleRelease
      
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: android-apk
          path: CometBrowserMobile/android/app/build/outputs/apk/release/*.apk

  release:
    needs: [build-desktop, build-android]
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download artifacts
        uses: actions/download-artifact@v3
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            windows-latest-build/*
            macos-latest-build/*
            ubuntu-latest-build/*
            android-apk/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Troubleshooting

### Common Issues

#### 1. "electron-builder not found"
```bash
npm install --save-dev electron-builder
```

#### 2. "Next.js build failed"
```bash
# Clear cache
rm -rf .next
npm run build
```

#### 3. "Android build failed"
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

#### 4. "iOS pod install failed"
```bash
cd ios
pod deintegrate
pod install
```

#### 5. "Git push rejected"
```bash
# Pull first
git pull origin main --rebase
git push origin main
```

#### 6. "Large files rejected by GitHub"
```bash
# Use Git LFS for large files
git lfs install
git lfs track "*.apk"
git lfs track "*.exe"
git lfs track "*.dmg"
git add .gitattributes
git commit -m "Add Git LFS"
```

---

## 📝 Quick Reference

### Build Commands

```bash
# Desktop
npm run build-win      # Windows
npm run build-mac      # macOS
npm run build-linux    # Linux
npm run build-all      # All platforms

# Mobile
cd android && ./gradlew assembleRelease    # Android
npx react-native run-ios --configuration Release  # iOS
```

### Git Commands

```bash
git add .                          # Stage all changes
git commit -m "message"            # Commit
git push origin main               # Push to GitHub
git tag v0.6.0                     # Create tag
git push origin v0.6.0             # Push tag
```

---

## ✅ Checklist

Before releasing:

- [ ] All features tested
- [ ] Environment variables configured
- [ ] Build successful on all platforms
- [ ] Version numbers updated
- [ ] README.md updated
- [ ] CHANGELOG.md created
- [ ] .gitignore configured
- [ ] Sensitive files excluded
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Release tag created
- [ ] GitHub release published
- [ ] Build artifacts uploaded

---

**You're ready to build and release Comet AI Browser!** 🚀
