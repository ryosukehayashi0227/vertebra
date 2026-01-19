# Vertebra

A distraction-free outline editor dedicated to writing, built with Tauri for macOS and Windows.
"Structure Your Thoughts" - providing a beautiful, fast, and fluid writing experience.

## Features

- **Local Markdown Management**: Open folders, create/read/update/delete Markdown files.
  - **Folder Navigation**: Navigate into subfolders, create files in current directory, and navigate back to parent folders.
- **Outline Editing**: 
  - Parse Markdown lists as outline nodes.
  - **Enhanced Drag & Drop**: smooth reordering with ghost element feedback and auto-expansion of collapsed nodes on hover.
  - Indent/Outdent operations.
  - **Node Deletion**: Recursive deletion with async native confirmation dialogs.
  - **Undo/Redo Support**: Global history for all operations including text editing (`Cmd+Z`, `Cmd+Shift+Z`) with intelligent debouncing.
  - **Advanced Search**: Filter outline nodes with real-time highlighting.
  - **Data Portability**: Copy outline as plain text (with hierarchy preserved).
- **Writing Tools**:
  - **Line Numbers**: Visual gutter displaying logical line numbers with clear separation from content.
  - **Writing Statistics**: Real-time character and word counts at both node-level (sidebar) and document-level (status bar).
  - **Export**: Export documents as DOCX files (Cmd+Shift+E). Convert to PDF using Word/Pages.
- **UI/UX**:
  - **Internationalization (i18n)**: English and Japanese support (auto-detect OS language).
  - **Granular Font Size**: Adjustable text size (Zoom In/Out) persisting across sessions.
  - **Resizable Sidebar**: Draggable sidebar width with state persistence.
  - **Workflow**: Guided welcome screen for new users.
  - **Split View**: Multi-pane editing with independent scroll and node selection. State is restored across sessions.
  - **Theme Support**: Light, Dark, and System modes. 
  - **Auto-switching sidebar views**: Automatically toggles between Files and Outline based on context.
  - **Native application menus**: File, Edit, View, Window menus with dynamic language updates.
  - **Settings**: Dedicated settings modal accessible via Menu or Sidebar.

## Tech Stack
- **Core:** [Tauri v2](https://tauri.app/) (Rust)
- **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Data:** Plain Markdown files
- **Testing:** Vitest (Unit/Component), Playwright (E2E)
- **Styling:** Modular CSS + Tailwind CSS (App structure)

### Platform-Specific Setup

#### 🍎 macOS
1. **Install Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```
2. **Install Rust**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

#### 🐧 Linux / WSL (Ubuntu)
1. **Install System Dependencies**:
   ```bash
   sudo apt update && sudo apt install -y \
     libwebkit2gtk-4.1-dev \
     build-essential \
     curl \
     wget \
     file \
     libxdo-dev \
     libssl-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev
   ```
2. **Install Rust**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
   *Note: After installation, run `source "$HOME/.cargo/env"` or restart your terminal.*

### Installation
```bash
npm install
```

### Development
```bash
npm run tauri dev
```

### Build
```bash
npm run tauri build
```

---

## 🍎 Running the app on macOS (Unsigned App)

Since this app is unsigned, you may see a warning saying "it's damaged and can't be opened" on the first launch. In such cases, please try the following steps:

1. **Right-click (Control + click)** the app in the "Applications" folder and select **"Open"**.
2. Click **"Open"** again in the dialog that appears.

If the above does not work, run the following command in the terminal:
```bash
xattr -rc /Applications/vertebra.app
```

## Testing

Vertebra uses a comprehensive testing strategy combining Unit, Component, and E2E tests.

### Unit & Component Tests (Vitest)
Tests core logic (markdown parsing, tree operations) and UI components.

```bash
# Run all unit/component tests
npm test

# Watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### E2E Tests (Playwright)
Tests the full application flow including Tauri integration.

**First time setup:**
```bash
npx playwright install chromium
```

**Run tests:**
```bash
# Run E2E tests (headless)
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

## Documentation

This project includes comprehensive documentation to help developers and AI agents understand and contribute to the codebase.

### 📋 [SPEC.md](SPEC.md)
**Technical Specifications** - Detailed architectural documentation covering:
- Product overview and core philosophy
- Technology stack and data structures
- Implemented features and their specifications
- File format (Markdown) and outline structure
- Component architecture and state management

### 🧪 [TESTS.md](TESTS.md)
**Test Documentation** - Complete test suite reference:
- Unit test catalog (261 tests across 20 files)
- E2E test scenarios (37 tests)
- Test commands and usage
- Coverage reports and success metrics

### 🤖 [AGENTS.md](AGENTS.md)
**AI Agent Collaboration Guide** - Guidelines for AI coding assistants:
- Development workflow and conventions
- Code organization and patterns
- Testing requirements and mocking strategies
- Common issues and solutions
- Quick reference for commands and defaults

### 🔄 [REFACTORING_HANDOFF.md](REFACTORING_HANDOFF.md)
**Refactoring History** - Documentation of major refactoring efforts:
- Custom hooks extraction (useFontSize, useSidebarResize, etc.)
- Code reduction and maintainability improvements
- Test results and verification

### Additional Resources
- **README.md** (this file) - Getting started, features, and setup
- **package.json** - Dependencies and npm scripts
- **tsconfig.json** - TypeScript configuration

## Recommended IDE Setup
- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
