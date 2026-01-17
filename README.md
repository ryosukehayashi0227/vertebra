# Vertebra

A distraction-free outline editor dedicated to writing, built with Tauri for macOS and Windows.
"Structure Your Thoughts" - providing a beautiful, fast, and fluid writing experience.

## Features

- **Local Markdown Management**: Open folders, create/read/update/delete Markdown files.
- **Outline Editing**: 
  - Parse Markdown lists as outline nodes.
  - Drag & Drop reordering (supporting nested structures).
  - Indent/Outdent operations.
  - **Node Deletion**: Recursive deletion with async native confirmation dialogs.
  - **Undo/Redo Support**: Global history for all operations including text editing (`Cmd+Z`, `Cmd+Shift+Z`) with intelligent debouncing.
  - **Advanced Search**: Filter outline nodes with real-time highlighting.
  - **Data Portability**: Copy outline as plain text (with hierarchy preserved).
- **Writing Tools**:
  - **Line Numbers**: Visual gutter displaying logical line numbers in the editor.
  - **Writing Statistics**: Real-time character and word counts at both node-level (sidebar) and document-level (status bar).
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
- **Styling:** Vanilla CSS + Tailwind CSS (App structure)

## Getting Started

### Prerequisites
- Node.js & npm
- Rust & Cargo (for Tauri)

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

## 🍎 For macOS Users

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

## Recommended IDE Setup
- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
