# Vertebra Test Documentation

## Unit Tests (215 tests)

### App.test.tsx (9 tests)
| Test Name | Description |
|-----------|-------------|
| should restore folder from localStorage on mount | Restores folder path from localStorage |
| should restore file from localStorage on mount | Restores file path from localStorage |
| should not crash and remove invalid path from localStorage | Handles invalid paths gracefully |
| should render without crashing | Basic rendering test |
| should show splash screen when no folder is open | Splash screen display |
| should have main layout structure | Checks for app container and wrappers |
| should not show export modal initially | Export modal initial state |
| should initialize with empty state | State initialization check |
| should render without errors | Error-free rendering check |

---

### Editor.test.tsx (14 tests)
| Test Name | Description |
|-----------|-------------|
| renders save button by default | Save button is displayed by default |
| hides save button when hideSaveButton is true | Save button hidden when prop is set |
| renders node title input | Node title input is displayed |
| shows empty state when no node is selected | Empty state shown when no selection |
| renders RichEditor component | Content editor area is rendered |
| calls onOutlineChange when title is edited | Title changes trigger update callback |
| updates title input value when typing | Title input state management |
| calls onSave when save button is clicked | Save button triggers callback |
| disables save button when document is not dirty | Save button state management |
| enables save button when document is dirty | Save button state management |
| shows keyboard shortcut hint in save button | Keyboard shortcut hint display |
| updates when different node is selected | content updates on node selection change |
| shows empty state when selectedNodeId is null | Empty state handling |
| renders content in RichEditor | Content is passed to RichEditor |

---

### ExportModal.test.tsx (17 tests)
| Test Name | Description |
|-----------|-------------|
| renders when isOpen is true | Modal visibility |
| does not render when isOpen is false | Modal visibility |
| displays modal title and description | Content rendering |
| calls onClose when cancel/overlay clicked | Closing behavior |
| does not close when clicking content | Overlay click propagation |
| shows export button with correct text | Button rendering |
| calls save dialog with correct parameters | DOCX export flow |
| invokes export_document with options | Backend integration |
| handles user cancellation (no file selected) | Cancel flow |
| shows success message after export | Success state |
| auto-closes modal after success | Auto-close behavior |
| displays error message when export fails | Error handling |
| re-enables export button after error | Error state recovery |
| clears states when closing | State cleanup |
| uses translation keys | i18n integration |

---

### Sidebar/ContextMenu.test.tsx (16 tests)
| Test Name | Description |
|-----------|-------------|
| renders at correct position | Positioning logic |
| has correct z-index | Stacking context |
| renders delete button for file type | File context menu options |
| calls onDeleteFile and onClose | File delete action |
| renders all outline menu options | Outline context menu options |
| calls onCopyAsText | Copy action |
| calls onIndent/onOutdent | Indentation actions |
| calls onDeleteNode | Node deletion action |
| shows "Open in Secondary Pane" conditionally | Split view option |
| applies correct styling | Menu styling |

---

### Sidebar/FileList.test.tsx (17 tests)
| Test Name | Description |
|-----------|-------------|
| renders list of files and folders | Rendering file items |
| renders correct icons | Icon differentiation |
| highlights selected file | Selection state |
| calls onNavigateToFolder | Folder navigation |
| calls onSelectFile | File selection |
| renders back button in subfolder | Navigation UI |
| navigates up when back button clicked | Parent navigation |
| renders new file button | File creation UI |
| handles file creation flow | Input, typing, submission |
| handles creation cancellation | Blur/empty behavior |
| calls onContextMenu for files | Right-click handling |

---

