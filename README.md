# Vertebra

A distraction-free outline editor dedicated to writing, built with Tauri for macOS and Windows.
"Structure Your Thoughts" - providing a beautiful, fast, and fluid writing experience.

## Features

- **Local Markdown Management**: Open folders, create/read/update/delete Markdown files.
- **Outline Editing**: 
  - Parse Markdown lists as outline nodes.
  - Drag & Drop reordering (supporting nested structures).
  - Indent/Outdent operations.
  - **Advanced Search**: Filter outline nodes with real-time highlighting.
  - **Data Portability**: Copy outline as plain text (with hierarchy preserved).
- **UI/UX**:
  - **Internationalization (i18n)**: English and Japanese support (auto-detect OS language).
  - **Granular Font Size**: Adjustable text size (Zoom In/Out) persisting across sessions.
  - **Resizable Sidebar**: Draggable sidebar width with state persistence.
  - **Workflow**: Guided welcome screen for new users.
  - Auto-switching sidebar views (Files / Outline).
  - Native application menus (File, Edit, View, Window) with dynamic language updates.

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
