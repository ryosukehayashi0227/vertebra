# Vertebra

A distraction-free outline editor dedicated to writing, built with Tauri for macOS and Windows.
"Structure Your Thoughts" - providing a beautiful, fast, and fluid writing experience.

## Project Goal
Support the creation of long-form writing structures and idea organization, aiming for a highly versatile tool based on local Markdown file storage.

## Tech Stack
- **Core:** [Tauri v2](https://tauri.app/) (Rust)
- **Frontend:** [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Bundler:** [Vite](https://vitejs.dev/)

## Current Progress
- [x] Initial project setup (Tauri + React + TS)
- [x] Tailwind CSS v4 integration
- [x] Basic UI (Sidebar + Editor) construction
- [x] Markdown list syntax parsing and rendering
- [ ] Local file system integration (Tauri API)
- [ ] Outline editing and reordering functionality
- [ ] File save functionality

## Getting Started

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run tauri dev
```

### Build
```bash
npm run tauri build
```

## Recommended IDE Setup
- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
