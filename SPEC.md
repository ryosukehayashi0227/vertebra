# Vertebra Technical Specifications

## 1. Product Overview

Vertebra is a distraction-free outline editor designed for long-form writing. It uses local Markdown files as its storage format, preserving plain text compatibility while offering a rich outline editing experience.

### Core Philosophy
- **Structure First**: Writing usually starts with an outline, then expands to content.
- **Local First**: User data belongs to the user, stored in standard formats (Markdown).
- **Fluidity**: Operations like reordering, indenting, and focusing should be seamless.

## 2. Architecture

### Technology Stack
- **Framework**: Tauri v2
- **Backend (Rust)**: Handles File System access, Window management, Native Menus.
- **Frontend (React)**: Handles UI, State Management, Outline Logic.
- **Build Tool**: Vite

### Data Structure (Runtime)
The application maintains a tree structure in memory (`OutlineNode[]`) which is parsed from and serialized back to Markdown.

```typescript
interface OutlineNode {
    id: string;        // Unique internal ID
    text: string;      // Node title (list item text)
    content: string;   // Body content (nested text)
    level: number;     // Indentation depth
    children: OutlineNode[];
    collapsed?: boolean;
}
```

### File Format (Markdown)
- **Hierarchy**: Represented by standard Markdown lists (`- Item`).
- **Body Content**: Represented by text indented deeper than the list item.
- **Escape Handling**: Lines starting with `- ` within body content are escaped as `\- ` and unescaped on load.

## 3. Implemented Features

### File Management
- **Open Folder**: Read directory contents (recursively or flat listing).
- **CRUD**: Create, Read, Update, Delete Markdown files.
- **Native Menus**: File, Edit, View, Window menus fully integrated.

- **Outline Operations**:
  - [x] Parsing: Advanced parser that distinguishes body content from child nodes based on indentation.
  - [x] Drag & Drop: Mouse-event based implementation with visual feedback.
  - [x] Node Deletion: Recursive deletion of nodes and children with native asynchronous confirmation.
  - [x] Undo/Redo: Global history management for all operations (Delete, Move, Indent, Outdent, Text Editing) with 500ms debounce for text changes.
  - [x] Keyboard Shortcuts: Common text editing and history shortcuts tailored for outline mode.
- **Search & Filter**:
  - Recursive filtering of nodes based on title and body content.
  - Automatic expansion of ancestor nodes to preserve context.
  - **Highlighting**: Visual highlighting of matching nodes.
- **Clipboard**:
  - "Copy as Text" context menu action to serialize subtree to indented text.

### Editor Features
- **Line Numbers**: Displays logical line numbers in a left-side gutter, synced with content.
- **Writing Statistics**: 
  - Node-level character counts displayed in sidebar.
  - Document-level character and word counts in bottom status bar.
  - Real-time updates as user types.

### UX Enhancements
- **View Switching**: Sidebar automatically toggles between File List and Outline View based on context.
- **Workflow**: Guided steps for new users (Open Folder -> Select File -> Edit).

### Customization & Persistence
- **Sidebar**: Resizable width, persisting to `localStorage`.
- **Typography**: Global font size adjustment (Zoom In/Out), persisting to `localStorage` via CSS variables.

### Internationalization (i18n)
- **Language Support**: English (en) and Japanese (ja).
- **Auto-detection**: Checks `localStorage` -> `navigator.language` -> Default (en).
- **Architecture**:
  - Frontend (`LanguageContext`): Manages UI strings using resource files.
  - Backend (Tauri): Dynamic menu rebuilding initiated by frontend events.

## 4. Testing Strategy

### Unit Testing (`src/lib/*.test.ts`)
- **Focus**: Pure logic functions (parsing, serialization, tree manipulation).
- **Tool**: Vitest.
- **Coverage Goal**: >80% for core logic.

### Component Testing (`src/components/*.test.tsx`)
- **Focus**: UI state transitions, Render logic, Event handling.
- **Tool**: Vitest + React Testing Library.
- **Mocking**: Tauri APIs are mocked in `src/test/setup.ts`.

### E2E Testing (`e2e/*.spec.ts`)
- **Focus**: Critical user journeys, Integration reliability.
- **Tool**: Playwright.
- **Scope**: App launch, Navigation, Basic UI interactions.

## 5. Future Roadmap

- [ ] **Focus Mode**: Zoom into a specific node and its subtree.
- [ ] **Rich Text Editing**: Enhanced formatting (Bold, Italic, Links via Tiptap).
- [ ] **Global Search**: Search across all files in the open folder.
- [ ] **Export**: Export to PDF, DOCX, etc.
- [ ] **Theming**: User-customizable themes and color schemes.
