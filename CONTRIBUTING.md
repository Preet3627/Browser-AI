# Contributing to Comet AI Browser

First off, thank you for considering contributing to Comet AI Browser! It's people like you that make building open-source software such a rewarding experience.

This project is built by a student developer, and help from the community is highly appreciated to move it towards v1.0.0.

## 🤝 Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all, regardless of level of experience, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, nationality, or other similar characteristic.

## 🐛 Reporting Bugs

A great way to contribute is to report bugs. If you encounter a problem, please visit our [Official Website](https://browser.ponsrischool.in) for support or reporting mechanisms.
1.  **A clear title**: "Settings panel crashes on Windows 11"
2.  **Description**: What were you doing? What happened? What did you expect?
3.  **Steps to reproduce**: Numbered steps to make the bug happen.
4.  **Environment**: OS (e.g., Windows 10, macOS 14), Browser version (if applicable).

## 💡 Suggesting Enhancements

If you have an idea for a feature or an improvement:
1.  Check existing issues to avoiding duplication.
2.  Open a new issue with the tag `enhancement` or `feature request`.
3.  Describe your idea clearly and why it would be useful.

## 💻 Development Workflow

1.  **Fork the repository** on GitHub: [https://github.com/Preet3627/Comet-AI](https://github.com/Preet3627/Comet-AI)
2.  **Clone the Repo** locally:
    ```bash
    git clone https://github.com/YOUR-USERNAME/Browser-AI.git
    cd Browser-AI
    ```
3.  **Create a branch** for your feature or fix:
    ```bash
    git checkout -b feature/amazing-new-feature
    # or
    git checkout -b fix/critical-bug
    ```

### 🖥️ Desktop (Electron + Next.js)

The desktop code is located in `comet-browser`.

1.  Navigate to the directory:
    ```bash
    cd comet-browser
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Setup environment variables:
    ```bash
    cp .env.example .env.local
    # Edit .env.local with your API keys if working on AI features
    ```
4.  Run the development environment:
    *   **Terminal 1 (Next.js Renderer)**: `npm run dev`
    *   **Terminal 2 (Electron Main)**: `npm run electron-start`

### 📱 Mobile (Flutter)

The mobile code is located in `CometBrowserMobile/comet_ai`.

1.  Navigate to the directory:
    ```bash
    cd CometBrowserMobile/comet_ai
    ```
2.  Install dependencies:
    ```bash
    flutter pub get
    ```
3.  Run on an emulator or device:
    ```bash
    flutter run
    ```

## 📥 Submitting a Pull Request

1.  **Commit your changes** with clear, descriptive messages:
    ```bash
    git commit -m "Fix: Resolve splash screen freeze on Android"
    ```
2.  **Push to your fork**:
    ```bash
    git push origin feature/amazing-new-feature
    ```
3.  **Open a Pull Request** (PR) on the main repository.
    *   Reference any issues your PR fixes (e.g., "Fixes #123").
    *   Provide screenshots or videos for UI changes.

## 🎨 Code Style

-   **TypeScript/JavaScript**: We follow standard React/Next.js best practices.
-   **Flutter**: We follow standard Dart linting rules.
-   **Commits**: Use semantic commit messages if possible (e.g., `feat:`, `fix:`, `docs:`, `style:`, `refactor:`).

## ❓ Need Help?

If you have questions, feel free to contact us via the official website at [https://browser.ponsrischool.in](https://browser.ponsrischool.in).

Thank you for contributing! 🚀