### Sidebar.test.tsx (25 tests)
| Test Name | Description |
|-----------|-------------|
| renders file list correctly | File list renders properly |
| calls onResizeStart when resizer is clicked | Resizer triggers callback |
| applies width style | Width style is applied |
| shows context menu and handles copy action | Context menu and copy functionality |
| filters outline nodes by search query | Search filters outline nodes |
| shows confirm dialog and calls onDeleteNode | Delete confirmation dialog works |
| displays character counts for outline nodes | Character counts are displayed |
| **Folder Navigation** | |
| calls onNavigateToFolder when folder is clicked | Folder click navigates into folder |
| shows back button when in subfolder | Back button visible in subfolder |
| hides back button at root level | Back button hidden at root |
| calls onNavigateUp when back button is clicked | Back button navigates to parent |
| applies folder class to directory items | Folder class applied correctly |
| **Split View** | |
| shows split view toggle button | Toggle button visibility |
| shows Open in Split View in context menu | Context menu integration |
| **Add Node** | |
| adds a new node when add button is clicked | Creation flow |
| **Collapse/Expand** | |
| renders collapse button | UI rendering |
| renders children when node is not collapsed | Tree structure rendering |
| **Settings** | |
| calls onOpenSettings | Settings interaction |
| **Sidebar Collapse** | |
| calls onToggleCollapse | Collapse interaction |
| applies collapsed class | Styling verification |
| **New Tests** | |
| switches to files view when isCreatingFile | View mode logic |
| switches to files view when folder opened | View mode logic |
| switches to outline view when file selected | View mode logic |
| calls onMoveNode when dragged and dropped | D&D interaction |
| shows empty hint when outline is empty | Empty state |
---

### SettingsModal.test.tsx (9 tests)
| Test Name | Description |
|-----------|-------------|
| does not render when isOpen is false | Modal visibility |
| renders when isOpen is true | Modal visibility |
| calls onClose when close button is clicked | Close button action |
| calls onClose when overlay is clicked | Overlay click action |
| displays theme options | Theme verification |
| displays language options | Language verification |
| switches theme when theme button is clicked | Theme switching |
| switches language when language button is clicked | Language switching |
| does not close when clicking modal content | Modal content click prevention |

---

### StatusBar.test.tsx (2 tests)
| Test Name | Description |
|-----------|-------------|
| renders character and word counts correctly | Count verification |
| displays translated labels | i18n label verification |

---

### RichEditor.test.tsx (4 tests)
| Test Name | Description |
|-----------|-------------|
| renders textarea with content | Content rendering |

---

### contexts/LanguageContext.test.tsx (4 tests)
| Test Name | Description |
|-----------|-------------|
| initializes with default language (en) | Default language |
| initializes with ja if navigator is ja | Browser language detection |
| respects localStorage over navigator | Persistence priority |
| changes language and persists | Language switching |

---

### contexts/ThemeContext.test.tsx (5 tests)
| Test Name | Description |
|-----------|-------------|
| defaults to auto theme | Default theme |
| switches to light theme | Light theme switch |
| switches to dark theme | Dark theme switch |
| persists theme to localStorage | Persistence |
| loads theme from localStorage on mount | Restoration |

---

### hooks/useDebounce.test.tsx (3 tests)
| Test Name | Description |
|-----------|-------------|
| should debounce history pushes | Debounce logic |
| should reset debounce timer on rapid changes | Timer reset |
| should allow multiple history entries with sufficient delays | Multi-entry logic |

---

### hooks/useSplitView.test.ts (18 tests)
| Test Name | Description |
|-----------|-------------|
| should initialize with split view disabled | Initial state |
| should restore split view state from localStorage | Restoration |
| should default to primary pane if localStorage invalid | Fallback logic |
| should toggle split view state | Toggle action |
| should set secondary node id and active pane | Open behavior |
| should enable split view if not already enabled | Auto-enable |
| should disable split view and clear secondary node | Close behavior |
| should persist split view state/pane/node | Persistence |
| should validation secondaryNodeId | Validation logic |
| should allow direct setting of state | Setters |

---

### hooks/useUndoRedo.test.ts (15 tests)
| Test Name | Description |
|-----------|-------------|
| should push current outline to undo stack | Push logic |
| should not push if outline is undefined | Guard clause |
| should clear redo stack on new action | Redo clear |
| should limit history to MAX_HISTORY | Stack limit |
| should restore previous outline state | Undo behavior |
| should do nothing if undo stack is empty | Empty stack guard |
| should push current state to redo stack on undo | Redo stack push |
| should restore next outline state | Redo behavior |
| should debounce history push | Debounce integration |
| should clear both stacks | Clear history |

---

