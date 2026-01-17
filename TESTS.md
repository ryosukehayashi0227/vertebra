# Vertebra Test Documentation

## Unit Tests (142 tests)

### App.test.tsx (3 tests)
| Test Name | Description |
|-----------|-------------|
| should restore folder from localStorage on mount | Restores folder path from localStorage |
| should restore file from localStorage on mount | Restores file path from localStorage |
| should not crash and remove invalid path from localStorage | Handles invalid paths gracefully |

---

### Editor.test.tsx (4 tests)
| Test Name | Description |
|-----------|-------------|
| renders save button by default | Save button is displayed by default |
| hides save button when hideSaveButton is true | Save button hidden when prop is set |
| renders node title input | Node title input is displayed |
| shows empty state when no node is selected | Empty state shown when no selection |

---

### Sidebar.test.tsx (12 tests)
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

---

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