### lib/fileSystem.test.ts (10 tests)
| Test Name | Description |
|-----------|-------------|
| openFolderDialog calls open | Dialog invocation |
| readDirectory calls invoke | Directory reading |
| readFile calls invoke | File reading |
| writeFile calls invoke | File writing |
| createFile calls invoke | File creation |
| deleteFile calls invoke | File deletion |
| renameFile calls invoke | File renaming |
| askConfirm calls ask | Confirmation dialog |

### outline.test.ts (47 tests)
| Category | Test Name |
|----------|-----------|
| **parseMarkdownToOutline** | |
| | should parse a simple markdown list |
| | should parse nested markdown lists |
| | should parse deeply nested lists |
| | should parse content (body text) for nodes |
| | should unescape \\- to - in body content |
| | should handle empty input |
| | should handle nodes with no text |
| **outlineToMarkdown** | |
| | should convert a simple outline to markdown |
| | should convert nested outlines to markdown with proper indentation |
| | should include body content with proper indentation |
| | should escape - at start of body content lines |
| | should handle multiline content |
| **Roundtrip** | |
| | should preserve simple lists through roundtrip |
| | should preserve nested lists through roundtrip |
| | should preserve body content with - through roundtrip |
| **createNode** | |
| | should create a node with the given text and level |
| | should create nodes with unique IDs |
| **findNodeById** | |
| | should find root level nodes |
| | should find child nodes |
| | should find deeply nested nodes |
| | should return null for non-existent IDs |
| **removeNode** | |
| | should remove a root level node |
| | should remove a nested node |
| | should return original tree if node not found |
| **insertNodeAfter** | |
| | should insert a node after a specified node at root level |
| **appendChildNode** | |
| | should add a child to a parent node |
| **indentNode** | |
| | should indent a node to become child of previous sibling |
| | should not indent the first node (no previous sibling) |
| **outdentNode** | |
| | should outdent a node to become sibling of parent |
| | should not outdent root level nodes |
| **moveNode** | |
| | should move node before target at root level |
| | should move node after target at root level |
| | should move node inside target as child |
| | should not move node onto itself |
| | should not move parent into its own descendant |
| | should move nested node to root level |
| | should move node into nested target |
| **serializeNodesToText** | |
| | should serialize nodes with correct indentation |
| | should respect baseLevel for partial tree copy |
| **filterNodes** | |
| | should match node by text |

---

## E2E Tests (23 tests)

### basic.spec.ts (9 tests)
| Test Name | Description |
|-----------|-------------|
| **Welcome Screen** | |
| should display welcome message with workflow steps | Welcome screen with workflow displayed |
| should have visible sidebar with view selector | Sidebar and view selector visible |
| **Sidebar Navigation** | |
| should show open folder button in sidebar | Open folder button when no folder selected |
| should have collapsible sidebar | Sidebar can be collapsed |
| **UI Elements** | |
| should have proper layout structure | Layout structure is correct |
| should display step indicators with correct styling | Step indicators styled correctly |
| **Keyboard Navigation** | |
| should respond to keyboard shortcuts | Keyboard shortcuts work |
| **Responsive Design** | |
| should work on smaller screens | Works on small screens |
| should work on larger screens | Works on large screens |

---

### folder-navigation.spec.ts (5 tests)
| Test Name | Description |
|-----------|-------------|
| Navigate into subfolder | Navigate into a subfolder |
| Navigate back to parent folder | Navigate back to parent |
| Create file in subfolder | Create file in subfolder |
| Cannot navigate above root folder | Cannot go above root |
| File list updates correctly after navigation | File list updates after navigation |

---

### functional.spec.ts (2 tests)
| Test Name | Description |
|-----------|-------------|
| File Management Flow | Complete file management flow |
| Outline & Search Flow | Outline and search functionality |

---

### persistence.spec.ts (7 tests)
| Test Name | Description |
|-----------|-------------|
| Session restoration - folder path and selected file | Restores folder and file |
| Session restoration - selected node | Restores selected node |
| Sidebar width persistence | Sidebar width is persisted |
| Split view state persistence | Split view state is persisted |
| Theme persistence | Theme setting is persisted |
| Language persistence | Language setting is persisted |
| No session - starts fresh | Starts fresh without session |

---

## Commands

```bash
# Run unit tests
npm test

# Run unit tests (watch mode)
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests (UI mode)
npm run test:e2e:ui
```
